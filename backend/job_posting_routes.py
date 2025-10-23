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
db = client[os.environ.get('DB_NAME', 'test_database')]
jobs_collection = db['jobs']

# Pydantic models
class JobCreate(BaseModel):
    userId: str
    userEmail: str
    jobType: str  # 'project' or 'gig' or 'emergency'
    title: str
    description: str
    category: Optional[str] = None
    skills: Optional[List[str]] = []
    budget: Optional[dict] = None  # {type: 'fixed' or 'hourly', amount: number, currency: 'USD'}
    timeline: Optional[str] = None
    location: Optional[dict] = None  # {type: 'remote' or 'onsite', address: str, city: str, state: str}
    urgency: Optional[str] = None  # 'asap', 'today', 'this-week', 'flexible'
    status: str = 'draft'  # 'draft', 'published', 'in-progress', 'completed', 'cancelled'
    requirements: Optional[str] = None
    attachments: Optional[List[str]] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    skills: Optional[List[str]] = None
    budget: Optional[dict] = None
    timeline: Optional[str] = None
    location: Optional[dict] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    requirements: Optional[str] = None
    attachments: Optional[List[str]] = None

class JobResponse(BaseModel):
    id: str
    userId: str
    userEmail: str
    jobType: str
    title: str
    description: str
    category: Optional[str] = None
    skills: List[str] = []
    budget: Optional[dict] = None
    timeline: Optional[str] = None
    location: Optional[dict] = None
    urgency: Optional[str] = None
    status: str
    requirements: Optional[str] = None
    attachments: List[str] = []
    applications: List[dict] = []
    views: int = 0
    createdAt: str
    updatedAt: str

# Helper function to serialize MongoDB document
def serialize_job(job) -> dict:
    job['id'] = job.pop('_id')
    job['createdAt'] = job.get('createdAt', datetime.utcnow().isoformat())
    job['updatedAt'] = job.get('updatedAt', datetime.utcnow().isoformat())
    return job

# Create a new job
@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(job: JobCreate):
    """
    Create a new job posting
    """
    job_id = str(uuid.uuid4())
    job_dict = job.dict()
    job_dict['_id'] = job_id
    job_dict['applications'] = []
    job_dict['views'] = 0
    job_dict['createdAt'] = datetime.utcnow().isoformat()
    job_dict['updatedAt'] = datetime.utcnow().isoformat()
    
    try:
        await jobs_collection.insert_one(job_dict)
        created_job = await jobs_collection.find_one({'_id': job_id})
        return serialize_job(created_job)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create job: {str(e)}"
        )

# Get all jobs (with optional filters)
@router.get("/jobs", response_model=List[JobResponse])
async def get_jobs(
    jobType: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    location: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """
    Get all jobs with optional filters
    """
    query = {}
    
    if jobType:
        query['jobType'] = jobType
    if status:
        query['status'] = status
    if category:
        query['category'] = category
    if location:
        query['location.city'] = {'$regex': location, '$options': 'i'}
    
    try:
        cursor = jobs_collection.find(query).skip(skip).limit(limit).sort('createdAt', -1)
        jobs = await cursor.to_list(length=limit)
        return [serialize_job(job) for job in jobs]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch jobs: {str(e)}"
        )

# Get jobs by user ID
@router.get("/jobs/user/{userId}", response_model=List[JobResponse])
async def get_user_jobs(userId: str):
    """
    Get all jobs posted by a specific user
    """
    try:
        cursor = jobs_collection.find({'userId': userId}).sort('createdAt', -1)
        jobs = await cursor.to_list(length=None)
        return [serialize_job(job) for job in jobs]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user jobs: {str(e)}"
        )

# Get single job by ID
@router.get("/jobs/{jobId}", response_model=JobResponse)
async def get_job(jobId: str):
    """
    Get a specific job by ID
    """
    job = await jobs_collection.find_one({'_id': jobId})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Increment view count
    await jobs_collection.update_one(
        {'_id': jobId},
        {'$inc': {'views': 1}}
    )
    
    return serialize_job(job)

# Update job
@router.patch("/jobs/{jobId}", response_model=JobResponse)
async def update_job(jobId: str, job_update: JobUpdate):
    """
    Update a job posting
    """
    job = await jobs_collection.find_one({'_id': jobId})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Only update fields that are provided
    update_data = {k: v for k, v in job_update.dict().items() if v is not None}
    update_data['updatedAt'] = datetime.utcnow().isoformat()
    
    try:
        await jobs_collection.update_one(
            {'_id': jobId},
            {'$set': update_data}
        )
        updated_job = await jobs_collection.find_one({'_id': jobId})
        return serialize_job(updated_job)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job: {str(e)}"
        )

# Delete job
@router.delete("/jobs/{jobId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(jobId: str):
    """
    Delete a job posting
    """
    result = await jobs_collection.delete_one({'_id': jobId})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return None

# Publish job (change status from draft to published)
@router.post("/jobs/{jobId}/publish", response_model=JobResponse)
async def publish_job(jobId: str):
    """
    Publish a job (change status from draft to published)
    """
    job = await jobs_collection.find_one({'_id': jobId})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    try:
        await jobs_collection.update_one(
            {'_id': jobId},
            {
                '$set': {
                    'status': 'published',
                    'updatedAt': datetime.utcnow().isoformat()
                }
            }
        )
        updated_job = await jobs_collection.find_one({'_id': jobId})
        return serialize_job(updated_job)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish job: {str(e)}"
        )

# Close job
@router.post("/jobs/{jobId}/close", response_model=JobResponse)
async def close_job(jobId: str):
    """
    Close a job (no longer accepting applications)
    """
    job = await jobs_collection.find_one({'_id': jobId})
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    try:
        await jobs_collection.update_one(
            {'_id': jobId},
            {
                '$set': {
                    'status': 'closed',
                    'updatedAt': datetime.utcnow().isoformat()
                }
            }
        )
        updated_job = await jobs_collection.find_one({'_id': jobId})
        return serialize_job(updated_job)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to close job: {str(e)}"
        )
