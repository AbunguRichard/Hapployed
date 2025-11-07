"""
Application Routes - Supabase PostgreSQL Version
Handles job applications (create, list, update status)
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/applications", tags=["Applications"])

class ApplicationCreate(BaseModel):
    job_id: str
    worker_id: str
    cover_letter: Optional[str] = None
    proposed_rate: Optional[float] = None
    available_date: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    hirer_notes: Optional[str] = None

@router.post("")
async def create_application(application: ApplicationCreate):
    """Create a new job application"""
    try:
        supabase = get_supabase_admin()
        
        # Check if application already exists
        existing = supabase.table('applications').select('id').eq('job_id', application.job_id).eq('worker_id', application.worker_id).execute()
        
        if existing.data and len(existing.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already applied for this job"
            )
        
        app_id = str(uuid.uuid4())
        
        app_data = {
            "id": app_id,
            "job_id": application.job_id,
            "worker_id": application.worker_id,
            "cover_letter": application.cover_letter,
            "proposed_rate": application.proposed_rate,
            "available_date": application.available_date,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table('applications').insert(app_data).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create application"
            )
        
        return {"success": True, "application": result.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create application: {str(e)}"
        )

@router.get("/job/{job_id}")
async def get_job_applications(job_id: str):
    """Get all applications for a job"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('applications').select('*').eq('job_id', job_id).order('created_at', desc=True).execute()
        
        return {"success": True, "applications": result.data if result.data else []}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get applications: {str(e)}"
        )

@router.get("/worker/{worker_id}")
async def get_worker_applications(worker_id: str):
    """Get all applications by a worker"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('applications').select('*').eq('worker_id', worker_id).order('created_at', desc=True).execute()
        
        return {"success": True, "applications": result.data if result.data else []}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get applications: {str(e)}"
        )

@router.get("/{application_id}")
async def get_single_application(application_id: str):
    """Get a single application by ID"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('applications').select('*').eq('id', application_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return {"success": True, "application": result.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get application: {str(e)}"
        )

@router.patch("/{application_id}")
async def update_application(application_id: str, updates: ApplicationUpdate):
    """Update application status"""
    try:
        supabase = get_supabase_admin()
        
        update_data = updates.dict(exclude_unset=True, exclude_none=True)
        update_data['updated_at'] = datetime.utcnow().isoformat()
        
        result = supabase.table('applications').update(update_data).eq('id', application_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        return {"success": True, "application": result.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update application: {str(e)}"
        )

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(application_id: str):
    """Delete/withdraw an application"""
    try:
        supabase = get_supabase_admin()
        
        # Get application first to decrement job count
        app_result = supabase.table('applications').select('job_id').eq('id', application_id).execute()
        
        if not app_result.data or len(app_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        job_id = app_result.data[0]['job_id']
        
        # Delete application
        result = supabase.table('applications').delete().eq('id', application_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Decrement application count
        job = supabase.table('jobs').select('application_count').eq('id', job_id).execute()
        if job.data and len(job.data) > 0:
            new_count = max(0, job.data[0]['application_count'] - 1)
            supabase.table('jobs').update({"application_count": new_count}).eq('id', job_id).execute()
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete application: {str(e)}"
        )

@router.get("/jobs/{job_id}/stats")
async def get_application_stats(job_id: str):
    """Get application statistics for a job"""
    try:
        supabase = get_supabase_admin()
        
        # Get all applications for the job
        result = supabase.table('applications').select('status').eq('job_id', job_id).execute()
        
        applications = result.data if result.data else []
        
        # Calculate stats
        stats = {
            "total": len(applications),
            "pending": sum(1 for app in applications if app.get('status') == 'pending'),
            "reviewed": sum(1 for app in applications if app.get('status') == 'reviewed'),
            "accepted": sum(1 for app in applications if app.get('status') == 'accepted'),
            "rejected": sum(1 for app in applications if app.get('status') == 'rejected')
        }
        
        return {"success": True, "stats": stats}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get application stats: {str(e)}"
        )
