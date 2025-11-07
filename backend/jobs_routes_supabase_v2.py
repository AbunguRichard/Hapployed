"""
Jobs Routes - Supabase PostgreSQL Version
Complete job posting system with CRUD operations
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import json

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/jobs", tags=["Jobs"])

# ============================================================================
# MODELS
# ============================================================================

class RoleDefinition(BaseModel):
    roleId: str = Field(default_factory=lambda: str(uuid.uuid4()))
    roleName: str
    numberOfPeople: int = 1
    requiredSkills: List[str] = []
    payPerPerson: float
    experienceLevel: str = "Intermediate"
    workLocation: str = "Remote"
    applicants: int = 0
    hired: int = 0
    status: str = "open"

class JobCreate(BaseModel):
    userId: str
    title: str
    description: str
    jobType: str = "project"  # 'project' or 'gig'
    category: str
    budget: Optional[float] = None
    duration: Optional[str] = None
    location: Optional[dict] = None  # {address: str, type: str}
    skillsRequired: List[str] = []
    experienceLevel: Optional[str] = None
    urgency: str = "normal"
    specificLocation: Optional[str] = None
    workType: Optional[str] = "remote"
    hiringType: str = "Single"  # 'Single' or 'Multi-Role'
    roles: List[RoleDefinition] = []

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    budget: Optional[float] = None
    duration: Optional[str] = None
    location: Optional[dict] = None
    status: Optional[str] = None
    hiringType: Optional[str] = None
    roles: Optional[List[RoleDefinition]] = None

class JobResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    job_type: str
    status: str
    hiring_type: str
    category: Optional[str]
    budget: Optional[float]
    duration: Optional[str]
    location: Optional[dict]
    skills_required: List[str]
    views: int
    application_count: int
    created_at: str
    updated_at: str
    published_at: Optional[str]

# ============================================================================
# ROUTES
# ============================================================================

@router.post("/jobs", status_code=status.HTTP_201_CREATED)
async def create_job(job: JobCreate):
    """Create a new job posting"""
    try:
        supabase = get_supabase_admin()
        
        job_id = str(uuid.uuid4())
        
        job_data = {
            "id": job_id,
            "user_id": job.userId,
            "title": job.title,
            "description": job.description,
            "job_type": job.jobType,
            "status": "draft",
            "hiring_type": job.hiringType,
            "category": job.category,
            "budget": job.budget,
            "duration": job.duration,
            "location": json.dumps(job.location) if job.location else None,
            "skills_required": job.skillsRequired,
            "experience_level": job.experienceLevel,
            "urgency": job.urgency,
            "views": 0,
            "application_count": 0,
            "specific_location": job.specificLocation,
            "work_type": job.workType,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('jobs').insert(job_data).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create job"
            )
        
        created_job = result.data[0]
        
        # Create role definitions if Multi-Role hiring
        if job.hiringType == "Multi-Role" and job.roles:
            role_data = []
            for role in job.roles:
                role_data.append({
                    "id": str(uuid.uuid4()),
                    "job_id": job_id,
                    "role_id": role.roleId,
                    "role_name": role.roleName,
                    "number_of_people": role.numberOfPeople,
                    "required_skills": role.requiredSkills,
                    "pay_per_person": role.payPerPerson,
                    "experience_level": role.experienceLevel,
                    "work_location": role.workLocation,
                    "applicants": 0,
                    "hired": 0,
                    "status": "open",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                })
            
            if role_data:
                supabase.table('role_definitions').insert(role_data).execute()
        
        return {
            "success": True,
            "jobId": job_id,
            "message": "Job created successfully",
            "job": created_job
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create job: {str(e)}"
        )

@router.get("/jobs")
async def list_jobs(
    jobType: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """List jobs with optional filters"""
    try:
        supabase = get_supabase_admin()
        
        query = supabase.table('jobs').select('*')
        
        # Apply filters
        if jobType:
            query = query.eq('job_type', jobType)
        if status:
            query = query.eq('status', status)
        else:
            query = query.eq('status', 'published')  # Default to published
        if category:
            query = query.eq('category', category)
        
        # Apply pagination and ordering
        query = query.range(offset, offset + limit - 1).order('created_at', desc=True)
        
        result = query.execute()
        
        jobs = result.data if result.data else []
        
        # Parse JSON fields
        for job in jobs:
            if job.get('location') and isinstance(job['location'], str):
                try:
                    job['location'] = json.loads(job['location'])
                except:
                    pass
        
        return {
            "success": True,
            "jobs": jobs,
            "count": len(jobs)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list jobs: {str(e)}"
        )

@router.get("/jobs/user/{userId}")
async def get_user_jobs(userId: str):
    """Get all jobs posted by a specific user"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').select('*').eq('user_id', userId).order('created_at', desc=True).execute()
        
        jobs = result.data if result.data else []
        
        # Parse JSON fields
        for job in jobs:
            if job.get('location') and isinstance(job['location'], str):
                try:
                    job['location'] = json.loads(job['location'])
                except:
                    pass
        
        return {
            "success": True,
            "jobs": jobs,
            "count": len(jobs)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user jobs: {str(e)}"
        )

@router.get("/jobs/{jobId}")
async def get_job(jobId: str):
    """Get a specific job by ID and increment view count"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').select('*').eq('id', jobId).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        job = result.data[0]
        
        # Increment view count
        supabase.table('jobs').update({
            "views": job['views'] + 1
        }).eq('id', jobId).execute()
        
        job['views'] = job['views'] + 1
        
        # Parse JSON location
        if job.get('location') and isinstance(job['location'], str):
            try:
                job['location'] = json.loads(job['location'])
            except:
                pass
        
        # Get role definitions if Multi-Role
        if job.get('hiring_type') == 'Multi-Role':
            roles_result = supabase.table('role_definitions').select('*').eq('job_id', jobId).execute()
            job['roles'] = roles_result.data if roles_result.data else []
        
        return {
            "success": True,
            "job": job
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get job: {str(e)}"
        )

@router.patch("/jobs/{jobId}")
async def update_job(jobId: str, updates: JobUpdate):
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
        
        # Handle special fields
        if 'location' in update_data:
            update_data['location'] = json.dumps(update_data['location'])
        
        # Convert camelCase to snake_case
        field_mapping = {
            'hiringType': 'hiring_type',
            'skillsRequired': 'skills_required'
        }
        
        converted_data = {}
        for key, value in update_data.items():
            db_key = field_mapping.get(key, key)
            converted_data[db_key] = value
        
        # Remove roles from main update (handled separately)
        roles_data = converted_data.pop('roles', None)
        
        converted_data['updated_at'] = datetime.now(timezone.utc).isoformat()
        
        result = supabase.table('jobs').update(converted_data).eq('id', jobId).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Update roles if provided
        if roles_data is not None:
            # Delete existing roles
            supabase.table('role_definitions').delete().eq('job_id', jobId).execute()
            
            # Insert new roles
            if roles_data:
                role_records = []
                for role in roles_data:
                    role_records.append({
                        "id": str(uuid.uuid4()),
                        "job_id": jobId,
                        "role_id": role.get('roleId', str(uuid.uuid4())),
                        "role_name": role['roleName'],
                        "number_of_people": role.get('numberOfPeople', 1),
                        "required_skills": role.get('requiredSkills', []),
                        "pay_per_person": role['payPerPerson'],
                        "experience_level": role.get('experienceLevel', 'Intermediate'),
                        "work_location": role.get('workLocation', 'Remote'),
                        "applicants": role.get('applicants', 0),
                        "hired": role.get('hired', 0),
                        "status": role.get('status', 'open'),
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    })
                
                if role_records:
                    supabase.table('role_definitions').insert(role_records).execute()
        
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

@router.delete("/jobs/{jobId}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(jobId: str):
    """Delete a job"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').delete().eq('id', jobId).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete job: {str(e)}"
        )

@router.post("/jobs/{jobId}/publish")
async def publish_job(jobId: str):
    """Publish a draft job"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').update({
            "status": "published",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq('id', jobId).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        return {
            "success": True,
            "message": "Job published successfully",
            "job": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to publish job: {str(e)}"
        )

@router.post("/jobs/{jobId}/close")
async def close_job(jobId: str):
    """Close an active job"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('jobs').update({
            "status": "closed",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq('id', jobId).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        return {
            "success": True,
            "message": "Job closed successfully",
            "job": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to close job: {str(e)}"
        )
