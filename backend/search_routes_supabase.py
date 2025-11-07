from fastapi import APIRouter, HTTPException
from typing import Optional
from supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/search", tags=["Search"])

@router.get("/jobs")
async def search_jobs(query: str, category: Optional[str] = None, location: Optional[str] = None):
    try:
        supabase = get_supabase_admin()
        q = supabase.table('jobs').select('*').eq('status', 'published')
        if category:
            q = q.eq('category', category)
        if query:
            q = q.or_(f"title.ilike.%{query}%,description.ilike.%{query}%")
        result = q.order('created_at', desc=True).execute()
        return {"success": True, "jobs": result.data if result.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/workers")
async def search_workers(query: str, skills: Optional[str] = None):
    try:
        supabase = get_supabase_admin()
        q = supabase.table('worker_profiles').select('*').eq('is_available', True)
        if query:
            q = q.or_(f"name.ilike.%{query}%,bio.ilike.%{query}%")
        result = q.order('rating', desc=True).execute()
        return {"success": True, "workers": result.data if result.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))