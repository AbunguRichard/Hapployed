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
db = client['hapployed']
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
    urgency: str = "ASAP"  # ASAP, Today, Later
    budget: Optional[float] = None
    photos: Optional[List[str]] = None
    voiceNote: Optional[str] = None

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
    gig_dict['assignedWorkerId'] = None
    gig_dict['estimatedPrice'] = generate_mock_price(
        gig.category, 
        gig.radius, 
        gig.urgency
    )
    
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
        
        # Update gig status
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
    
    return {'success': True, 'gigId': gig['_id']}
