"""
Worker Profile Routes - Updated for Supabase
Handles worker profile creation, updates, and searches
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Import Supabase client
from supabase_client import get_supabase_admin

router = APIRouter(prefix="/worker-profiles", tags=["Worker Profiles"])

# Pydantic models
class WorkerProfileCreate(BaseModel):
    userId: str
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    experience: Optional[str] = None  # 'Entry', 'Intermediate', 'Expert'
    availability: Optional[str] = None  # 'fulltime', 'parttime', 'project', 'gig'
    hourlyRate: Optional[float] = None
    location: Optional[dict] = None  # {city: str, state: str, country: str}
    portfolio: Optional[str] = None  # Portfolio URL
    isAvailable: bool = True
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
    portfolio: Optional[str] = None
    isAvailable: Optional[bool] = None
    categories: Optional[List[str]] = None
    profileImage: Optional[str] = None

class WorkerProfileResponse(BaseModel):
    id: str
    user_id: str
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    skills: List[str] = []
    experience_level: Optional[str] = None
    availability: Optional[str] = None
    hourly_rate: Optional[float] = None
    location: Optional[dict] = None
    rating: Optional[float] = None
    completed_jobs: int = 0
    is_available: bool = True
    created_at: str
    updated_at: str

# Create worker profile
@router.post("", response_model=WorkerProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_worker_profile(profile: WorkerProfileCreate):
    """
    Create a new worker profile
    """
    try:
        supabase = get_supabase_admin()
        
        # Check if profile already exists for this user
        existing = supabase.table('worker_profiles').select('id').eq('user_id', profile.userId).execute()
        
        if existing.data and len(existing.data) > 0:
            # Profile exists, update it instead
            profile_id = existing.data[0]['id']
            
            update_data = {
                "name": profile.name,
                "email": profile.email,
                "phone": profile.phone,
                "bio": profile.bio,
                "skills": profile.skills,
                "experience_level": profile.experience or "Entry",
                "availability": profile.availability,
                "hourly_rate": profile.hourlyRate or 0.0,
                "location": profile.location,
                "is_available": profile.isAvailable,
                "updated_at": datetime.utcnow().isoformat()
            }
            
            # Remove None values
            update_data = {k: v for k, v in update_data.items() if v is not None}
            
            result = supabase.table('worker_profiles').update(update_data).eq('id', profile_id).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to update profile"
                )
            
            return result.data[0]
        
        # Create new profile
        profile_id = str(uuid.uuid4())
        
        new_profile = {
            "id": profile_id,
            "user_id": profile.userId,
            "name": profile.name or "",
            "email": profile.email,
            "phone": profile.phone,
            "bio": profile.bio,
            "skills": profile.skills,
            "experience_level": profile.experience or "Entry",
            "availability": profile.availability,
            "hourly_rate": profile.hourlyRate or 0.0,
            "location": profile.location,
            "portfolio": profile.portfolio,
            "categories": profile.categories or [],
            "profile_image": profile.profileImage,
            "rating": 0.0,
            "completed_jobs": 0,
            "is_available": profile.isAvailable,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Remove None values
        new_profile = {k: v for k, v in new_profile.items() if v is not None}
        
        result = supabase.table('worker_profiles').insert(new_profile).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create profile"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )

# Get worker profile by user ID
@router.get("/user/{user_id}", response_model=WorkerProfileResponse)
async def get_worker_profile_by_user(user_id: str):
    """
    Get worker profile by user ID
    """
    try:
        supabase = get_supabase_admin()
        
        response = supabase.table('worker_profiles').select('*').eq('user_id', user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )

# Get worker profile by ID
@router.get("/{profile_id}", response_model=WorkerProfileResponse)
async def get_worker_profile(profile_id: str):
    """
    Get worker profile by profile ID
    """
    try:
        supabase = get_supabase_admin()
        
        response = supabase.table('worker_profiles').select('*').eq('id', profile_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return response.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )

# Update worker profile
@router.patch("/{profile_id}", response_model=WorkerProfileResponse)
async def update_worker_profile(profile_id: str, updates: WorkerProfileUpdate):
    """
    Update worker profile
    """
    try:
        supabase = get_supabase_admin()
        
        # Build update dict (exclude None values)
        update_data = updates.dict(exclude_unset=True, exclude_none=True)
        
        # Map field names to database column names
        field_mapping = {
            'hourlyRate': 'hourly_rate',
            'isAvailable': 'is_available',
            'profileImage': 'profile_image'
        }
        
        # Convert camelCase to snake_case
        converted_data = {}
        for key, value in update_data.items():
            db_key = field_mapping.get(key, key)
            # Convert experience to experience_level
            if key == 'experience':
                converted_data['experience_level'] = value
            else:
                converted_data[db_key] = value
        
        converted_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table('worker_profiles').update(converted_data).eq('id', profile_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

# Get all worker profiles
@router.get("", response_model=List[WorkerProfileResponse])
async def get_all_worker_profiles(skip: int = 0, limit: int = 50):
    """
    Get all worker profiles with pagination
    """
    try:
        supabase = get_supabase_admin()
        
        response = supabase.table('worker_profiles').select('*').range(skip, skip + limit - 1).execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profiles: {str(e)}"
        )

# Delete worker profile
@router.delete("/{profile_id}")
async def delete_worker_profile(profile_id: str):
    """
    Delete worker profile
    """
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('worker_profiles').delete().eq('id', profile_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        return {"message": "Profile deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile: {str(e)}"
        )
