from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime, timedelta, timezone
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/worker-dashboard", tags=["Worker Dashboard"])

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database(os.getenv('DB_NAME', 'test_database'))

# Collections
applications_collection = db.applications
jobs_collection = db.jobs
gigs_collection = db.gigs
earnings_collection = db.earnings
achievements_collection = db.achievements
worker_profiles_collection = db.worker_profiles

# ============================================================================
# MODELS
# ============================================================================

class DashboardStats(BaseModel):
    available_jobs: int = 0
    active_gigs: int = 0
    pending_applications: int = 0
    weekly_earnings: float = 0.0

class ScheduleItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    time: str
    title: str
    duration: str
    gig_id: Optional[str] = None
    status: str = "scheduled"  # scheduled, in_progress, completed

class RecommendedJob(BaseModel):
    id: str
    priority: bool = False
    title: str
    rate: float
    duration: float
    location: str
    skills: List[str]
    client_rating: float
    client_reviews: int
    match_score: int
    category: Optional[str] = None

class ActiveGig(BaseModel):
    id: str
    title: str
    client: str
    client_rating: float
    milestones: List[Dict]
    status: str = "active"

class Milestone(BaseModel):
    name: str
    amount: float
    completed: bool = False
    due_date: Optional[str] = None

class EarningsSummary(BaseModel):
    available: float = 0.0
    pending: float = 0.0
    this_month: float = 0.0
    total_earned: float = 0.0

class ReputationScore(BaseModel):
    score: float = 0.0
    reliability: int = 0
    communication: int = 0
    quality: int = 0
    total_reviews: int = 0

class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon: str
    description: str
    earned_at: Optional[datetime] = None

class JobFilters(BaseModel):
    search: str = ""
    location: str = "any"
    budget: str = "any"
    duration: str = "any"
    category: str = "any"

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/stats/{user_id}", response_model=DashboardStats)
async def get_dashboard_stats(user_id: str):
    """Get worker dashboard statistics"""
    try:
        # Count available jobs (published jobs)
        available_jobs = await jobs_collection.count_documents({"status": "published"})
        
        # Count active gigs for this worker
        active_gigs = await gigs_collection.count_documents({
            "worker_id": user_id,
            "status": {"$in": ["in_progress", "accepted"]}
        })
        
        # Count pending applications
        pending_applications = await applications_collection.count_documents({
            "workerId": user_id,
            "status": "pending"
        })
        
        # Calculate weekly earnings
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        earnings_cursor = earnings_collection.find({
            "worker_id": user_id,
            "paid_at": {"$gte": week_ago.isoformat()}
        })
        earnings_list = await earnings_cursor.to_list(length=None)
        weekly_earnings = sum(e.get("amount", 0) for e in earnings_list)
        
        return DashboardStats(
            available_jobs=available_jobs,
            active_gigs=active_gigs,
            pending_applications=pending_applications,
            weekly_earnings=weekly_earnings
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/schedule/{user_id}", response_model=List[ScheduleItem])
async def get_today_schedule(user_id: str):
    """Get today's schedule for worker"""
    try:
        # Get gigs scheduled for today
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        gigs_cursor = gigs_collection.find({
            "worker_id": user_id,
            "scheduled_date": {
                "$gte": today_start.isoformat(),
                "$lt": today_end.isoformat()
            },
            "status": {"$in": ["accepted", "in_progress"]}
        })
        
        gigs = await gigs_cursor.to_list(length=None)
        
        schedule = []
        for gig in gigs:
            schedule.append(ScheduleItem(
                id=gig.get("gig_id", str(uuid.uuid4())),
                time=gig.get("scheduled_time", "TBD"),
                title=gig.get("title", "Gig"),
                duration=f"{gig.get('duration', 2)} hrs",
                gig_id=gig.get("gig_id"),
                status=gig.get("status", "scheduled")
            ))
        
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommended-jobs/{user_id}", response_model=List[RecommendedJob])
async def get_recommended_jobs(user_id: str, limit: int = 10):
    """Get AI-recommended jobs for worker based on skills and history"""
    try:
        # Get worker profile to understand skills
        worker_profile = await worker_profiles_collection.find_one({"userId": user_id})
        worker_skills = worker_profile.get("skills", []) if worker_profile else []
        
        # Get published jobs
        jobs_cursor = jobs_collection.find({"status": "published"}).limit(limit)
        jobs_list = await jobs_cursor.to_list(length=limit)
        
        recommended = []
        for job in jobs_list:
            # Calculate match score based on skill overlap
            job_skills = job.get("requiredSkills", [])
            matching_skills = set(worker_skills) & set(job_skills)
            match_score = int((len(matching_skills) / len(job_skills) * 100)) if job_skills else 50
            
            recommended.append(RecommendedJob(
                id=job.get("jobId", str(uuid.uuid4())),
                priority=job.get("urgency") == "urgent",
                title=job.get("title", "Job Title"),
                rate=float(job.get("budget", 0)) / float(job.get("duration", 1)) if job.get("duration") else 50.0,
                duration=float(job.get("duration", 1)),
                location=job.get("workLocation", "Remote"),
                skills=job_skills,
                client_rating=float(job.get("clientRating", 4.5)),
                client_reviews=int(job.get("clientReviews", 0)),
                match_score=match_score,
                category=job.get("category")
            ))
        
        # Sort by match score
        recommended.sort(key=lambda x: x.match_score, reverse=True)
        
        return recommended
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/active-gigs/{user_id}", response_model=List[ActiveGig])
async def get_active_gigs(user_id: str):
    """Get worker's active gigs with milestones"""
    try:
        gigs_cursor = gigs_collection.find({
            "worker_id": user_id,
            "status": {"$in": ["in_progress", "accepted"]}
        })
        
        gigs_list = await gigs_cursor.to_list(length=None)
        
        active = []
        for gig in gigs_list:
            milestones = gig.get("milestones", [])
            active.append(ActiveGig(
                id=gig.get("gig_id", str(uuid.uuid4())),
                title=gig.get("title", "Gig Title"),
                client=gig.get("client_name", "Client"),
                client_rating=float(gig.get("client_rating", 4.5)),
                milestones=milestones,
                status=gig.get("status", "active")
            ))
        
        return active
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/earnings/{user_id}", response_model=EarningsSummary)
async def get_earnings_summary(user_id: str):
    """Get earnings summary for worker"""
    try:
        # Available earnings (completed and paid)
        available_cursor = earnings_collection.find({
            "worker_id": user_id,
            "status": "available"
        })
        available_list = await available_cursor.to_list(length=None)
        available = sum(e.get("amount", 0) for e in available_list)
        
        # Pending earnings (work submitted, awaiting payment)
        pending_cursor = earnings_collection.find({
            "worker_id": user_id,
            "status": "pending"
        })
        pending_list = await pending_cursor.to_list(length=None)
        pending = sum(e.get("amount", 0) for e in pending_list)
        
        # This month earnings
        month_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_cursor = earnings_collection.find({
            "worker_id": user_id,
            "paid_at": {"$gte": month_start.isoformat()}
        })
        this_month_list = await this_month_cursor.to_list(length=None)
        this_month = sum(e.get("amount", 0) for e in this_month_list)
        
        # Total earned (all time)
        total_cursor = earnings_collection.find({"worker_id": user_id})
        total_list = await total_cursor.to_list(length=None)
        total_earned = sum(e.get("amount", 0) for e in total_list)
        
        return EarningsSummary(
            available=available,
            pending=pending,
            this_month=this_month,
            total_earned=total_earned
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reputation/{user_id}", response_model=ReputationScore)
async def get_reputation(user_id: str):
    """Get worker's reputation score and metrics"""
    try:
        worker_profile = await worker_profiles_collection.find_one({"userId": user_id})
        
        if not worker_profile:
            return ReputationScore()
        
        return ReputationScore(
            score=float(worker_profile.get("rating", 0.0)),
            reliability=int(worker_profile.get("reliability", 0)),
            communication=int(worker_profile.get("communication", 0)),
            quality=int(worker_profile.get("quality", 0)),
            total_reviews=int(worker_profile.get("totalReviews", 0))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/achievements/{user_id}", response_model=List[Achievement])
async def get_achievements(user_id: str):
    """Get worker's earned achievements"""
    try:
        achievements_cursor = achievements_collection.find({"user_id": user_id})
        achievements_list = await achievements_cursor.to_list(length=None)
        
        result = []
        for ach in achievements_list:
            result.append(Achievement(
                id=ach.get("id", str(uuid.uuid4())),
                name=ach.get("name", "Achievement"),
                icon=ach.get("icon", "🏆"),
                description=ach.get("description", ""),
                earned_at=ach.get("earned_at")
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jobs/search", response_model=List[RecommendedJob])
async def search_jobs(filters: JobFilters, user_id: Optional[str] = None):
    """Search jobs with filters"""
    try:
        query = {"status": "published"}
        
        # Apply filters
        if filters.search:
            query["$or"] = [
                {"title": {"$regex": filters.search, "$options": "i"}},
                {"description": {"$regex": filters.search, "$options": "i"}},
                {"requiredSkills": {"$in": [filters.search]}}
            ]
        
        if filters.location != "any":
            query["workLocation"] = filters.location
        
        if filters.category != "any":
            query["category"] = filters.category
        
        # Budget filter
        if filters.budget != "any":
            budget_ranges = {
                "$0-$50": (0, 50),
                "$50-$100": (50, 100),
                "$100-$500": (100, 500),
                "$500+": (500, float('inf'))
            }
            if filters.budget in budget_ranges:
                min_budget, max_budget = budget_ranges[filters.budget]
                query["budget"] = {"$gte": min_budget}
                if max_budget != float('inf'):
                    query["budget"]["$lte"] = max_budget
        
        jobs_cursor = jobs_collection.find(query).limit(50)
        jobs_list = await jobs_cursor.to_list(length=50)
        
        # Get worker skills for match scoring
        worker_skills = []
        if user_id:
            worker_profile = await worker_profiles_collection.find_one({"userId": user_id})
            worker_skills = worker_profile.get("skills", []) if worker_profile else []
        
        results = []
        for job in jobs_list:
            job_skills = job.get("requiredSkills", [])
            matching_skills = set(worker_skills) & set(job_skills)
            match_score = int((len(matching_skills) / len(job_skills) * 100)) if job_skills else 50
            
            results.append(RecommendedJob(
                id=job.get("jobId", str(uuid.uuid4())),
                priority=job.get("urgency") == "urgent",
                title=job.get("title", "Job Title"),
                rate=float(job.get("budget", 0)) / float(job.get("duration", 1)) if job.get("duration") else 50.0,
                duration=float(job.get("duration", 1)),
                location=job.get("workLocation", "Remote"),
                skills=job_skills,
                client_rating=float(job.get("clientRating", 4.5)),
                client_reviews=int(job.get("clientReviews", 0)),
                match_score=match_score,
                category=job.get("category")
            ))
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
