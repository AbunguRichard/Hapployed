"""
Profile Routes - Supabase PostgreSQL Version
User profile management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from supabase_client import get_supabase_admin

router = APIRouter(prefix="", tags=["Profile"])

# ============================================================================
# MODELS
# ============================================================================

class ProfileUpdate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None

# ============================================================================
# ROUTES
# ============================================================================

@router.put("/profile/update")
async def update_profile(profile: ProfileUpdate):
    """Update user profile information"""
    try:
        supabase = get_supabase_admin()
        
        if not profile.email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Prepare update data
        update_data = {
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "location": profile.location,
            "bio": profile.bio,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        # Check if user exists
        existing = supabase.table('users').select('id').eq('email', profile.email).execute()
        
        if existing.data and len(existing.data) > 0:
            # Update existing user
            result = supabase.table('users').update(update_data).eq('email', profile.email).execute()
            
            if result.data and len(result.data) > 0:
                return {
                    "message": "Profile updated successfully",
                    "user": result.data[0]
                }
        
        # If user doesn't exist, return error (don't create via profile update)
        raise HTTPException(status_code=404, detail="User not found. Please register first.")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update profile: {str(e)}")

@router.get("/profile/{email}")
async def get_profile(email: str):
    """Get user profile by email"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('users').select('*').eq('email', email).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return result.data[0]
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")
