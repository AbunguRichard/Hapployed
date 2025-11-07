"""
Search Routes - Supabase PostgreSQL Version
Advanced search functionality for jobs and talents
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import re

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/search", tags=["Search"])

# ============================================================================
# MODELS
# ============================================================================

class SearchSuggestion(BaseModel):
    type: str
    text: str
    category: str

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

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

# ============================================================================
# ROUTES
# ============================================================================

@router.get("/gigs")
async def search_gigs(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_budget: Optional[int] = Query(None),
    max_budget: Optional[int] = Query(None),
    job_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Search for gigs/jobs"""
    try:
        supabase = get_supabase_admin()
        
        # Build query
        query = supabase.table('jobs').select('*').eq('status', 'published')
        
        # Apply filters
        if category:
            query = query.eq('category', category)
        if job_type:
            query = query.eq('job_type', job_type)
        if min_budget:
            query = query.gte('budget', min_budget)
        if max_budget:
            query = query.lte('budget', max_budget)
        
        # Text search (simple ilike for now)
        if q:
            query = query.or_(f'title.ilike.%{q}%,description.ilike.%{q}%')
        
        # Pagination
        offset = (page - 1) * limit
        result = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
        
        jobs = result.data if result.data else []
        
        return {
            "success": True,
            "jobs": jobs,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(jobs)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/talents")
async def search_talents(
    q: Optional[str] = Query(None, description="Search query for skills or name"),
    skills: Optional[str] = Query(None, description="Comma-separated skills"),
    location: Optional[str] = Query(None),
    min_hourly_rate: Optional[int] = Query(None),
    max_hourly_rate: Optional[int] = Query(None),
    experience_level: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Search for talents/workers"""
    try:
        supabase = get_supabase_admin()
        
        # Build query - search in users table with worker role
        query = supabase.table('users').select('*').contains('roles', ['worker'])
        
        # Text search
        if q:
            query = query.or_(f'name.ilike.%{q}%,bio.ilike.%{q}%')
        
        # Pagination
        offset = (page - 1) * limit
        result = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
        
        workers = result.data if result.data else []
        
        # Get worker profiles for additional info
        enriched_workers = []
        for worker in workers:
            # Get worker profile
            profile_result = supabase.table('worker_profiles').select('*').eq('user_id', worker['id']).execute()
            
            if profile_result.data and len(profile_result.data) > 0:
                profile = profile_result.data[0]
                worker['profile'] = profile
                
                # Filter by skills if specified
                if skills:
                    skill_list = [s.strip() for s in skills.split(',')]
                    worker_skills = profile.get('skills', [])
                    if not any(skill.lower() in [ws.lower() for ws in worker_skills] for skill in skill_list):
                        continue
                
                # Filter by hourly rate if specified
                if min_hourly_rate and profile.get('hourly_rate', 0) < min_hourly_rate:
                    continue
                if max_hourly_rate and profile.get('hourly_rate', 999999) > max_hourly_rate:
                    continue
            
            enriched_workers.append(worker)
        
        return {
            "success": True,
            "talents": enriched_workers[:limit],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": len(enriched_workers)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/suggestions")
async def get_search_suggestions(
    q: Optional[str] = Query(None, description="Partial query for autocomplete"),
    search_type: str = Query("gigs", description="Type: gigs or talents")
):
    """Get search suggestions for autocomplete"""
    try:
        suggestions = []
        
        if not q or len(q) < 2:
            # Return popular searches
            suggestions = get_popular_searches(search_type)
        else:
            # Search in database for matching terms
            supabase = get_supabase_admin()
            
            if search_type == "gigs":
                # Search job titles and categories
                result = supabase.table('jobs').select('title, category').eq('status', 'published').ilike('title', f'%{q}%').limit(10).execute()
                
                for job in (result.data or []):
                    suggestions.append({
                        "type": "job",
                        "text": job['title'],
                        "category": job.get('category', 'other')
                    })
            else:
                # Search worker skills
                result = supabase.table('worker_profiles').select('skills').limit(50).execute()
                
                skills_set = set()
                for profile in (result.data or []):
                    for skill in profile.get('skills', []):
                        if q.lower() in skill.lower():
                            skills_set.add(skill)
                
                for skill in list(skills_set)[:10]:
                    suggestions.append({
                        "type": "skill",
                        "text": skill,
                        "category": "skill"
                    })
        
        return {
            "success": True,
            "suggestions": suggestions
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")

@router.get("/filters")
async def get_filter_options(search_type: str = Query("gigs")):
    """Get available filter options for search"""
    try:
        supabase = get_supabase_admin()
        
        if search_type == "gigs":
            # Get unique categories from jobs
            result = supabase.table('jobs').select('category').eq('status', 'published').execute()
            
            categories = list(set(job['category'] for job in (result.data or []) if job.get('category')))
            
            return {
                "success": True,
                "filters": {
                    "categories": sorted(categories),
                    "locations": get_popular_locations(),
                    "budget_ranges": [
                        {"label": "Under $500", "min": 0, "max": 500},
                        {"label": "$500 - $1,000", "min": 500, "max": 1000},
                        {"label": "$1,000 - $5,000", "min": 1000, "max": 5000},
                        {"label": "$5,000 - $10,000", "min": 5000, "max": 10000},
                        {"label": "$10,000+", "min": 10000, "max": None}
                    ],
                    "job_types": ["project", "gig", "contract", "full-time"]
                }
            }
        else:
            # Get skills from worker profiles
            result = supabase.table('worker_profiles').select('skills').limit(100).execute()
            
            all_skills = set()
            for profile in (result.data or []):
                all_skills.update(profile.get('skills', []))
            
            return {
                "success": True,
                "filters": {
                    "skills": sorted(list(all_skills))[:50],
                    "locations": get_popular_locations(),
                    "experience_levels": ["entry", "intermediate", "expert"],
                    "hourly_rate_ranges": [
                        {"label": "Under $25/hr", "min": 0, "max": 25},
                        {"label": "$25 - $50/hr", "min": 25, "max": 50},
                        {"label": "$50 - $100/hr", "min": 50, "max": 100},
                        {"label": "$100 - $200/hr", "min": 100, "max": 200},
                        {"label": "$200+/hr", "min": 200, "max": None}
                    ]
                }
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get filters: {str(e)}")

@router.get("/advanced")
async def advanced_search(
    q: Optional[str] = Query(None),
    search_type: str = Query("gigs"),
    filters: Optional[str] = Query(None, description="JSON string of filters"),
    sort: str = Query("relevance", description="Sort by: relevance, date, price, rating"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Advanced search with multiple filters and sorting"""
    try:
        if search_type == "gigs":
            return await search_gigs(q=q, page=page, limit=limit)
        else:
            return await search_talents(q=q, page=page, limit=limit)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced search failed: {str(e)}")
