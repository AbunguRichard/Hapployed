from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import os
import re
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/search", tags=["Search"])

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database(os.getenv('DB_NAME', 'test_database'))

# Collections
jobs_collection = db.jobs
users_collection = db.users

# ============================================================================
# MODELS
# ============================================================================

class SearchSuggestion(BaseModel):
    type: str
    text: str
    category: str

class PopularLocation(BaseModel):
    name: str
    type: str
    count: int

class BudgetRange(BaseModel):
    label: str
    min: int
    max: Optional[int] = None

class ExperienceRange(BaseModel):
    label: str
    min: int
    max: Optional[int] = None

class HourlyRateRange(BaseModel):
    label: str
    min: int
    max: Optional[int] = None

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def experience_level_to_years(level: str) -> int:
    """Convert experience level to years"""
    mapping = {
        'entry': 2,
        'intermediate': 5,
        'expert': 8
    }
    return mapping.get(level, 0)

def get_popular_locations() -> List[Dict]:
    """Get popular location data"""
    return [
        {"name": "Remote", "type": "remote", "count": 1500},
        {"name": "New York, NY", "type": "onsite", "count": 450},
        {"name": "San Francisco, CA", "type": "onsite", "count": 380},
        {"name": "London, UK", "type": "onsite", "count": 320},
        {"name": "Berlin, Germany", "type": "onsite", "count": 280}
    ]

def get_popular_searches(search_type: str) -> List[Dict]:
    """Get popular search suggestions"""
    popular = {
        "gigs": [
            {"type": "popular", "text": "React Developer", "category": "development"},
            {"type": "popular", "text": "Logo Design", "category": "design"},
            {"type": "popular", "text": "Content Writing", "category": "writing"},
            {"type": "popular", "text": "Social Media Marketing", "category": "marketing"}
        ],
        "talents": [
            {"type": "popular", "text": "JavaScript", "category": "skill"},
            {"type": "popular", "text": "UI/UX Design", "category": "skill"},
            {"type": "popular", "text": "Digital Marketing", "category": "skill"},
            {"type": "popular", "text": "Project Management", "category": "skill"}
        ]
    }
    return popular.get(search_type, [])

def calculate_skills_match(job: Dict, user_skills: List[str]) -> float:
    """Calculate skill match percentage"""
    if not user_skills:
        return 0.5
    
    required_skills = []
    if job.get("skills"):
        required_skills = job.get("skills", [])
    elif job.get("aiRequirements", {}).get("requiredSkills"):
        required_skills = [s.get("skill", "") for s in job.get("aiRequirements", {}).get("requiredSkills", [])]
    
    if not required_skills:
        return 0.5
    
    user_skill_set = set(s.lower() for s in user_skills)
    match_count = sum(1 for skill in required_skills if skill.lower() in user_skill_set)
    
    return match_count / len(required_skills)

def calculate_budget_match(job: Dict, preferred_rate: Optional[float]) -> float:
    """Calculate budget match score"""
    if not preferred_rate:
        return 0.5
    
    budget_range = job.get("aiRequirements", {}).get("budgetRange", {})
    if not budget_range:
        return 0.5
    
    min_budget = budget_range.get("min", 0)
    max_budget = budget_range.get("max", 999999)
    
    if min_budget <= preferred_rate <= max_budget:
        return 1.0
    elif preferred_rate < min_budget:
        return 0.8
    else:
        return 0.3

def calculate_location_match(job: Dict, user_location: Optional[Dict]) -> float:
    """Calculate location match score"""
    if not user_location:
        return 0.5
    
    job_location = job.get("aiRequirements", {}).get("locationPreference", {})
    if not job_location:
        return 0.5
    
    if job_location.get("type") == "remote":
        return 1.0
    if user_location.get("type") == "remote":
        return 0.8
    
    return 0.6

# ============================================================================
# SEARCH ROUTES
# ============================================================================

@router.get("/gigs")
async def search_gigs(
    q: Optional[str] = None,
    category: Optional[str] = None,
    skills: Optional[str] = None,
    location: Optional[str] = None,
    budget_min: Optional[int] = None,
    budget_max: Optional[int] = None,
    duration: Optional[str] = None,
    experience_level: Optional[str] = None,
    client_rating: Optional[float] = None,
    sort_by: str = "relevance",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Search for gigs with filters"""
    try:
        query = {"status": "open"}
        
        # Text search
        if q:
            query["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}}
            ]
        
        # Category filter
        if category:
            query["category"] = category
        
        # Skills filter
        if skills:
            skill_list = [s.strip() for s in skills.split(",")]
            query["$or"] = [
                {"skills": {"$in": [re.compile(s, re.IGNORECASE) for s in skill_list]}},
                {"aiRequirements.requiredSkills.skill": {"$in": [re.compile(s, re.IGNORECASE) for s in skill_list]}}
            ]
        
        # Budget filter
        if budget_min or budget_max:
            budget_query = {}
            if budget_min:
                budget_query["$gte"] = budget_min
            if budget_max:
                budget_query["$lte"] = budget_max
            
            query["$or"] = [
                {"budget": budget_query},
                {"aiRequirements.budgetRange.preferred": budget_query}
            ]
        
        # Duration filter
        if duration:
            query["duration"] = {"$regex": duration, "$options": "i"}
        
        # Sort logic
        sort_field = "createdAt"
        sort_order = -1
        
        if sort_by == "newest":
            sort_field, sort_order = "createdAt", -1
        elif sort_by == "budget_high":
            sort_field, sort_order = "budget", -1
        elif sort_by == "budget_low":
            sort_field, sort_order = "budget", 1
        elif sort_by == "relevance":
            sort_field, sort_order = "createdAt", -1
        
        total = await jobs_collection.count_documents(query)
        gigs = await jobs_collection.find(query).sort(sort_field, sort_order).skip((page - 1) * limit).limit(limit).to_list(None)
        
        return {
            "success": True,
            "data": {
                "gigs": gigs,
                "pagination": {
                    "current": page,
                    "pages": (total + limit - 1) // limit,
                    "total": total,
                    "has_more": page < (total + limit - 1) // limit
                },
                "filters": {
                    "category": category,
                    "skills": skills,
                    "budget_min": budget_min,
                    "budget_max": budget_max,
                    "sort_by": sort_by
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/talents")
async def search_talents(
    q: Optional[str] = None,
    skills: Optional[str] = None,
    location: Optional[str] = None,
    exp_min: Optional[int] = None,
    exp_max: Optional[int] = None,
    rate_min: Optional[int] = None,
    rate_max: Optional[int] = None,
    availability: Optional[str] = None,
    verification: Optional[str] = None,
    rating_min: Optional[float] = None,
    sort_by: str = "relevance",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Search for talents with filters"""
    try:
        query = {"userType": "worker"}
        
        # Text search
        if q:
            query["$or"] = [
                {"username": {"$regex": q, "$options": "i"}},
                {"profile.bio": {"$regex": q, "$options": "i"}},
                {"profile.skills": {"$in": [re.compile(q, re.IGNORECASE)]}}
            ]
        
        # Skills filter
        if skills:
            skill_list = [s.strip() for s in skills.split(",")]
            query["profile.skills"] = {"$in": [re.compile(s, re.IGNORECASE) for s in skill_list]}
        
        # Experience filter
        if exp_min or exp_max:
            exp_query = {}
            if exp_min:
                exp_query["$gte"] = exp_min
            if exp_max:
                exp_query["$lte"] = exp_max
            query["profile.experience"] = exp_query
        
        # Hourly rate filter
        if rate_min or rate_max:
            rate_query = {}
            if rate_min:
                rate_query["$gte"] = rate_min
            if rate_max:
                rate_query["$lte"] = rate_max
            query["profile.hourlyRate"] = rate_query
        
        # Availability filter
        if availability:
            query["profile.availability"] = availability
        
        # Verification filter
        if verification:
            query["profile.verificationLevel"] = verification
        
        # Rating filter
        if rating_min:
            query["profile.rating"] = {"$gte": rating_min}
        
        # Sort logic
        sort_field = "profile.rating"
        sort_order = -1
        
        if sort_by == "rating":
            sort_field, sort_order = "profile.rating", -1
        elif sort_by == "experience":
            sort_field, sort_order = "profile.experience", -1
        elif sort_by == "rate_low":
            sort_field, sort_order = "profile.hourlyRate", 1
        elif sort_by == "rate_high":
            sort_field, sort_order = "profile.hourlyRate", -1
        
        total = await users_collection.count_documents(query)
        talents = await users_collection.find(query).sort(sort_field, sort_order).skip((page - 1) * limit).limit(limit).to_list(None)
        
        return {
            "success": True,
            "data": {
                "talents": talents,
                "pagination": {
                    "current": page,
                    "pages": (total + limit - 1) // limit,
                    "total": total,
                    "has_more": page < (total + limit - 1) // limit
                },
                "filters": {
                    "skills": skills,
                    "exp_min": exp_min,
                    "exp_max": exp_max,
                    "rate_min": rate_min,
                    "rate_max": rate_max,
                    "sort_by": sort_by
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suggestions")
async def get_suggestions(q: str, type: str = "gigs"):
    """Get search suggestions"""
    try:
        if len(q) < 2:
            return {"success": True, "data": []}
        
        suggestions = []
        
        if type == "gigs":
            # Get gig title suggestions
            gigs = await jobs_collection.find({
                "title": {"$regex": q, "$options": "i"},
                "status": "open"
            }).limit(5).to_list(None)
            
            suggestions = [
                {
                    "type": "gig",
                    "text": gig.get("title", ""),
                    "category": gig.get("category", "")
                }
                for gig in gigs
            ]
        elif type == "talents":
            # Get talent skill suggestions
            talents = await users_collection.find({
                "profile.skills": {"$regex": q, "$options": "i"},
                "userType": "worker"
            }).limit(5).to_list(None)
            
            suggestions = []
            for talent in talents:
                for skill in talent.get("profile", {}).get("skills", []):
                    if q.lower() in skill.lower() and skill not in [s["text"] for s in suggestions]:
                        suggestions.append({
                            "type": "skill",
                            "text": skill,
                            "category": "skill"
                        })
        
        # Add popular searches
        popular = get_popular_searches(type)
        suggestions.extend(popular)
        
        return {
            "success": True,
            "data": suggestions[:8]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filters")
async def get_search_filters(type: str = "gigs"):
    """Get available search filters"""
    try:
        filters = {}
        
        if type == "gigs":
            # Get distinct categories
            categories = await jobs_collection.distinct("category", {"status": "open"})
            
            filters = {
                "categories": categories,
                "skills": [],  # Would populate from database
                "experience_levels": ["entry", "intermediate", "expert"],
                "locations": get_popular_locations(),
                "budget_ranges": [
                    {"label": "Under $100", "min": 0, "max": 100},
                    {"label": "$100 - $500", "min": 100, "max": 500},
                    {"label": "$500 - $1000", "min": 500, "max": 1000},
                    {"label": "Over $1000", "min": 1000, "max": None}
                ]
            }
        elif type == "talents":
            # Get distinct skills
            all_users = await users_collection.find({"userType": "worker"}).limit(100).to_list(None)
            skills = set()
            for user in all_users:
                skills.update(user.get("profile", {}).get("skills", []))
            
            filters = {
                "skills": list(skills)[:50],
                "locations": get_popular_locations(),
                "experience_ranges": [
                    {"label": "0-2 years", "min": 0, "max": 2},
                    {"label": "3-5 years", "min": 3, "max": 5},
                    {"label": "6-10 years", "min": 6, "max": 10},
                    {"label": "10+ years", "min": 10, "max": None}
                ],
                "hourly_rate_ranges": [
                    {"label": "Under $25/hr", "min": 0, "max": 25},
                    {"label": "$25-$50/hr", "min": 25, "max": 50},
                    {"label": "$50-$100/hr", "min": 50, "max": 100},
                    {"label": "Over $100/hr", "min": 100, "max": None}
                ],
                "availability": ["full-time", "part-time", "flexible", "not-available"],
                "verification_levels": ["basic", "verified", "premium", "expert"]
            }
        
        return {
            "success": True,
            "data": filters
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/advanced")
async def advanced_search(
    q: Optional[str] = None,
    skills: Optional[str] = None,
    user_id: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Advanced AI-powered search for authenticated users"""
    try:
        # Get basic search results
        query = {"status": "open"}
        
        if q:
            query["$or"] = [
                {"title": {"$regex": q, "$options": "i"}},
                {"description": {"$regex": q, "$options": "i"}}
            ]
        
        if skills:
            skill_list = [s.strip() for s in skills.split(",")]
            query["skills"] = {"$in": [re.compile(s, re.IGNORECASE) for s in skill_list]}
        
        total = await jobs_collection.count_documents(query)
        gigs = await jobs_collection.find(query).skip((page - 1) * limit).limit(limit).to_list(None)
        
        # If user authenticated, apply AI ranking
        if user_id:
            user = await users_collection.find_one({"id": user_id})
            if user:
                user_skills = user.get("profile", {}).get("skills", [])
                user_rate = user.get("profile", {}).get("hourlyRate", 0)
                user_location = user.get("profile", {}).get("location", {})
                
                # Calculate AI relevance scores
                for gig in gigs:
                    skills_match = calculate_skills_match(gig, user_skills)
                    budget_match = calculate_budget_match(gig, user_rate)
                    location_match = calculate_location_match(gig, user_location)
                    
                    ai_score = (skills_match * 0.4) + (budget_match * 0.3) + (location_match * 0.2) + (0.1)
                    gig["ai_relevance_score"] = round(ai_score * 100, 2)
                
                # Sort by AI relevance score
                gigs.sort(key=lambda x: x.get("ai_relevance_score", 0), reverse=True)
        
        return {
            "success": True,
            "data": {
                "gigs": gigs,
                "pagination": {
                    "current": page,
                    "pages": (total + limit - 1) // limit,
                    "total": total,
                    "has_more": page < (total + limit - 1) // limit
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
