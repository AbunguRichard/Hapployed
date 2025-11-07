"""
Badge Routes - Supabase PostgreSQL Version
Worker badge and verification system
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import json

from supabase_client import get_supabase_admin

router = APIRouter(prefix="", tags=["Badges"])

# ============================================================================
# MODELS
# ============================================================================

class Badge(BaseModel):
    badge_id: str
    badge_type: str  # 'gov-verified', 'pro-verified', 'community-trusted'
    badge_name: str
    badge_description: str
    issued_date: str
    verified_by: Optional[str] = None

class BadgeRequest(BaseModel):
    worker_id: str
    badge_type: str

class VerificationRequest(BaseModel):
    worker_id: str
    verification_type: str  # 'id', 'skill', 'background'
    verification_data: dict

# ============================================================================
# ROUTES
# ============================================================================

@router.post("/badges/assign")
async def assign_badge(request: BadgeRequest):
    """Assign a badge to a worker"""
    try:
        supabase = get_supabase_admin()
        
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
        new_badge = {
            "badge_id": str(uuid.uuid4()),
            "badge_type": request.badge_type,
            "badge_name": config["name"],
            "badge_description": config["description"],
            "issued_date": datetime.now(timezone.utc).isoformat(),
            "verified_by": "system"
        }
        
        # Check if worker already has badges
        existing = supabase.table('worker_badges').select('*').eq('worker_id', request.worker_id).execute()
        
        if existing.data and len(existing.data) > 0:
            current_badges = existing.data[0].get('badges', [])
            if isinstance(current_badges, str):
                current_badges = json.loads(current_badges)
            
            # Check if badge already exists
            has_badge = any(b.get("badge_type") == request.badge_type for b in current_badges)
            if has_badge:
                return {"message": "Badge already assigned", "badge": new_badge}
            
            # Add new badge
            current_badges.append(new_badge)
            supabase.table('worker_badges').update({
                "badges": json.dumps(current_badges),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq('worker_id', request.worker_id).execute()
        else:
            # Create new worker badge record
            worker_badge_data = {
                "worker_id": request.worker_id,
                "badges": json.dumps([new_badge]),
                "verification_status": json.dumps({}),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            supabase.table('worker_badges').insert(worker_badge_data).execute()
        
        return {"message": "Badge assigned successfully", "badge": new_badge}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to assign badge: {str(e)}")

@router.get("/badges/worker/{worker_id}")
async def get_worker_badges(worker_id: str):
    """Get all badges for a worker"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('worker_badges').select('*').eq('worker_id', worker_id).execute()
        
        if not result.data or len(result.data) == 0:
            return {"worker_id": worker_id, "badges": [], "verification_status": {}}
        
        worker_badges = result.data[0]
        
        # Parse JSON fields
        if isinstance(worker_badges.get('badges'), str):
            worker_badges['badges'] = json.loads(worker_badges['badges'])
        if isinstance(worker_badges.get('verification_status'), str):
            worker_badges['verification_status'] = json.loads(worker_badges['verification_status'])
        
        return worker_badges
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get worker badges: {str(e)}")

@router.get("/badges/available")
async def get_available_badges():
    """Get list of all available badge types"""
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
    """Submit verification request (ID, skill test, etc.)"""
    try:
        supabase = get_supabase_admin()
        
        verification_id = str(uuid.uuid4())
        
        # Store verification request
        verification_data = {
            "verification_id": verification_id,
            "worker_id": request.worker_id,
            "verification_type": request.verification_type,
            "verification_data": json.dumps(request.verification_data),
            "status": "pending",
            "submitted_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table('verifications').insert(verification_data).execute()
        
        # Update worker badge record with verification status
        existing = supabase.table('worker_badges').select('verification_status').eq('worker_id', request.worker_id).execute()
        
        if existing.data and len(existing.data) > 0:
            status = existing.data[0].get('verification_status', {})
            if isinstance(status, str):
                status = json.loads(status)
            status[request.verification_type] = "pending"
            
            supabase.table('worker_badges').update({
                "verification_status": json.dumps(status),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq('worker_id', request.worker_id).execute()
        else:
            # Create new record
            worker_badge_data = {
                "worker_id": request.worker_id,
                "badges": json.dumps([]),
                "verification_status": json.dumps({request.verification_type: "pending"}),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            supabase.table('worker_badges').insert(worker_badge_data).execute()
        
        return {
            "message": "Verification submitted successfully",
            "verification_id": verification_id,
            "status": "pending"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit verification: {str(e)}")

@router.get("/workers/verified")
async def get_verified_workers(badge_type: Optional[str] = None):
    """Get list of verified workers, optionally filtered by badge type"""
    try:
        supabase = get_supabase_admin()
        
        # Get all worker badges
        badges_result = supabase.table('worker_badges').select('*').execute()
        
        workers_with_badges = badges_result.data if badges_result.data else []
        
        # Filter by badge type if specified
        filtered_workers = []
        for worker_badge in workers_with_badges:
            badges = worker_badge.get('badges', [])
            if isinstance(badges, str):
                badges = json.loads(badges)
            
            if not badges:
                continue
            
            # If badge_type filter is specified, check if worker has that badge
            if badge_type:
                has_badge = any(b.get("badge_type") == badge_type for b in badges)
                if not has_badge:
                    continue
            
            # Get worker details
            worker_result = supabase.table('users').select('id, name, email').eq('id', worker_badge['worker_id']).execute()
            
            if worker_result.data and len(worker_result.data) > 0:
                worker_info = worker_result.data[0]
                filtered_workers.append({
                    "worker_id": worker_badge['worker_id'],
                    "name": worker_info.get('name', 'Unknown'),
                    "email": worker_info.get('email', ''),
                    "badges": badges,
                    "badge_count": len(badges)
                })
        
        return {"workers": filtered_workers, "count": len(filtered_workers)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get verified workers: {str(e)}")
