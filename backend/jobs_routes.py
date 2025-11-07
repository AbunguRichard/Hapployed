"""
Jobs Routes - Supabase PostgreSQL Version
Handles job posting, listing, updates, and deletion
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

# Import Supabase client
from supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

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

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None

@router.post("/post")
async def post_job(job: JobPost):
    """Post a new job to Supabase"""
    try:
        supabase = get_supabase_admin()
        
        job_id = str(uuid.uuid4())
        
        # Determine job type and status
        job_type = 'gig' if job.mode == 'emergency' else 'project'
        
        job_data = {
            "id": job_id,
            "user_id": job.user_id,
            "title": job.title,
            "description": job.description,
            "job_type": job_type,
            "status": "published",
            "hiring_type": "Single",
            "category": job.category,
            "budget": float(job.amount) if job.amount else None,
            "duration": job.duration,
            "location": {"address": job.location, "type": job.workModel},
            "skills_required": [],
            "urgency": "high" if job.mode == 'emergency' else "normal",
            "views": 0,
            "application_count": 0,
            "specific_location": job.location,
            "work_type": job.workModel,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "published_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table('jobs').insert(job_data).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create job"
            )
        
        return {
            "success": True,
            "jobId": job_id,
            "message": "Job posted successfully",
            "job": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to post job: {str(e)}"
        )

@router.get("/list")
async def list_jobs(
    category: Optional[str] = None,
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """List jobs with optional filters"""
    try:
        supabase = get_supabase_admin()
        
        query = supabase.table('jobs').select('*')
        
        # Apply filters
        if category:
            query = query.eq('category', category)
        if user_id:
            query = query.eq('user_id', user_id)
        if status:
            query = query.eq('status', status)
        else:
            query = query.eq('status', 'published')  # Default to published jobs
        
        # Apply pagination
        query = query.range(offset, offset + limit - 1)
        
        # Order by created_at descending
        query = query.order('created_at', desc=True)
        
        result = query.execute()
        
        return {
            "success": True,
            "jobs": result.data if result.data else [],
            "count": len(result.data) if result.data else 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list jobs: {str(e)}"
        )

@router.get("/{job_id}")
async def get_job(job_id: str):
    """Get a specific job by ID"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').select('*').eq('id', job_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Increment view count
        supabase.table('jobs').update({
            "views": result.data[0]['views'] + 1
        }).eq('id', job_id).execute()
        
        return {
            "success": True,
            "job": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job: {str(e)}"
        )

@router.patch("/{job_id}")
async def update_job(job_id: str, updates: JobUpdate):
    """Update a job"""
    try:
        supabase = get_supabase_admin()
        
        # Build update dict
        update_data = updates.dict(exclude_unset=True, exclude_none=True)
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No updates provided"
            )
        
        # Add updated_at
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table('jobs').update(update_data).eq('id', job_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        return {
            "success": True,
            "message": "Job updated successfully",
            "job": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update job: {str(e)}"
        )

@router.delete("/{job_id}")
async def delete_job(job_id: str):
    """Delete a job"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').delete().eq('id', job_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        return {
            "success": True,
            "message": "Job deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete job: {str(e)}"
        )

@router.get("/user/{user_id}")
async def get_user_jobs(user_id: str):
    """Get all jobs posted by a specific user"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
        
        return {
            "success": True,
            "jobs": result.data if result.data else [],
            "count": len(result.data) if result.data else 0
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user jobs: {str(e)}"
        )
