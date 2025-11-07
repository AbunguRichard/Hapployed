from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/quickhire", tags=["QuickHire"])

class GigCreate(BaseModel):
    user_id: str
    title: str
    description: str
    category: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[float] = None
    duration: Optional[str] = None
    is_emergency: bool = False

@router.post("/create")
async def create_gig(gig: GigCreate):
    try:
        supabase = get_supabase_admin()
        gig_id = str(uuid.uuid4())
        gig_data = {
            "id": gig_id,
            "user_id": gig.user_id,
            "title": gig.title,
            "description": gig.description,
            "category": gig.category,
            "location": gig.location,
            "budget": gig.budget,
            "duration": gig.duration,
            "status": "active",
            "is_emergency": gig.is_emergency,
            "created_at": datetime.utcnow().isoformat()
        }
        result = supabase.table('gigs').insert(gig_data).execute()
        return {"success": True, "gig": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_gigs(is_emergency: Optional[bool] = None):
    try:
        supabase = get_supabase_admin()
        query = supabase.table('gigs').select('*').eq('status', 'active')
        if is_emergency is not None:
            query = query.eq('is_emergency', is_emergency)
        result = query.order('created_at', desc=True).execute()
        return {"success": True, "gigs": result.data if result.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{gig_id}")
async def get_gig(gig_id: str):
    try:
        supabase = get_supabase_admin()
        result = supabase.table('gigs').select('*').eq('id', gig_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Gig not found")
        return {"success": True, "gig": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))