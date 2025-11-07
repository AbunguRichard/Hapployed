from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/messages", tags=["Messages"])

class MessageCreate(BaseModel):
    from_user_id: str
    to_user_id: str
    subject: Optional[str] = None
    content: str
    job_id: Optional[str] = None

@router.post("/send")
async def send_message(message: MessageCreate):
    try:
        supabase = get_supabase_admin()
        msg_id = str(uuid.uuid4())
        msg_data = {
            "id": msg_id,
            "from_user_id": message.from_user_id,
            "to_user_id": message.to_user_id,
            "subject": message.subject,
            "content": message.content,
            "job_id": message.job_id,
            "is_read": False,
            "created_at": datetime.utcnow().isoformat()
        }
        result = supabase.table('messages').insert(msg_data).execute()
        return {"success": True, "message": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/inbox/{user_id}")
async def get_inbox(user_id: str):
    try:
        supabase = get_supabase_admin()
        result = supabase.table('messages').select('*').eq('to_user_id', user_id).order('created_at', desc=True).execute()
        return {"success": True, "messages": result.data if result.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sent/{user_id}")
async def get_sent(user_id: str):
    try:
        supabase = get_supabase_admin()
        result = supabase.table('messages').select('*').eq('from_user_id', user_id).order('created_at', desc=True).execute()
        return {"success": True, "messages": result.data if result.data else []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{message_id}/read")
async def mark_read(message_id: str):
    try:
        supabase = get_supabase_admin()
        result = supabase.table('messages').update({"is_read": True, "read_at": datetime.utcnow().isoformat()}).eq('id', message_id).execute()
        return {"success": True, "message": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))