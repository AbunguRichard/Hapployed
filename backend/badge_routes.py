from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

router = APIRouter(prefix="/api")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Badge Models
class Badge(BaseModel):
    badge_id: str
    badge_type: str  # 'gov-verified', 'pro-verified', 'community-trusted'
    badge_name: str
    badge_description: str
    issued_date: str
    verified_by: Optional[str] = None

class WorkerBadge(BaseModel):
    worker_id: str
    badges: List[Badge] = []
    verification_status: dict = {}

class BadgeRequest(BaseModel):
    worker_id: str
    badge_type: str

class VerificationRequest(BaseModel):
    worker_id: str
    verification_type: str  # 'id', 'skill', 'background'
    verification_data: dict

@router.post("/badges/assign")
async def assign_badge(request: BadgeRequest):
    """
    Assign a badge to a worker
    """
    try:
        badge_configs = {
            "gov-verified": {
                "name": "Gov-Verified",
                "description": "Government ID and background verified",
                "color": "blue",
                "icon": "shield-check"
            },
            "pro-verified": {
                "name": "Pro-Verified",
                "description": "Professional skills tested and verified",
                "color": "purple",
                "icon": "award"
            },
            "community-trusted": {
                "name": "Community-Trusted",
                "description": "Highly rated by community (4.5+ stars, 50+ jobs)",
                "color": "green",
                "icon": "star"
            }
        }
        
        if request.badge_type not in badge_configs:
            raise HTTPException(status_code=400, detail="Invalid badge type")
        
        config = badge_configs[request.badge_type]
        
        # Create badge
        new_badge = Badge(
            badge_id=str(uuid.uuid4()),
            badge_type=request.badge_type,
            badge_name=config["name"],
            badge_description=config["description"],
            issued_date=datetime.utcnow().isoformat(),
            verified_by="system"
        )
        
        # Check if worker already has badges
        existing = await db.worker_badges.find_one({"worker_id": request.worker_id})
        
        if existing:
            # Check if badge already exists
            has_badge = any(b["badge_type"] == request.badge_type for b in existing.get("badges", []))
            if has_badge:
                return {"message": "Badge already assigned", "badge": new_badge.dict()}
            
            # Add new badge
            await db.worker_badges.update_one(
                {"worker_id": request.worker_id},
                {"$push": {"badges": new_badge.dict()}}
            )
        else:
            # Create new worker badge record
            worker_badge = WorkerBadge(
                worker_id=request.worker_id,
                badges=[new_badge]
            )
            await db.worker_badges.insert_one(worker_badge.dict())
        
        return {"message": "Badge assigned successfully", "badge": new_badge.dict()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/badges/worker/{worker_id}")
async def get_worker_badges(worker_id: str):
    """
    Get all badges for a worker
    """
    try:
        worker_badges = await db.worker_badges.find_one({"worker_id": worker_id})
        
        if not worker_badges:
            return {"worker_id": worker_id, "badges": [], "verification_status": {}}
        
        return worker_badges
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/badges/available")
async def get_available_badges():
    """
    Get list of all available badge types
    """
    return {
        "badges": [
            {
                "type": "gov-verified",
                "name": "Gov-Verified",
                "description": "Government ID and background verified",
                "requirements": "Valid government ID, background check",
                "color": "blue",
                "icon": "🛡️"
            },
            {
                "type": "pro-verified",
                "name": "Pro-Verified",
                "description": "Professional skills tested and verified",
                "requirements": "Pass skill assessments in your category",
                "color": "purple",
                "icon": "🏆"
            },
            {
                "type": "community-trusted",
                "name": "Community-Trusted",
                "description": "Highly rated by community",
                "requirements": "4.5+ star rating, 50+ completed jobs",
                "color": "green",
                "icon": "⭐"
            }
        ]
    }

@router.post("/verification/submit")
async def submit_verification(request: VerificationRequest):
    """
    Submit verification request (ID, skill test, etc.)
    """
    try:
        # Store verification request
        verification = {
            "verification_id": str(uuid.uuid4()),
            "worker_id": request.worker_id,
            "verification_type": request.verification_type,
            "verification_data": request.verification_data,
            "status": "pending",
            "submitted_at": datetime.utcnow().isoformat()
        }
        
        await db.verifications.insert_one(verification)
        
        # Update worker badge record with verification status
        await db.worker_badges.update_one(
            {"worker_id": request.worker_id},
            {
                "$set": {
                    f"verification_status.{request.verification_type}": "pending"
                }
            },
            upsert=True
        )
        
        return {
            "message": "Verification submitted successfully",
            "verification_id": verification["verification_id"],
            "status": "pending"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workers/verified")
async def get_verified_workers(badge_type: Optional[str] = None):
    """
    Get list of verified workers, optionally filtered by badge type
    """
    try:
        query = {}
        if badge_type:
            query["badges.badge_type"] = badge_type
        
        workers = await db.worker_badges.find(query).to_list(length=100)
        
        # Get worker details for each
        worker_ids = [w["worker_id"] for w in workers]
        worker_details = await db.users.find({"id": {"$in": worker_ids}}).to_list(length=100)
        
        # Combine worker info with badges
        result = []
        for worker_badge in workers:
            worker_info = next((w for w in worker_details if w.get("id") == worker_badge["worker_id"]), None)
            if worker_info:
                result.append({
                    "worker_id": worker_badge["worker_id"],
                    "name": worker_info.get("name", "Unknown"),
                    "email": worker_info.get("email", ""),
                    "badges": worker_badge.get("badges", []),
                    "badge_count": len(worker_badge.get("badges", []))
                })
        
        return {"workers": result, "count": len(result)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
