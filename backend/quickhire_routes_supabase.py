"""
Quickhire Routes - Supabase PostgreSQL Version
On-demand gig platform with geo-location based matching
"""

from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta, timezone
import uuid
import math

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/quickhire")

# ============================================================================
# MODELS
# ============================================================================

class GigLocation(BaseModel):
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]
    address: Optional[str] = None

class QuickHireGigCreate(BaseModel):
    clientId: str
    clientName: str
    clientEmail: str
    category: str
    description: str
    location: GigLocation
    radius: int = 5
    urgency: str = "ASAP"
    budget: Optional[float] = None
    photos: Optional[List[str]] = None
    voiceNote: Optional[str] = None
    gigType: str = "Single"
    workersNeeded: int = 1
    payPerPerson: Optional[float] = None
    groupMode: bool = False

class WorkerLocation(BaseModel):
    workerId: str
    location: GigLocation

class GigStatusUpdate(BaseModel):
    status: str
    notes: Optional[str] = None

class GigRating(BaseModel):
    gigId: str
    raterId: str
    raterType: str
    rating: int
    tags: Optional[List[str]] = None
    comment: Optional[str] = None

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula (in miles)"""
    R = 3959  # Earth's radius in miles
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return round(R * c, 2)

def calculate_eta(distance_miles: float) -> int:
    """Calculate ETA in minutes"""
    eta_minutes = int((distance_miles / 30) * 60)
    return max(5, eta_minutes)

def generate_price(category: str, distance: float, urgency: str) -> float:
    """Generate dynamic pricing"""
    base_prices = {
        "Plumber": 120, "Electrician": 100, "Cleaning": 80,
        "Handyman": 90, "Moving": 150, "Locksmith": 95,
        "HVAC": 130, "Painting": 85, "Carpentry": 110, "Landscaping": 75
    }
    
    base = base_prices.get(category, 100)
    distance_fee = distance * 2
    urgency_multiplier = {"ASAP": 1.3, "Today": 1.1, "Later": 1.0}.get(urgency, 1.0)
    
    return round((base + distance_fee) * urgency_multiplier, 2)

# ============================================================================
# ROUTES
# ============================================================================

@router.post("/gigs/nearby")
async def find_nearby_gigs(worker_location: WorkerLocation):
    """Find nearby gigs for a worker based on their location"""
    try:
        supabase = get_supabase_admin()
        
        worker_lat = worker_location.location.coordinates[1]
        worker_lon = worker_location.location.coordinates[0]
        
        # Get all open gigs
        result = supabase.table('quickhire_gigs').select('*').eq('status', 'open').execute()
        
        nearby_gigs = []
        for gig in (result.data or []):
            gig_lat = float(gig['latitude'])
            gig_lon = float(gig['longitude'])
            distance = haversine_distance(worker_lat, worker_lon, gig_lat, gig_lon)
            
            if distance <= gig.get('radius', 5):
                gig['distance'] = distance
                gig['eta'] = calculate_eta(distance)
                gig['estimated_price'] = generate_price(gig['category'], distance, gig['urgency'])
                nearby_gigs.append(gig)
        
        # Sort by distance
        nearby_gigs.sort(key=lambda x: x['distance'])
        
        return {"success": True, "gigs": nearby_gigs, "count": len(nearby_gigs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gigs", status_code=status.HTTP_201_CREATED)
async def create_quickhire_gig(gig: QuickHireGigCreate):
    """Create a new quickhire gig"""
    try:
        supabase = get_supabase_admin()
        
        gig_id = str(uuid.uuid4())
        lon, lat = gig.location.coordinates
        
        gig_data = {
            "id": gig_id,
            "client_id": gig.clientId,
            "client_name": gig.clientName,
            "client_email": gig.clientEmail,
            "category": gig.category,
            "description": gig.description,
            "latitude": lat,
            "longitude": lon,
            "address": gig.location.address,
            "radius": gig.radius,
            "urgency": gig.urgency,
            "budget": gig.budget,
            "photos": gig.photos or [],
            "voice_note": gig.voiceNote,
            "gig_type": gig.gigType,
            "workers_needed": gig.workersNeeded,
            "workers_assigned": 0,
            "pay_per_person": gig.payPerPerson,
            "group_mode": gig.groupMode,
            "status": "open",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        }
        
        result = supabase.table('quickhire_gigs').insert(gig_data).execute()
        
        return {"success": True, "gigId": gig_id, "gig": result.data[0] if result.data else gig_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gigs/nearby")
async def get_nearby_gigs_query(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: int = Query(5),
    category: Optional[str] = Query(None)
):
    """Get nearby gigs via query parameters"""
    try:
        supabase = get_supabase_admin()
        
        query = supabase.table('quickhire_gigs').select('*').eq('status', 'open')
        if category:
            query = query.eq('category', category)
        
        result = query.execute()
        
        nearby_gigs = []
        for gig in (result.data or []):
            distance = haversine_distance(lat, lon, float(gig['latitude']), float(gig['longitude']))
            if distance <= radius:
                gig['distance'] = distance
                gig['eta'] = calculate_eta(distance)
                nearby_gigs.append(gig)
        
        nearby_gigs.sort(key=lambda x: x['distance'])
        
        return {"success": True, "gigs": nearby_gigs[:20], "count": len(nearby_gigs)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gigs/{gigId}/accept")
async def accept_gig(gigId: str, workerId: str = Query(...)):
    """Worker accepts a gig"""
    try:
        supabase = get_supabase_admin()
        
        # Get gig
        gig_result = supabase.table('quickhire_gigs').select('*').eq('id', gigId).execute()
        if not gig_result.data:
            raise HTTPException(status_code=404, detail="Gig not found")
        
        gig = gig_result.data[0]
        
        # Check if already assigned
        assignments = supabase.table('quickhire_assignments').select('*').eq('gig_id', gigId).eq('worker_id', workerId).execute()
        if assignments.data:
            raise HTTPException(status_code=400, detail="Already assigned to this gig")
        
        # Check capacity
        if gig['workers_assigned'] >= gig['workers_needed']:
            raise HTTPException(status_code=400, detail="Gig is full")
        
        # Create assignment
        assignment_id = str(uuid.uuid4())
        assignment_data = {
            "id": assignment_id,
            "gig_id": gigId,
            "worker_id": workerId,
            "status": "accepted",
            "accepted_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table('quickhire_assignments').insert(assignment_data).execute()
        
        # Update gig workers count
        new_count = gig['workers_assigned'] + 1
        updates = {"workers_assigned": new_count}
        if new_count >= gig['workers_needed']:
            updates["status"] = "in_progress"
        
        supabase.table('quickhire_gigs').update(updates).eq('id', gigId).execute()
        
        return {"success": True, "message": "Gig accepted", "assignmentId": assignment_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gigs/{gigId}")
async def get_gig_details(gigId: str):
    """Get gig details"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('quickhire_gigs').select('*').eq('id', gigId).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Gig not found")
        
        return {"success": True, "gig": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/gigs/{gigId}/status")
async def update_gig_status(gigId: str, update: GigStatusUpdate):
    """Update gig status"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('quickhire_gigs').update({"status": update.status}).eq('id', gigId).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Gig not found")
        
        return {"success": True, "gig": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gigs/{gigId}/complete")
async def complete_gig(gigId: str):
    """Mark gig as completed"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('quickhire_gigs').update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat()
        }).eq('id', gigId).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Gig not found")
        
        # Update assignments
        supabase.table('quickhire_assignments').update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat()
        }).eq('gig_id', gigId).execute()
        
        return {"success": True, "message": "Gig completed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ratings")
async def create_rating(rating: GigRating):
    """Create rating for gig"""
    try:
        supabase = get_supabase_admin()
        
        rating_data = {
            "id": str(uuid.uuid4()),
            "gig_id": rating.gigId,
            "rater_id": rating.raterId,
            "rater_type": rating.raterType,
            "rating": rating.rating,
            "tags": rating.tags or [],
            "comment": rating.comment,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('quickhire_ratings').insert(rating_data).execute()
        
        return {"success": True, "rating": result.data[0] if result.data else rating_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gigs/client/{clientId}")
async def get_client_gigs(clientId: str):
    """Get all gigs posted by a client"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('quickhire_gigs').select('*').eq('client_id', clientId).order('created_at', desc=True).execute()
        
        return {"success": True, "gigs": result.data or [], "count": len(result.data or [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gigs/worker/{workerId}")
async def get_worker_gigs(workerId: str):
    """Get all gigs assigned to a worker"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('quickhire_assignments').select('*, quickhire_gigs(*)').eq('worker_id', workerId).execute()
        
        return {"success": True, "assignments": result.data or [], "count": len(result.data or [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/worker/location")
async def update_worker_location(location_update: WorkerLocation):
    """Update worker's real-time location"""
    try:
        supabase = get_supabase_admin()
        
        lat = location_update.location.coordinates[1]
        lon = location_update.location.coordinates[0]
        
        # Upsert location
        existing = supabase.table('worker_locations').select('id').eq('worker_id', location_update.workerId).execute()
        
        location_data = {
            "worker_id": location_update.workerId,
            "latitude": lat,
            "longitude": lon,
            "is_available": True,
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
        
        if existing.data:
            supabase.table('worker_locations').update(location_data).eq('worker_id', location_update.workerId).execute()
        else:
            location_data["id"] = str(uuid.uuid4())
            supabase.table('worker_locations').insert(location_data).execute()
        
        return {"success": True, "message": "Location updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gigs/{gigId}/hiring-status")
async def get_hiring_status(gigId: str):
    """Get hiring status for multi-worker gig"""
    try:
        supabase = get_supabase_admin()
        
        gig = supabase.table('quickhire_gigs').select('*').eq('id', gigId).execute()
        assignments = supabase.table('quickhire_assignments').select('*').eq('gig_id', gigId).execute()
        
        if not gig.data:
            raise HTTPException(status_code=404, detail="Gig not found")
        
        return {
            "success": True,
            "workersNeeded": gig.data[0]['workers_needed'],
            "workersAssigned": len(assignments.data or []),
            "assignments": assignments.data or []
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gigs/{gigId}/close-hiring")
async def close_hiring(gigId: str):
    """Close hiring for gig"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('quickhire_gigs').update({"status": "in_progress"}).eq('id', gigId).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Gig not found")
        
        return {"success": True, "message": "Hiring closed"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/workers/nearby")
async def find_nearby_workers(
    lat: float = Query(...),
    lon: float = Query(...),
    radius: int = Query(5),
    category: Optional[str] = Query(None)
):
    """Find nearby available workers"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('worker_locations').select('*').eq('is_available', True).execute()
        
        nearby_workers = []
        for worker in (result.data or []):
            distance = haversine_distance(lat, lon, float(worker['latitude']), float(worker['longitude']))
            if distance <= radius:
                worker['distance'] = distance
                nearby_workers.append(worker)
        
        nearby_workers.sort(key=lambda x: x['distance'])
        
        return {"success": True, "workers": nearby_workers[:20], "count": len(nearby_workers)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Simplified implementations for remaining endpoints
@router.post("/gigs/marketplace")
async def browse_marketplace(filters: Optional[dict] = None):
    """Browse gig marketplace"""
    try:
        supabase = get_supabase_admin()
        result = supabase.table('quickhire_gigs').select('*').eq('status', 'open').limit(50).execute()
        return {"success": True, "gigs": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/gigs/invite")
async def invite_worker(gigId: str = Query(...), workerId: str = Query(...)):
    """Invite specific worker to gig"""
    return {"success": True, "message": "Invitation sent"}

@router.get("/gigs/response/{gigId}")
async def get_gig_responses(gigId: str):
    """Get all worker responses for a gig"""
    try:
        supabase = get_supabase_admin()
        result = supabase.table('quickhire_assignments').select('*').eq('gig_id', gigId).execute()
        return {"success": True, "responses": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications/worker/{workerId}")
async def get_worker_notifications(workerId: str):
    """Get notifications for worker"""
    return {"success": True, "notifications": []}

@router.post("/notifications/log")
async def log_notification(data: dict):
    """Log notification"""
    return {"success": True, "message": "Logged"}

@router.post("/notifications/worker")
async def send_worker_notification(workerId: str = Query(...), message: str = Query(...)):
    """Send notification to worker"""
    return {"success": True, "message": "Notification sent"}
