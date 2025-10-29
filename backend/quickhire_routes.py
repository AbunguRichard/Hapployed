from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os
import random

router = APIRouter(prefix="/api/quickhire")

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get('DB_NAME', 'test_database')]
quickhire_gigs_collection = db['quickhire_gigs']
quickhire_assignments_collection = db['quickhire_assignments']
quickhire_ratings_collection = db['quickhire_ratings']
worker_profiles_collection = db['worker_profiles']

# Pydantic Models
class GigLocation(BaseModel):
    type: str = "Point"  # GeoJSON type
    coordinates: List[float]  # [longitude, latitude]
    address: Optional[str] = None

class QuickHireGigCreate(BaseModel):
    clientId: str
    clientName: str
    clientEmail: str
    category: str  # e.g., "Plumber", "Electrician", "Cleaning"
    description: str
    location: GigLocation
    radius: int = 5  # miles
    urgency: str = "ASAP"  # ASAP, Today, Later, Within 1 hr, Same Day, Tomorrow
    budget: Optional[float] = None
    photos: Optional[List[str]] = None
    voiceNote: Optional[str] = None
    # Multiple Hire fields
    gigType: str = "Single"  # "Single" or "Multiple"
    workersNeeded: int = 1  # Number of workers needed (1-10+)
    payPerPerson: Optional[float] = None  # Pay per worker
    groupMode: bool = False  # If true, all workers must work together

class WorkerLocation(BaseModel):
    workerId: str
    location: GigLocation

class GigStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class GigRating(BaseModel):
    gigId: str
    raterId: str
    raterType: str  # "client" or "worker"
    rating: int  # 1-5
    tags: Optional[List[str]] = None
    comment: Optional[str] = None

# Helper functions
def calculate_mock_eta(distance_miles: float) -> int:
    """Mock ETA calculation based on distance"""
    # Assume average 30 mph in city
    eta_minutes = int((distance_miles / 30) * 60)
    return max(5, eta_minutes)  # Minimum 5 minutes

def calculate_mock_distance(loc1: List[float], loc2: List[float]) -> float:
    """Mock distance calculation (simplified)"""
    # Very simplified - in reality would use Haversine formula
    lat_diff = abs(loc1[1] - loc2[1])
    lon_diff = abs(loc1[0] - loc2[0])
    # Rough approximation: 1 degree ≈ 69 miles
    distance = ((lat_diff ** 2 + lon_diff ** 2) ** 0.5) * 69
    return round(distance, 2)

def generate_mock_price(category: str, distance: float, urgency: str) -> float:
    """Generate mock pricing based on factors"""
    base_prices = {
        "Plumber": 120,
        "Electrician": 100,
        "Cleaning": 80,
        "Handyman": 90,
        "Moving": 150,
        "Locksmith": 95,
        "HVAC": 130,
        "Painting": 85,
        "Carpentry": 110,
        "Landscaping": 75
    }
    
    base = base_prices.get(category, 100)
    distance_fee = distance * 2  # $2 per mile
    urgency_multiplier = {"ASAP": 1.3, "Today": 1.1, "Later": 1.0}.get(urgency, 1.0)
    
    total = (base + distance_fee) * urgency_multiplier
    return round(total, 2)

def serialize_gig(gig) -> dict:
    """Serialize MongoDB document"""
    if '_id' in gig:
        gig['id'] = gig.pop('_id')
    return gig

# Create QuickHire Gig
@router.post("/gigs", status_code=status.HTTP_201_CREATED)
async def create_quickhire_gig(gig: QuickHireGigCreate):
    """
    Client posts a QuickHire gig
    State: Draft → Posted → Dispatching
    """
    gig_id = str(uuid.uuid4())
    
    # Mock payment pre-authorization
    payment_preauth = {
        "status": "authorized",
        "authId": f"preauth_{str(uuid.uuid4())[:8]}",
        "amount": gig.budget or 0,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    gig_dict = gig.dict()
    gig_dict['_id'] = gig_id
    gig_dict['status'] = 'Posted'
    gig_dict['paymentPreauth'] = payment_preauth
    gig_dict['createdAt'] = datetime.utcnow().isoformat()
    gig_dict['updatedAt'] = datetime.utcnow().isoformat()
    gig_dict['dispatchedAt'] = None
    gig_dict['matchedAt'] = None
    gig_dict['completedAt'] = None
    
    # Handle Multiple Hire
    if gig.gigType == "Multiple":
        gig_dict['assignedWorkers'] = []  # List of worker IDs
        gig_dict['workersHired'] = 0  # Current count
        gig_dict['totalPayment'] = (gig.payPerPerson or 0) * gig.workersNeeded
        gig_dict['estimatedPrice'] = gig.payPerPerson or generate_mock_price(gig.category, gig.radius, gig.urgency)
    else:
        gig_dict['assignedWorkerId'] = None
        gig_dict['estimatedPrice'] = generate_mock_price(gig.category, gig.radius, gig.urgency)
    
    try:
        await quickhire_gigs_collection.insert_one(gig_dict)
        
        # Auto-transition to Dispatching
        await quickhire_gigs_collection.update_one(
            {'_id': gig_id},
            {
                '$set': {
                    'status': 'Dispatching',
                    'dispatchedAt': datetime.utcnow().isoformat()
                }
            }
        )
        
        created_gig = await quickhire_gigs_collection.find_one({'_id': gig_id})
        return serialize_gig(created_gig)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create gig: {str(e)}"
        )

# Get available gigs for workers (nearby)
@router.get("/gigs/nearby")
async def get_nearby_gigs(
    workerId: str,
    latitude: float,
    longitude: float,
    radius: int = 10
):
    """
    Workers see available QuickHire gigs nearby
    Filters by status=Dispatching and within radius
    """
    try:
        # Find gigs in Dispatching state
        cursor = quickhire_gigs_collection.find({
            'status': 'Dispatching'
        })
        
        gigs = await cursor.to_list(length=100)
        
        # Filter by distance (mock calculation)
        worker_location = [longitude, latitude]
        nearby_gigs = []
        
        for gig in gigs:
            gig_location = gig['location']['coordinates']
            distance = calculate_mock_distance(worker_location, gig_location)
            
            if distance <= radius:
                gig['distance'] = distance
                gig['eta'] = calculate_mock_eta(distance)
                nearby_gigs.append(serialize_gig(gig))
        
        # Sort by distance
        nearby_gigs.sort(key=lambda x: x['distance'])
        
        return nearby_gigs
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch nearby gigs: {str(e)}"
        )

# Worker accepts gig
@router.post("/gigs/{gigId}/accept")
async def accept_gig(gigId: str, workerId: str, workerLocation: GigLocation):
    """
    Worker accepts a QuickHire gig
    State: Dispatching → Matched → On-Route
    """
    gig = await quickhire_gigs_collection.find_one({'_id': gigId})
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    if gig['status'] != 'Dispatching':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gig is not available for acceptance (current status: {gig['status']})"
        )
    
    # Check if worker is eligible
    worker_profile = await worker_profiles_collection.find_one({'userId': workerId})
    
    # Calculate distance and ETA
    worker_coords = workerLocation.coordinates
    gig_coords = gig['location']['coordinates']
    distance = calculate_mock_distance(worker_coords, gig_coords)
    eta = calculate_mock_eta(distance)
    
    # Create assignment
    assignment_id = str(uuid.uuid4())
    assignment = {
        '_id': assignment_id,
        'gigId': gigId,
        'workerId': workerId,
        'workerName': worker_profile.get('name', 'Worker') if worker_profile else 'Worker',
        'workerProfile': {
            'name': worker_profile.get('name') if worker_profile else None,
            'rating': worker_profile.get('rating') if worker_profile else None,
            'profileImage': worker_profile.get('profileImage') if worker_profile else None
        } if worker_profile else None,
        'distance': distance,
        'eta': eta,
        'acceptedAt': datetime.utcnow().isoformat(),
        'currentLocation': workerLocation.dict()
    }
    
    try:
        await quickhire_assignments_collection.insert_one(assignment)
        
        # Handle Multiple Hire vs Single Hire
        if gig.get('gigType') == 'Multiple':
            # Add worker to assigned workers list
            assigned_workers = gig.get('assignedWorkers', [])
            
            # Check if worker already in list
            if workerId in assigned_workers:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Worker already accepted this gig"
                )
            
            assigned_workers.append(workerId)
            workers_hired = len(assigned_workers)
            workers_needed = gig.get('workersNeeded', 1)
            
            # Update gig with new worker
            update_data = {
                'assignedWorkers': assigned_workers,
                'workersHired': workers_hired,
                'updatedAt': datetime.utcnow().isoformat()
            }
            
            # If all positions filled, move to Matched
            if workers_hired >= workers_needed:
                update_data['status'] = 'Matched'
                update_data['matchedAt'] = datetime.utcnow().isoformat()
            elif workers_hired == 1:
                update_data['status'] = 'Partially-Matched'
            
            await quickhire_gigs_collection.update_one(
                {'_id': gigId},
                {'$set': update_data}
            )
        else:
            # Single hire logic (original)
            await quickhire_gigs_collection.update_one(
                {'_id': gigId},
                {
                    '$set': {
                        'status': 'Matched',
                        'matchedAt': datetime.utcnow().isoformat(),
                        'assignedWorkerId': workerId,
                        'assignmentId': assignment_id,
                        'distance': distance,
                        'eta': eta
                    }
                }
            )
            
            # Auto-transition to On-Route
            await quickhire_gigs_collection.update_one(
                {'_id': gigId},
                {
                    '$set': {
                        'status': 'On-Route',
                        'onRouteAt': datetime.utcnow().isoformat()
                    }
                }
            )
        
        updated_gig = await quickhire_gigs_collection.find_one({'_id': gigId})
        return serialize_gig(updated_gig)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept gig: {str(e)}"
        )

# Get single gig details
@router.get("/gigs/{gigId}")
async def get_gig(gigId: str):
    """
    Get detailed gig information with assignment details
    """
    gig = await quickhire_gigs_collection.find_one({'_id': gigId})
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    # Enrich with assignment details if matched
    if gig.get('assignmentId'):
        assignment = await quickhire_assignments_collection.find_one(
            {'_id': gig['assignmentId']}
        )
        if assignment:
            gig['assignment'] = serialize_gig(assignment)
    
    return serialize_gig(gig)

# Update gig status
@router.patch("/gigs/{gigId}/status")
async def update_gig_status(gigId: str, update: GigStatusUpdate):
    """
    Update gig status (for state transitions)
    Valid transitions: On-Route → Arrived → In-Progress → Complete
    """
    gig = await quickhire_gigs_collection.find_one({'_id': gigId})
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    # Validate status transition
    valid_transitions = {
        'On-Route': ['Arrived'],
        'Arrived': ['In-Progress'],
        'In-Progress': ['Complete'],
    }
    
    current_status = gig['status']
    new_status = update.status
    
    if current_status not in valid_transitions or new_status not in valid_transitions.get(current_status, []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition from {current_status} to {new_status}"
        )
    
    update_data = {
        'status': new_status,
        'updatedAt': datetime.utcnow().isoformat()
    }
    
    # Add timestamp for each status
    if new_status == 'Arrived':
        update_data['arrivedAt'] = datetime.utcnow().isoformat()
    elif new_status == 'In-Progress':
        update_data['inProgressAt'] = datetime.utcnow().isoformat()
    elif new_status == 'Complete':
        update_data['completedAt'] = datetime.utcnow().isoformat()
        # Mock payment capture
        update_data['paymentCapture'] = {
            'status': 'captured',
            'captureId': f"capture_{str(uuid.uuid4())[:8]}",
            'amount': gig.get('estimatedPrice', 0),
            'timestamp': datetime.utcnow().isoformat()
        }
        # Auto-transition to Paid
        update_data['status'] = 'Paid'
        update_data['paidAt'] = datetime.utcnow().isoformat()
    
    if update.notes:
        update_data['notes'] = update.notes
    
    try:
        await quickhire_gigs_collection.update_one(
            {'_id': gigId},
            {'$set': update_data}
        )
        
        updated_gig = await quickhire_gigs_collection.find_one({'_id': gigId})
        return serialize_gig(updated_gig)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status: {str(e)}"
        )

# Complete gig
@router.post("/gigs/{gigId}/complete")
async def complete_gig(gigId: str, workerId: str, proof: Optional[str] = None):
    """
    Worker marks gig as complete
    Captures payment and moves to Paid status
    """
    gig = await quickhire_gigs_collection.find_one({'_id': gigId})
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    if gig['status'] != 'In-Progress':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gig must be in In-Progress status to complete"
        )
    
    if gig.get('assignedWorkerId') != workerId:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only assigned worker can complete this gig"
        )
    
    update_data = {
        'status': 'Complete',
        'completedAt': datetime.utcnow().isoformat(),
        'proof': proof,
        'paymentCapture': {
            'status': 'captured',
            'captureId': f"capture_{str(uuid.uuid4())[:8]}",
            'amount': gig.get('estimatedPrice', 0),
            'timestamp': datetime.utcnow().isoformat()
        }
    }
    
    try:
        await quickhire_gigs_collection.update_one(
            {'_id': gigId},
            {'$set': update_data}
        )
        
        # Auto-transition to Paid
        await quickhire_gigs_collection.update_one(
            {'_id': gigId},
            {
                '$set': {
                    'status': 'Paid',
                    'paidAt': datetime.utcnow().isoformat()
                }
            }
        )
        
        updated_gig = await quickhire_gigs_collection.find_one({'_id': gigId})
        return serialize_gig(updated_gig)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete gig: {str(e)}"
        )

# Rate gig
@router.post("/ratings")
async def rate_gig(rating: GigRating):
    """
    Client or worker rates after gig completion
    """
    gig = await quickhire_gigs_collection.find_one({'_id': rating.gigId})
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    if gig['status'] not in ['Paid', 'Closed']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only rate completed and paid gigs"
        )
    
    rating_id = str(uuid.uuid4())
    rating_dict = rating.dict()
    rating_dict['_id'] = rating_id
    rating_dict['createdAt'] = datetime.utcnow().isoformat()
    
    try:
        await quickhire_ratings_collection.insert_one(rating_dict)
        
        # Check if both sides have rated, then close
        ratings = await quickhire_ratings_collection.find({'gigId': rating.gigId}).to_list(length=10)
        
        if len(ratings) >= 2:
            await quickhire_gigs_collection.update_one(
                {'_id': rating.gigId},
                {
                    '$set': {
                        'status': 'Closed',
                        'closedAt': datetime.utcnow().isoformat()
                    }
                }
            )
        
        return {'success': True, 'ratingId': rating_id}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit rating: {str(e)}"
        )

# Get client's gigs
@router.get("/gigs/client/{clientId}")
async def get_client_gigs(clientId: str):
    """
    Get all gigs posted by a client
    """
    try:
        cursor = quickhire_gigs_collection.find(
            {'clientId': clientId}
        ).sort('createdAt', -1)
        
        gigs = await cursor.to_list(length=100)
        
        # Enrich with assignment details
        enriched_gigs = []
        for gig in gigs:
            if gig.get('assignmentId'):
                assignment = await quickhire_assignments_collection.find_one(
                    {'_id': gig['assignmentId']}
                )
                if assignment:
                    gig['assignment'] = serialize_gig(assignment)
            enriched_gigs.append(serialize_gig(gig))
        
        return enriched_gigs
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch client gigs: {str(e)}"
        )

# Get worker's accepted gigs
@router.get("/gigs/worker/{workerId}")
async def get_worker_gigs(workerId: str):
    """
    Get all gigs accepted by a worker
    """
    try:
        cursor = quickhire_gigs_collection.find(
            {'assignedWorkerId': workerId}
        ).sort('createdAt', -1)
        
        gigs = await cursor.to_list(length=100)
        
        return [serialize_gig(gig) for gig in gigs]
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch worker gigs: {str(e)}"
        )

# Mock: Update worker location (for live tracking)
@router.post("/worker/location")
async def update_worker_location(location: WorkerLocation):
    """
    Mock endpoint for worker location updates
    In production, this would be called frequently for live tracking
    """
    # Find active gig for this worker
    gig = await quickhire_gigs_collection.find_one({
        'assignedWorkerId': location.workerId,
        'status': {'$in': ['On-Route', 'Arrived', 'In-Progress']}
    })
    
    if not gig:
        return {'success': True, 'message': 'No active gig'}
    
    # Update assignment location
    if gig.get('assignmentId'):
        gig_coords = gig['location']['coordinates']
        worker_coords = location.location.coordinates
        distance = calculate_mock_distance(worker_coords, gig_coords)
        eta = calculate_mock_eta(distance)
        
        await quickhire_assignments_collection.update_one(
            {'_id': gig['assignmentId']},
            {
                '$set': {
                    'currentLocation': location.location.dict(),
                    'distance': distance,
                    'eta': eta,
                    'lastUpdated': datetime.utcnow().isoformat()
                }
            }
        )
        
        # Auto-transition to Arrived if within geofence (0.05 miles ≈ 80 meters)
        if distance <= 0.05 and gig['status'] == 'On-Route':
            await quickhire_gigs_collection.update_one(
                {'_id': gig['_id']},
                {
                    '$set': {
                        'status': 'Arrived',
                        'arrivedAt': datetime.utcnow().isoformat()
                    }
                }
            )
    

# Get Multiple Hire Status
@router.get("/gigs/{gigId}/hiring-status")
async def get_hiring_status(gigId: str):
    """
    Get live hiring status for multiple hire gigs
    Shows how many workers accepted, their profiles, etc.
    """
    gig = await quickhire_gigs_collection.find_one({'_id': gigId})
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    if gig.get('gigType') != 'Multiple':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This endpoint is only for multiple hire gigs"
        )
    
    # Get all assignments for this gig
    assignments_cursor = quickhire_assignments_collection.find({'gigId': gigId})
    assignments = await assignments_cursor.to_list(length=100)
    
    # Enrich with worker profiles
    enriched_workers = []
    for assignment in assignments:
        worker_profile = await worker_profiles_collection.find_one(
            {'userId': assignment['workerId']}
        )
        enriched_workers.append({
            'workerId': assignment['workerId'],
            'workerName': assignment.get('workerName', 'Worker'),
            'status': 'Confirmed',  # Pending, Confirmed, On The Way
            'eta': assignment.get('eta'),
            'distance': assignment.get('distance'),
            'profile': {
                'name': worker_profile.get('name') if worker_profile else None,
                'rating': worker_profile.get('rating') if worker_profile else None,
                'completedJobs': worker_profile.get('completedJobs') if worker_profile else 0,
                'profileImage': worker_profile.get('profileImage') if worker_profile else None
            } if worker_profile else None,
            'acceptedAt': assignment.get('acceptedAt')
        })
    
    return {
        'gigId': gigId,
        'workersNeeded': gig.get('workersNeeded', 1),
        'workersHired': gig.get('workersHired', 0),
        'payPerPerson': gig.get('payPerPerson', 0),
        'totalPayment': gig.get('totalPayment', 0),
        'status': gig.get('status'),
        'groupMode': gig.get('groupMode', False),
        'workers': enriched_workers,
        'isFull': gig.get('workersHired', 0) >= gig.get('workersNeeded', 1)
    }

# Close Hiring (Manual)
@router.post("/gigs/{gigId}/close-hiring")
async def close_hiring(gigId: str):
    """
    Manually close hiring for a multiple hire gig
    """
    gig = await quickhire_gigs_collection.find_one({'_id': gigId})
    
    if not gig:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gig not found"
        )
    
    if gig.get('gigType') != 'Multiple':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This endpoint is only for multiple hire gigs"
        )
    
    # Move to Matched status and prevent more accepts
    await quickhire_gigs_collection.update_one(
        {'_id': gigId},
        {
            '$set': {
                'status': 'Matched',
                'matchedAt': datetime.utcnow().isoformat(),
                'hiringClosed': True
            }
        }
    )
    
    return {'success': True, 'message': 'Hiring closed successfully'}

    return {'success': True, 'gigId': gig['_id']}

# ============== UBER-LIKE WORKFLOW ENDPOINTS ==============

# Find nearby workers (Uber-style matching)
@router.post("/workers/nearby")
async def find_nearby_workers(data: dict):
    """
    Find available workers nearby for Uber-like matching
    Progressive radius: 2mi → 5mi → 15mi → marketplace
    """
    try:
        gig_id = data.get('gigId')
        category = data.get('category')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        radius = data.get('radius', 5)
        urgency = data.get('urgency', 'ASAP')
        
        if not latitude or not longitude:
            return {'workers': []}
        
        # Find workers with matching skills
        cursor = worker_profiles_collection.find({
            'skills': {'$in': [category]}
        })
        
        workers = await cursor.to_list(length=100)
        
        # Filter by distance and add distance/ETA info
        gig_location = [longitude, latitude]
        nearby_workers = []
        
        for worker in workers:
            # Assume worker has a location (in real app, this would be live)
            # For now, generate random locations within radius for demo
            worker_lat = latitude + (random.random() - 0.5) * (radius / 69)
            worker_lon = longitude + (random.random() - 0.5) * (radius / 69)
            worker_location = [worker_lon, worker_lat]
            
            distance = calculate_mock_distance(gig_location, worker_location)
            
            if distance <= radius:
                worker_data = serialize_gig(worker)
                worker_data['distance'] = f"{distance:.1f} mi"
                worker_data['eta'] = calculate_mock_eta(distance)
                worker_data['responseTime'] = "Avg 5 min response"
                worker_data['hourlyRate'] = worker.get('hourlyRate', 50)
                nearby_workers.append(worker_data)
        
        # Sort by distance
        nearby_workers.sort(key=lambda x: float(x['distance'].split()[0]))
        
        return {'workers': nearby_workers[:10]}  # Return top 10
    
    except Exception as e:
        print(f"Error finding nearby workers: {str(e)}")
        return {'workers': []}

# Post to marketplace (fallback when no nearby workers)
@router.post("/gigs/marketplace")
async def post_to_marketplace(gig_data: dict):
    """
    Post gig to general marketplace when no nearby workers found
    Returns broader list of workers from marketplace
    """
    try:
        category = gig_data.get('category')
        
        # Find all workers with matching skills (no location filter)
        cursor = worker_profiles_collection.find({
            'skills': {'$in': [category]}
        }).limit(20)
        
        workers = await cursor.to_list(length=20)
        
        # Enrich with mock data
        marketplace_workers = []
        for worker in workers:
            worker_data = serialize_gig(worker)
            worker_data['distance'] = "Remote"
            worker_data['responseTime'] = "Usually responds in 1 hour"
            worker_data['hourlyRate'] = worker.get('hourlyRate', 50)
            marketplace_workers.append(worker_data)
        
        return {'workers': marketplace_workers}
    
    except Exception as e:
        print(f"Error posting to marketplace: {str(e)}")
        return {'workers': []}

# Send gig invitation to worker
@router.post("/gigs/invite")
async def send_gig_invitation(data: dict):
    """
    Send gig invitation to specific worker
    Creates a pending invitation that worker can accept/decline
    """
    try:
        gig_id = data.get('gigId')
        worker_id = data.get('workerId')
        
        if not gig_id or not worker_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing gigId or workerId"
            )
        
        # Create invitation record
        invitation_id = str(uuid.uuid4())
        invitation = {
            '_id': invitation_id,
            'gigId': gig_id,
            'workerId': worker_id,
            'status': 'pending',  # pending, accepted, declined
            'sentAt': datetime.utcnow().isoformat(),
            'expiresAt': (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        }
        
        # Store invitation (you could create a separate collection for this)
        await db['gig_invitations'].insert_one(invitation)
        
        # In a real app, this would send a push notification to the worker
        
        return {
            'success': True,
            'invitationId': invitation_id,
            'message': 'Invitation sent to worker'
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send invitation: {str(e)}"
        )

# Check worker response to invitation
@router.get("/gigs/response/{gigId}")
async def check_worker_response(gigId: str):
    """
    Check if worker has responded to gig invitation
    Used for real-time polling
    """
    try:
        # Find invitation for this gig
        invitation = await db['gig_invitations'].find_one(
            {'gigId': gigId},
            sort=[('sentAt', -1)]  # Get most recent invitation
        )
        
        if not invitation:
            return {'status': 'no_invitation', 'message': 'No invitation found'}
        
        # Check if invitation expired
        expires_at = datetime.fromisoformat(invitation['expiresAt'])
        if datetime.utcnow() > expires_at:
            return {'status': 'expired', 'message': 'Invitation expired'}
        
        # Return current status
        return {
            'status': invitation['status'],  # pending, accepted, declined
            'workerId': invitation.get('workerId'),
            'respondedAt': invitation.get('respondedAt')
        }
    
    except Exception as e:
        return {'status': 'error', 'message': str(e)}


# ============== NOTIFICATION SYSTEM ENDPOINTS ==============

# Worker notifications endpoint
@router.get("/notifications/worker/{workerId}")
async def get_worker_notifications(workerId: str):
    """
    Get pending notifications for a worker
    """
    try:
        # Find unread notifications for this worker
        cursor = db['worker_notifications'].find({
            'workerId': workerId,
            'read': False
        }).sort('createdAt', -1).limit(10)
        
        notifications = await cursor.to_list(length=10)
        
        return [serialize_gig(notif) for notif in notifications]
    
    except Exception as e:
        print(f"Error fetching notifications: {str(e)}")
        return []

# Log notification event
@router.post("/notifications/log")
async def log_notification(data: dict):
    """
    Log that workers were notified about a gig
    """
    try:
        log_entry = {
            '_id': str(uuid.uuid4()),
            'gigId': data.get('gigId'),
            'workerIds': data.get('workerIds', []),
            'timestamp': data.get('timestamp', datetime.utcnow().isoformat()),
            'createdAt': datetime.utcnow().isoformat()
        }
        
        await db['notification_logs'].insert_one(log_entry)
        
        return {'success': True}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to log notification: {str(e)}"
        )

# Send notification to worker
@router.post("/notifications/worker")
async def send_worker_notification(data: dict):
    """
    Create a notification for a worker
    """
    try:
        notification = {
            '_id': str(uuid.uuid4()),
            'workerId': data.get('workerId'),
            'type': data.get('type', 'GIG_OFFER'),
            'payload': data.get('payload', {}),
            'read': False,
            'createdAt': datetime.utcnow().isoformat()
        }
        
        await db['worker_notifications'].insert_one(notification)
        
        return {'success': True, 'notificationId': notification['_id']}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}"
        )

# Send notification to client
@router.post("/notifications/client")
async def send_client_notification(data: dict):
    """
    Create a notification for a client
    """
    try:
        notification = {
            '_id': str(uuid.uuid4()),
            'clientId': data.get('clientId'),
            'type': data.get('type', 'WORKER_ACCEPTED'),
            'gigId': data.get('gigId'),
            'workerId': data.get('workerId'),
            'workerName': data.get('workerName'),
            'workerRating': data.get('workerRating'),
            'read': False,
            'createdAt': datetime.utcnow().isoformat()
        }
        
        await db['client_notifications'].insert_one(notification)
        
        return {'success': True, 'notificationId': notification['_id']}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(e)}"
        )

# Cancel worker notifications
@router.post("/notifications/cancel")
async def cancel_worker_notifications(data: dict):
    """
    Cancel notifications for workers (when gig is accepted by someone)
    """
    try:
        gig_id = data.get('gigId')
        exclude_worker_id = data.get('excludeWorkerId')
        
        # Mark notifications as cancelled
        result = await db['worker_notifications'].update_many(
            {
                'payload.gigId': gig_id,
                'workerId': {'$ne': exclude_worker_id},
                'read': False
            },
            {
                '$set': {
                    'read': True,
                    'cancelled': True,
                    'cancelledAt': datetime.utcnow().isoformat()
                }
            }
        )
        
        return {'success': True, 'cancelled': result.modified_count}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel notifications: {str(e)}"
        )

# Worker accepts gig endpoint
@router.post("/gigs/accept")
async def worker_accept_gig(data: dict):
    """
    Worker accepts a gig offer
    """
    try:
        gig_id = data.get('gigId')
        worker_id = data.get('workerId')
        
        if not gig_id or not worker_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing gigId or workerId"
            )
        
        # Check if gig is still available
        gig = await quickhire_gigs_collection.find_one({'_id': gig_id})
        
        if not gig:
            return {'success': False, 'message': 'Gig not found'}
        
        if gig.get('status') not in ['Posted', 'Dispatching']:
            return {'success': False, 'message': 'Gig no longer available'}
        
        # Get worker location (mock for now)
        worker_location = {
            'type': 'Point',
            'coordinates': gig['location']['coordinates']  # Use gig location for demo
        }
        
        # Use existing accept logic
        try:
            # Calculate distance and ETA
            worker_coords = worker_location['coordinates']
            gig_coords = gig['location']['coordinates']
            distance = calculate_mock_distance(worker_coords, gig_coords)
            eta = calculate_mock_eta(distance)
            
            # Create assignment
            assignment_id = str(uuid.uuid4())
            worker_profile = await worker_profiles_collection.find_one({'userId': worker_id})
            
            assignment = {
                '_id': assignment_id,
                'gigId': gig_id,
                'workerId': worker_id,
                'workerName': worker_profile.get('name', 'Worker') if worker_profile else 'Worker',
                'workerProfile': {
                    'name': worker_profile.get('name') if worker_profile else None,
                    'rating': worker_profile.get('rating') if worker_profile else None,
                    'profileImage': worker_profile.get('profileImage') if worker_profile else None
                } if worker_profile else None,
                'distance': distance,
                'eta': eta,
                'acceptedAt': datetime.utcnow().isoformat(),
                'currentLocation': worker_location
            }
            
            await quickhire_assignments_collection.insert_one(assignment)
            
            # Update gig to Matched status
            await quickhire_gigs_collection.update_one(
                {'_id': gig_id},
                {
                    '$set': {
                        'status': 'Matched',
                        'matchedAt': datetime.utcnow().isoformat(),
                        'assignedWorkerId': worker_id,
                        'assignmentId': assignment_id,
                        'distance': distance,
                        'eta': eta
                    }
                }
            )
            
            # Auto-transition to On-Route
            await quickhire_gigs_collection.update_one(
                {'_id': gig_id},
                {
                    '$set': {
                        'status': 'On-Route',
                        'onRouteAt': datetime.utcnow().isoformat()
                    }
                }
            )
            
            return {
                'success': True,
                'message': 'Gig accepted successfully!',
                'gigId': gig_id,
                'assignmentId': assignment_id
            }
            
        except Exception as e:
            print(f"Error accepting gig: {str(e)}")
            return {'success': False, 'message': str(e)}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to accept gig: {str(e)}"
        )

# Worker declines gig endpoint
@router.post("/gigs/decline")
async def worker_decline_gig(data: dict):
    """
    Worker declines a gig offer
    """
    try:
        gig_id = data.get('gigId')
        worker_id = data.get('workerId')
        reason = data.get('reason', 'not_interested')
        
        # Log the decline
        decline_log = {
            '_id': str(uuid.uuid4()),
            'gigId': gig_id,
            'workerId': worker_id,
            'reason': reason,
            'declinedAt': datetime.utcnow().isoformat()
        }
        
        await db['gig_declines'].insert_one(decline_log)
        
        # Mark notification as read
        await db['worker_notifications'].update_one(
            {
                'workerId': worker_id,
                'payload.gigId': gig_id,
                'read': False
            },
            {
                '$set': {
                    'read': True,
                    'declined': True
                }
            }
        )
        
        return {'success': True}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to decline gig: {str(e)}"
        )

# Get gig status (for client waiting interface)
@router.get("/quickhire/gigs/{gigId}/status")
async def get_gig_status_detailed(gigId: str):
    """
    Get detailed gig status for client waiting interface
    """
    try:
        gig = await quickhire_gigs_collection.find_one({'_id': gigId})
        
        if not gig:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Gig not found"
            )
        
        # Get notification log to see how many workers were notified
        notification_log = await db['notification_logs'].find_one({'gigId': gigId})
        workers_notified = len(notification_log.get('workerIds', [])) if notification_log else 0
        
        # Get assignment if matched
        assignment = None
        if gig.get('assignmentId'):
            assignment = await quickhire_assignments_collection.find_one({'_id': gig['assignmentId']})
            if assignment:
                assignment = serialize_gig(assignment)
        
        gig_data = serialize_gig(gig)
        gig_data['workersNotified'] = workers_notified
        gig_data['assignment'] = assignment
        
        return gig_data
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get gig status: {str(e)}"
        )

# Cancel gig search
@router.post("/quickhire/gigs/{gigId}/cancel")
async def cancel_gig_search(gigId: str, data: dict):
    """
    Cancel gig search
    """
    try:
        reason = data.get('reason', 'user_cancelled')
        
        # Update gig status to Cancelled
        await quickhire_gigs_collection.update_one(
            {'_id': gigId},
            {
                '$set': {
                    'status': 'Cancelled',
                    'cancelledAt': datetime.utcnow().isoformat(),
                    'cancelReason': reason
                }
            }
        )
        
        # Cancel all pending notifications
        await db['worker_notifications'].update_many(
            {'payload.gigId': gigId, 'read': False},
            {'$set': {'read': True, 'cancelled': True}}
        )
        
        return {'success': True}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to cancel gig: {str(e)}"
        )

# Reserve gig for worker (atomic operation)
@router.post("/gigs/reserve")
async def reserve_gig(data: dict):
    """
    Atomically reserve a gig for a worker
    """
    try:
        gig_id = data.get('gigId')
        worker_id = data.get('workerId')
        reserved_until = data.get('reservedUntil')
        
        # Try to reserve the gig (atomic update)
        result = await quickhire_gigs_collection.update_one(
            {
                '_id': gig_id,
                'status': {'$in': ['Posted', 'Dispatching']},
                'reservedBy': {'$exists': False}
            },
            {
                '$set': {
                    'reservedBy': worker_id,
                    'reservedUntil': reserved_until,
                    'reservedAt': datetime.utcnow().isoformat()
                }
            }
        )
        
        if result.modified_count > 0:
            return {'success': True}
        else:
            return {'success': False, 'message': 'Gig already reserved'}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reserve gig: {str(e)}"
        )

# Worker accepts/declines invitation
@router.post("/gigs/{gigId}/respond")
async def respond_to_invitation(gigId: str, data: dict):
    """
    Worker responds to gig invitation (accept/decline)
    """
    try:
        worker_id = data.get('workerId')
        response = data.get('response')  # 'accepted' or 'declined'
        
        if not worker_id or response not in ['accepted', 'declined']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid request"
            )
        
        # Find and update invitation
        result = await db['gig_invitations'].update_one(
            {'gigId': gigId, 'workerId': worker_id, 'status': 'pending'},
            {
                '$set': {
                    'status': response,
                    'respondedAt': datetime.utcnow().isoformat()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation not found or already responded"
            )
        
        return {
            'success': True,
            'message': f'Invitation {response}'
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to respond: {str(e)}"
        )

