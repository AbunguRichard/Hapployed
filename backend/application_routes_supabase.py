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
