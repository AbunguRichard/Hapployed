from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
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
applications_collection = db['applications']
jobs_collection = db['jobs']
worker_profiles_collection = db['worker_profiles']

# Pydantic models
class ApplicationCreate(BaseModel):
    jobId: str
    workerId: str
    workerEmail: str
    coverLetter: Optional[str] = None
    proposedRate: Optional[float] = None
    availableStartDate: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: str  # 'pending', 'reviewed', 'accepted', 'rejected'
    hirerNotes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: str
    jobId: str
    workerId: str
    workerEmail: str
    workerName: Optional[str] = None
    workerProfile: Optional[dict] = None
    jobTitle: Optional[str] = None
    jobDetails: Optional[dict] = None
    coverLetter: Optional[str] = None
    proposedRate: Optional[float] = None
    availableStartDate: Optional[str] = None
    status: str
    hirerNotes: Optional[str] = None
    createdAt: str
    updatedAt: str

# Helper functions
def serialize_application(app) -> dict:
    app['id'] = app.pop('_id')
    app['createdAt'] = app.get('createdAt', datetime.utcnow().isoformat())
    app['updatedAt'] = app.get('updatedAt', datetime.utcnow().isoformat())
    return app

# Submit application
@router.post("/applications", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(application: ApplicationCreate):
    """
    Submit a job application
    """
    # Check if job exists
    job = await jobs_collection.find_one({'_id': application.jobId})
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if already applied
    existing = await applications_collection.find_one({
        'jobId': application.jobId,
        'workerId': application.workerId
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    # Get worker profile
    worker_profile = await worker_profiles_collection.find_one({'userId': application.workerId})
    
    application_id = str(uuid.uuid4())
    application_dict = application.dict()
    application_dict['_id'] = application_id
    application_dict['status'] = 'pending'
    application_dict['hirerNotes'] = None
    application_dict['workerName'] = worker_profile.get('name') if worker_profile else None
    application_dict['createdAt'] = datetime.utcnow().isoformat()
    application_dict['updatedAt'] = datetime.utcnow().isoformat()
    
    try:
        await applications_collection.insert_one(application_dict)
        
        # Update job with application count
        await jobs_collection.update_one(
            {'_id': application.jobId},
            {
                '$push': {'applications': {'applicationId': application_id, 'workerId': application.workerId}},
                '$inc': {'applicationCount': 1}
            }
        )
        
        created_app = await applications_collection.find_one({'_id': application_id})
        
        # Attach job details
        created_app['jobTitle'] = job.get('title')
        created_app['jobDetails'] = {
            'title': job.get('title'),
            'category': job.get('category'),
            'budget': job.get('budget')
        }
        
        # Attach worker profile summary
        if worker_profile:
            created_app['workerProfile'] = {
                'name': worker_profile.get('name'),
                'skills': worker_profile.get('skills', []),
                'hourlyRate': worker_profile.get('hourlyRate'),
                'rating': worker_profile.get('rating'),
                'completedJobs': worker_profile.get('completedJobs', 0)
            }
        
        return serialize_application(created_app)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit application: {str(e)}"
        )

# Get applications for a job
@router.get("/jobs/{jobId}/applications", response_model=List[ApplicationResponse])
async def get_job_applications(jobId: str, status: Optional[str] = None):
    """
    Get all applications for a specific job
    """
    query = {'jobId': jobId}
    if status:
        query['status'] = status
    
    try:
        cursor = applications_collection.find(query).sort('createdAt', -1)
        applications = await cursor.to_list(length=100)
        
        # Enrich with worker and job details
        enriched_apps = []
        for app in applications:
            # Get worker profile
            worker_profile = await worker_profiles_collection.find_one({'userId': app['workerId']})
            if worker_profile:
                app['workerProfile'] = {
                    'name': worker_profile.get('name'),
                    'skills': worker_profile.get('skills', []),
                    'hourlyRate': worker_profile.get('hourlyRate'),
                    'rating': worker_profile.get('rating'),
                    'completedJobs': worker_profile.get('completedJobs', 0),
                    'profileImage': worker_profile.get('profileImage')
                }
            
            # Get job details
            job = await jobs_collection.find_one({'_id': app['jobId']})
            if job:
                app['jobDetails'] = {
                    'title': job.get('title'),
                    'category': job.get('category'),
                    'budget': job.get('budget')
                }
            
            enriched_apps.append(serialize_application(app))
        
        return enriched_apps
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch applications: {str(e)}"
        )

# Get worker's applications
@router.get("/workers/{workerId}/applications", response_model=List[ApplicationResponse])
async def get_worker_applications(workerId: str, status: Optional[str] = None):
    """
    Get all applications submitted by a worker
    """
    query = {'workerId': workerId}
    if status:
        query['status'] = status
    
    try:
        cursor = applications_collection.find(query).sort('createdAt', -1)
        applications = await cursor.to_list(length=100)
        
        # Enrich with job details
        enriched_apps = []
        for app in applications:
            job = await jobs_collection.find_one({'_id': app['jobId']})
            if job:
                app['jobTitle'] = job.get('title')
                app['jobDetails'] = {
                    'title': job.get('title'),
                    'category': job.get('category'),
                    'budget': job.get('budget'),
                    'location': job.get('location'),
                    'status': job.get('status')
                }
            enriched_apps.append(serialize_application(app))
        
        return enriched_apps
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch worker applications: {str(e)}"
        )

# Get single application
@router.get("/applications/{applicationId}", response_model=ApplicationResponse)
async def get_application(applicationId: str):
    """
    Get specific application details
    """
    application = await applications_collection.find_one({'_id': applicationId})
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Enrich with details
    worker_profile = await worker_profiles_collection.find_one({'userId': application['workerId']})
    if worker_profile:
        application['workerProfile'] = {
            'name': worker_profile.get('name'),
            'skills': worker_profile.get('skills', []),
            'hourlyRate': worker_profile.get('hourlyRate'),
            'rating': worker_profile.get('rating'),
            'completedJobs': worker_profile.get('completedJobs', 0)
        }
    
    job = await jobs_collection.find_one({'_id': application['jobId']})
    if job:
        application['jobDetails'] = {
            'title': job.get('title'),
            'category': job.get('category'),
            'budget': job.get('budget')
        }
    
    return serialize_application(application)

# Update application status
@router.patch("/applications/{applicationId}", response_model=ApplicationResponse)
async def update_application(applicationId: str, update: ApplicationUpdate):
    """
    Update application status (for hirers)
    """
    application = await applications_collection.find_one({'_id': applicationId})
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    update_data = update.dict()
    update_data['updatedAt'] = datetime.utcnow().isoformat()
    
    try:
        await applications_collection.update_one(
            {'_id': applicationId},
            {'$set': update_data}
        )
        
        updated_app = await applications_collection.find_one({'_id': applicationId})
        
        # Enrich with details
        worker_profile = await worker_profiles_collection.find_one({'userId': updated_app['workerId']})
        if worker_profile:
            updated_app['workerProfile'] = {
                'name': worker_profile.get('name'),
                'skills': worker_profile.get('skills', []),
                'hourlyRate': worker_profile.get('hourlyRate'),
                'rating': worker_profile.get('rating')
            }
        
        job = await jobs_collection.find_one({'_id': updated_app['jobId']})
        if job:
            updated_app['jobDetails'] = {
                'title': job.get('title'),
                'category': job.get('category')
            }
        
        return serialize_application(updated_app)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update application: {str(e)}"
        )

# Withdraw application
@router.delete("/applications/{applicationId}", status_code=status.HTTP_204_NO_CONTENT)
async def withdraw_application(applicationId: str):
    """
    Withdraw/delete an application
    """
    application = await applications_collection.find_one({'_id': applicationId})
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    try:
        # Remove from applications collection
        await applications_collection.delete_one({'_id': applicationId})
        
        # Remove from job's applications array
        await jobs_collection.update_one(
            {'_id': application['jobId']},
            {
                '$pull': {'applications': {'applicationId': applicationId}},
                '$inc': {'applicationCount': -1}
            }
        )
        
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to withdraw application: {str(e)}"
        )

# Get application stats for a job
@router.get("/jobs/{jobId}/applications/stats")
async def get_application_stats(jobId: str):
    """
    Get application statistics for a job
    """
    try:
        total = await applications_collection.count_documents({'jobId': jobId})
        pending = await applications_collection.count_documents({'jobId': jobId, 'status': 'pending'})
        reviewed = await applications_collection.count_documents({'jobId': jobId, 'status': 'reviewed'})
        accepted = await applications_collection.count_documents({'jobId': jobId, 'status': 'accepted'})
        rejected = await applications_collection.count_documents({'jobId': jobId, 'status': 'rejected'})
        
        return {
            'total': total,
            'pending': pending,
            'reviewed': reviewed,
            'accepted': accepted,
            'rejected': rejected
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get application stats: {str(e)}"
        )
