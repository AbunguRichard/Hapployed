from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database('test_database')
jobs_collection = db.jobs

# Models
class JobPost(BaseModel):
    title: str
    description: str
    category: str
    amount: str
    visibility: str = 'public'
    location: str
    workModel: str = 'remote'
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    interviewRequired: bool = False
    radius: str = '10'
    timeWindow: Optional[str] = None
    duration: Optional[str] = None
    equipment: List[str] = []
    mode: str = 'regular'  # 'regular' or 'emergency'
    user_id: str
    user_name: Optional[str] = None

@router.post("/post")
async def post_job(job: JobPost):
    """Post a new job"""
    try:
        job_id = str(uuid.uuid4())
        
        # Determine which feed this should go to
        feed_type = 'gigs' if job.mode == 'emergency' else 'opportunities'
        
        job_data = {
            "id": job_id,
            "title": job.title,
            "description": job.description,
            "category": job.category,
            "budget": {
                "amount": job.amount,
                "type": "Fixed" if not "/" in job.amount else "Hourly"
            },
            "location": job.location,
            "workModel": job.workModel,
            "startDate": job.startDate,
            "endDate": job.endDate,
            "duration": job.duration,
            "equipment": job.equipment,
            "mode": job.mode,
            "feed_type": feed_type,
            "urgent": job.mode == 'emergency',
            "user_id": job.user_id,
            "user_name": job.user_name or "Anonymous",
            "posted_at": datetime.now().isoformat(),
            "status": "active",
            "views": 0,
            "applications": 0,
            "accepting": 0,
            "hired": 0,
            
            # For gigs near me
            "distance": "N/A",  # Will be calculated based on user location
            "eta": "N/A",
            "availableNow": job.mode == 'emergency',
            "startTime": job.timeWindow or "ASAP" if job.mode == 'emergency' else job.startDate,
            "expiresIn": "24 hours" if job.mode == 'emergency' else None,
            
            # Client info (from posting user)
            "client": {
                "name": job.user_name or "Anonymous User",
                "rating": 0.0,
                "reviews": 0,
                "totalHired": "0 times",
                "location": job.location,
                "verified": False,
                "responseRate": "New poster",
                "avgResponseTime": "N/A",
                "phoneVerified": False
            },
            
            # For opportunities
            "experienceLevel": "All levels",
            "skills": [job.category],
            "proposals": 0,
            "lastViewed": None,
            "matchScore": 0,
            "ctaText": "Apply Now",
            
            # Requirements
            "requirements": {
                "mustHave": equipment if job.equipment else ["Available to start"],
                "niceToHave": []
            },
            
            # Payment
            "payment": {
                "method": "To be discussed",
                "verified": False
            },
            
            "visibility": job.visibility,
            "interviewRequired": job.interviewRequired,
            "radius": job.radius
        }
        
        # Insert into MongoDB
        await jobs_collection.insert_one(job_data)
        
        return {
            "success": True,
            "message": "Job posted successfully",
            "job_id": job_id,
            "feed_type": feed_type
        }
        
    except Exception as e:
        print(f"Error posting job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/opportunities")
async def get_opportunities(limit: int = 10, skip: int = 0):
    """Get all opportunities (regular projects)"""
    try:
        jobs = await jobs_collection.find(
            {"feed_type": "opportunities", "status": "active"}
        ).sort("posted_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        # Remove MongoDB _id field
        for job in jobs:
            job.pop('_id', None)
        
        return {"jobs": jobs, "total": await jobs_collection.count_documents({"feed_type": "opportunities", "status": "active"})}
    except Exception as e:
        print(f"Error fetching opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gigs")
async def get_gigs(limit: int = 10, skip: int = 0):
    """Get all gigs (emergency/quickhire)"""
    try:
        jobs = await jobs_collection.find(
            {"feed_type": "gigs", "status": "active"}
        ).sort("posted_at", -1).skip(skip).limit(limit).to_list(length=limit)
        
        # Remove MongoDB _id field
        for job in jobs:
            job.pop('_id', None)
        
        return {"jobs": jobs, "total": await jobs_collection.count_documents({"feed_type": "gigs", "status": "active"})}
    except Exception as e:
        print(f"Error fetching gigs: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-posts/{user_id}")
async def get_user_posts(user_id: str):
    """Get all jobs posted by a user"""
    try:
        jobs = await jobs_collection.find(
            {"user_id": user_id}
        ).sort("posted_at", -1).to_list(length=None)
        
        # Remove MongoDB _id field
        for job in jobs:
            job.pop('_id', None)
        
        return {"jobs": jobs}
    except Exception as e:
        print(f"Error fetching user posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{job_id}")
async def delete_job(job_id: str):
    """Delete a job"""
    try:
        result = await jobs_collection.delete_one({"id": job_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"success": True, "message": "Job deleted successfully"}
    except Exception as e:
        print(f"Error deleting job: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{job_id}")
async def update_job(job_id: str, updates: dict):
    """Update a job"""
    try:
        result = await jobs_collection.update_one(
            {"id": job_id},
            {"$set": updates}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Job not found")
        return {"success": True, "message": "Job updated successfully"}
    except Exception as e:
        print(f"Error updating job: {e}")
        raise HTTPException(status_code=500, detail=str(e))
