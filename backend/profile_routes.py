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
async def update_profile(profile: ProfileUpdate):
    """
    Update user profile information
    """
    try:
        print(f"Received profile update request: {profile.dict()}")
        
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
            print(f"Profile updated successfully: {updated_user}")
            return {
                "message": "Profile updated successfully",
                "user": updated_user
            }
        else:
            print(f"Profile created successfully: {update_data}")
            return {
                "message": "Profile created successfully",
                "user": update_data
            }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        import traceback
        traceback.print_exc()
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
