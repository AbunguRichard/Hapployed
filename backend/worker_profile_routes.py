from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api")

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['hapployed']
worker_profiles_collection = db['worker_profiles']

# Pydantic models
class WorkerProfileCreate(BaseModel):
    userId: str
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    experience: Optional[str] = None  # 'entry', 'mid', 'senior', 'expert'
    availability: Optional[str] = None  # 'fulltime', 'parttime', 'project', 'gig'
    hourlyRate: Optional[float] = None
    location: Optional[dict] = None  # {city: str, state: str, country: str, zipCode: str}
    portfolio: Optional[List[dict]] = []  # [{title: str, description: str, imageUrl: str, link: str}]
    education: Optional[List[dict]] = []
    certifications: Optional[List[str]] = []
    languages: Optional[List[str]] = []
    workHistory: Optional[List[dict]] = []
    isAvailable: bool = True
    badges: Optional[List[str]] = []  # ['gov-verified', 'pro-verified']
    categories: Optional[List[str]] = []
    profileImage: Optional[str] = None

class WorkerProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[str] = None
    availability: Optional[str] = None
    hourlyRate: Optional[float] = None
    location: Optional[dict] = None
    portfolio: Optional[List[dict]] = None
    education: Optional[List[dict]] = None
    certifications: Optional[List[str]] = None
    languages: Optional[List[str]] = None
    workHistory: Optional[List[dict]] = None
    isAvailable: Optional[bool] = None
    badges: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    profileImage: Optional[str] = None

class WorkerProfileResponse(BaseModel):
    id: str
    userId: str
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    experience: Optional[str] = None
    availability: Optional[str] = None
    hourlyRate: Optional[float] = None
    location: Optional[dict] = None
    portfolio: List[dict] = []
    education: List[dict] = []
    certifications: List[str] = []
    languages: List[str] = []
    workHistory: List[dict] = []
    isAvailable: bool = True
    badges: List[str] = []
    categories: List[str] = []
    profileImage: Optional[str] = None
    rating: Optional[float] = None
    reviewCount: int = 0
    completedJobs: int = 0
    createdAt: str
    updatedAt: str

class WorkerSearchQuery(BaseModel):
    skills: Optional[List[str]] = None
    category: Optional[str] = None
    location: Optional[str] = None
    minRate: Optional[float] = None
    maxRate: Optional[float] = None
    availability: Optional[str] = None
    experience: Optional[str] = None
    badges: Optional[List[str]] = None
    isAvailable: Optional[bool] = None

# Helper function
def serialize_profile(profile) -> dict:
    profile['id'] = profile.pop('_id')
    profile['createdAt'] = profile.get('createdAt', datetime.utcnow().isoformat())
    profile['updatedAt'] = profile.get('updatedAt', datetime.utcnow().isoformat())
    return profile

# Create worker profile
@router.post("/worker-profiles", response_model=WorkerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_worker_profile(profile: WorkerProfileCreate):
    """
    Create a new worker profile
    """
    # Check if profile already exists for this user
    existing = await worker_profiles_collection.find_one({'userId': profile.userId})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists for this user"
        )
    
    profile_id = str(uuid.uuid4())
    profile_dict = profile.dict()
    profile_dict['_id'] = profile_id
    profile_dict['rating'] = None
    profile_dict['reviewCount'] = 0
    profile_dict['completedJobs'] = 0
    profile_dict['createdAt'] = datetime.utcnow().isoformat()
    profile_dict['updatedAt'] = datetime.utcnow().isoformat()
    
    try:
        await worker_profiles_collection.insert_one(profile_dict)
        created_profile = await worker_profiles_collection.find_one({'_id': profile_id})
        return serialize_profile(created_profile)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )

# Get all worker profiles (with search/filter)
@router.post("/worker-profiles/search", response_model=List[WorkerProfileResponse])
async def search_worker_profiles(query: WorkerSearchQuery, skip: int = 0, limit: int = 50):
    """
    Search worker profiles with filters
    """
    mongo_query = {}
    
    # Skills filter (match any skill)
    if query.skills and len(query.skills) > 0:
        mongo_query['skills'] = {'$in': query.skills}
    
    # Category filter
    if query.category:
        mongo_query['categories'] = query.category
    
    # Location filter (city or state)
    if query.location:
        mongo_query['$or'] = [
            {'location.city': {'$regex': query.location, '$options': 'i'}},
            {'location.state': {'$regex': query.location, '$options': 'i'}}
        ]
    
    # Rate filter
    if query.minRate is not None or query.maxRate is not None:
        rate_query = {}
        if query.minRate is not None:
            rate_query['$gte'] = query.minRate
        if query.maxRate is not None:
            rate_query['$lte'] = query.maxRate
        mongo_query['hourlyRate'] = rate_query
    
    # Availability filter
    if query.availability:
        mongo_query['availability'] = query.availability
    
    # Experience filter
    if query.experience:
        mongo_query['experience'] = query.experience
    
    # Badges filter
    if query.badges and len(query.badges) > 0:
        mongo_query['badges'] = {'$in': query.badges}
    
    # Availability status
    if query.isAvailable is not None:
        mongo_query['isAvailable'] = query.isAvailable
    
    try:
        cursor = worker_profiles_collection.find(mongo_query).skip(skip).limit(limit)
        profiles = await cursor.to_list(length=limit)
        return [serialize_profile(profile) for profile in profiles]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search profiles: {str(e)}"
        )

# Get worker profile by user ID
@router.get("/worker-profiles/user/{userId}", response_model=WorkerProfileResponse)
async def get_worker_profile_by_user(userId: str):
    """
    Get worker profile by user ID
    """
    profile = await worker_profiles_collection.find_one({'userId': userId})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return serialize_profile(profile)

# Get worker profile by ID
@router.get("/worker-profiles/{profileId}", response_model=WorkerProfileResponse)
async def get_worker_profile(profileId: str):
    """
    Get worker profile by profile ID
    """
    profile = await worker_profiles_collection.find_one({'_id': profileId})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return serialize_profile(profile)

# Update worker profile
@router.patch("/worker-profiles/{profileId}", response_model=WorkerProfileResponse)
async def update_worker_profile(profileId: str, profile_update: WorkerProfileUpdate):
    """
    Update worker profile
    """
    profile = await worker_profiles_collection.find_one({'_id': profileId})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data['updatedAt'] = datetime.utcnow().isoformat()
    
    try:
        await worker_profiles_collection.update_one(
            {'_id': profileId},
            {'$set': update_data}
        )
        updated_profile = await worker_profiles_collection.find_one({'_id': profileId})
        return serialize_profile(updated_profile)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

# Update profile by user ID
@router.patch("/worker-profiles/user/{userId}", response_model=WorkerProfileResponse)
async def update_worker_profile_by_user(userId: str, profile_update: WorkerProfileUpdate):
    """
    Update worker profile by user ID
    """
    profile = await worker_profiles_collection.find_one({'userId': userId})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data['updatedAt'] = datetime.utcnow().isoformat()
    
    try:
        await worker_profiles_collection.update_one(
            {'userId': userId},
            {'$set': update_data}
        )
        updated_profile = await worker_profiles_collection.find_one({'userId': userId})
        return serialize_profile(updated_profile)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

# Delete worker profile
@router.delete("/worker-profiles/{profileId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_worker_profile(profileId: str):
    """
    Delete worker profile
    """
    result = await worker_profiles_collection.delete_one({'_id': profileId})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return None

# Toggle availability
@router.post("/worker-profiles/{profileId}/toggle-availability", response_model=WorkerProfileResponse)
async def toggle_availability(profileId: str):
    """
    Toggle worker availability status
    """
    profile = await worker_profiles_collection.find_one({'_id': profileId})
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    new_status = not profile.get('isAvailable', True)
    
    try:
        await worker_profiles_collection.update_one(
            {'_id': profileId},
            {
                '$set': {
                    'isAvailable': new_status,
                    'updatedAt': datetime.utcnow().isoformat()
                }
            }
        )
        updated_profile = await worker_profiles_collection.find_one({'_id': profileId})
        return serialize_profile(updated_profile)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle availability: {str(e)}"
        )
