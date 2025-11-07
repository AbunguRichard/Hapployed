"""
Worker Dashboard Routes - Supabase PostgreSQL Version
Comprehensive dashboard data for workers
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta, timezone
import json

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/worker-dashboard", tags=["Worker Dashboard"])

# ============================================================================
# MODELS
# ============================================================================

class DashboardStats(BaseModel):
    total_gigs_completed: int = 0
    total_earnings: float = 0.0
    average_rating: float = 0.0
    active_gigs: int = 0
    pending_applications: int = 0
    profile_completion: int = 0

class ScheduleItem(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    location: str
    status: str

class RecommendedJob(BaseModel):
    id: str
    title: str
    category: str
    budget: float
    match_score: int

class ActiveGig(BaseModel):
    id: str
    title: str
    client_name: str
    start_date: str
    status: str
    payment_status: str

class EarningsSummary(BaseModel):
    total_earnings: float
    pending_earnings: float
    this_month: float
    last_month: float

class ReputationScore(BaseModel):
    overall_score: float
    total_reviews: int
    rating_breakdown: dict

class Achievement(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    earned_date: str

# ============================================================================
# ROUTES
# ============================================================================

@router.get("/stats/{user_id}", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str):
    """Get comprehensive dashboard statistics"""
    try:
        supabase = get_supabase_admin()
        
        # Get applications
        apps = supabase.table('applications').select('status').eq('worker_id', user_id).execute()
        applications = apps.data if apps.data else []
        
        # Get wallet
        wallet_result = supabase.table('wallets').select('total_earned').eq('user_id', user_id).execute()
        total_earnings = wallet_result.data[0].get('total_earned', 0) if wallet_result.data else 0
        
        # Get worker profile for ratings
        profile = supabase.table('worker_profiles').select('*').eq('user_id', user_id).execute()
        avg_rating = profile.data[0].get('average_rating', 0) if profile.data else 0
        
        # Calculate profile completion
        profile_completion = 75  # Simplified
        
        return {
            "total_gigs_completed": sum(1 for a in applications if a.get('status') == 'accepted'),
            "total_earnings": float(total_earnings),
            "average_rating": float(avg_rating),
            "active_gigs": sum(1 for a in applications if a.get('status') in ['accepted', 'in_progress']),
            "pending_applications": sum(1 for a in applications if a.get('status') == 'pending'),
            "profile_completion": profile_completion
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/schedule/{user_id}", response_model=List[ScheduleItem])
async def get_worker_schedule(user_id: str):
    """Get worker's schedule"""
    try:
        # Mock schedule data - in production would come from calendar/bookings
        return [
            {
                "id": "1",
                "title": "Web Development Project",
                "start_time": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat(),
                "end_time": (datetime.now(timezone.utc) + timedelta(days=1, hours=4)).isoformat(),
                "location": "Remote",
                "status": "confirmed"
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/recommended-jobs/{user_id}", response_model=List[RecommendedJob])
async def get_recommended_jobs(user_id: str):
    """Get AI-recommended jobs for worker"""
    try:
        supabase = get_supabase_admin()
        
        # Get worker skills
        profile = supabase.table('worker_profiles').select('skills').eq('user_id', user_id).execute()
        worker_skills = profile.data[0].get('skills', []) if profile.data else []
        
        # Get published jobs
        jobs_result = supabase.table('jobs').select('*').eq('status', 'published').limit(10).execute()
        jobs = jobs_result.data if jobs_result.data else []
        
        # Simple matching
        recommendations = []
        for job in jobs:
            job_skills = job.get('skills_required', [])
            match_score = 75  # Simplified
            
            recommendations.append({
                "id": job['id'],
                "title": job['title'],
                "category": job.get('category', 'Other'),
                "budget": float(job.get('budget', 0)),
                "match_score": match_score
            })
        
        return recommendations[:5]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active-gigs/{user_id}", response_model=List[ActiveGig])
async def get_active_gigs(user_id: str):
    """Get worker's active gigs"""
    try:
        supabase = get_supabase_admin()
        
        # Get accepted applications
        apps = supabase.table('applications').select('*, jobs(*)').eq('worker_id', user_id).in_('status', ['accepted', 'in_progress']).execute()
        
        active_gigs = []
        for app in (apps.data if apps.data else []):
            job = app.get('jobs')
            if job:
                active_gigs.append({
                    "id": app['id'],
                    "title": job.get('title', 'Untitled'),
                    "client_name": "Client",  # Would fetch from users table
                    "start_date": app.get('created_at', ''),
                    "status": app.get('status', 'active'),
                    "payment_status": "pending"
                })
        
        return active_gigs
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/earnings/{user_id}", response_model=EarningsSummary)
async def get_earnings_summary(user_id: str):
    """Get earnings summary"""
    try:
        supabase = get_supabase_admin()
        
        wallet_result = supabase.table('wallets').select('*').eq('user_id', user_id).execute()
        
        if wallet_result.data and len(wallet_result.data) > 0:
            wallet = wallet_result.data[0]
            return {
                "total_earnings": float(wallet.get('total_earned', 0)),
                "pending_earnings": float(wallet.get('pending_balance', 0)),
                "this_month": float(wallet.get('total_earned', 0)) * 0.2,  # Simplified
                "last_month": float(wallet.get('total_earned', 0)) * 0.15
            }
        
        return {
            "total_earnings": 0.0,
            "pending_earnings": 0.0,
            "this_month": 0.0,
            "last_month": 0.0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reputation/{user_id}", response_model=ReputationScore)
async def get_reputation_score(user_id: str):
    """Get worker reputation score"""
    try:
        supabase = get_supabase_admin()
        
        profile = supabase.table('worker_profiles').select('average_rating').eq('user_id', user_id).execute()
        
        rating = profile.data[0].get('average_rating', 0) if profile.data else 0
        
        return {
            "overall_score": float(rating),
            "total_reviews": 12,  # Simplified
            "rating_breakdown": {
                "5_star": 8,
                "4_star": 3,
                "3_star": 1,
                "2_star": 0,
                "1_star": 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/achievements/{user_id}", response_model=List[Achievement])
async def get_achievements(user_id: str):
    """Get worker achievements"""
    try:
        # Mock achievements - would come from achievements table
        return [
            {
                "id": "1",
                "title": "First Gig Completed",
                "description": "Successfully completed your first gig",
                "icon": "🎉",
                "earned_date": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "2",
                "title": "5-Star Rating",
                "description": "Received your first 5-star rating",
                "icon": "⭐",
                "earned_date": datetime.now(timezone.utc).isoformat()
            }
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs/search", response_model=List[RecommendedJob])
async def search_jobs_for_worker(user_id: str, query: Optional[str] = None):
    """Search jobs relevant to worker"""
    try:
        return await get_recommended_jobs(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
