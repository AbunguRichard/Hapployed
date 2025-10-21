from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

class ProfileUpdate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None

@router.put("/profile/update")
async def update_profile(
    profile: ProfileUpdate,
    authorization: Optional[str] = Header(None)
):
    """
    Update user profile information
    """
    try:
        # Extract user from token (simplified - in production, verify JWT token)
        # For now, we'll use email as identifier
        
        if not profile.email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Update user in database
        update_data = {
            "name": profile.name,
            "email": profile.email,
            "phone": profile.phone,
            "location": profile.location,
            "bio": profile.bio
        }
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        result = await db.users.update_one(
            {"email": profile.email},
            {"$set": update_data},
            upsert=True
        )
        
        # Get updated user
        updated_user = await db.users.find_one({"email": profile.email})
        
        if updated_user:
            # Remove MongoDB _id field
            updated_user.pop('_id', None)
            return {
                "message": "Profile updated successfully",
                "user": updated_user
            }
        else:
            return {
                "message": "Profile created successfully",
                "user": update_data
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/profile/{email}")
async def get_profile(email: str):
    """
    Get user profile by email
    """
    try:
        user = await db.users.find_one({"email": email})
        
        if not user:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Remove MongoDB _id field
        user.pop('_id', None)
        return user
        
    except HTTPException:
        # Re-raise HTTPExceptions as-is
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
