"""
Analytics Routes - Supabase PostgreSQL Version
Event tracking and analytics for user behavior analysis
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime, timezone
import uuid

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/analytics", tags=["Analytics"])

# ============================================================================
# MODELS
# ============================================================================

class AnalyticsEvent(BaseModel):
    eventName: str = Field(..., description="Event name: guest_view_listings, guest_click_apply, guest_open_auth_modal, etc.")
    userId: Optional[str] = Field(None, description="User ID if authenticated")
    anonymousId: Optional[str] = Field(None, description="Anonymous ID for guest tracking")
    lastIntent: Optional[str] = Field(None, description="find_work, hire_talent, post_project")
    metadata: Optional[dict] = Field(default_factory=dict, description="Additional event metadata")
    device: Optional[str] = None
    referrer: Optional[str] = None
    page: Optional[str] = None

class EventResponse(BaseModel):
    id: str
    eventName: str
    timestamp: str
    message: str

class EventStats(BaseModel):
    totalEvents: int
    eventsByName: Dict[str, int]
    conversionRate: Optional[float] = None

# ============================================================================
# ROUTES
# ============================================================================

@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def track_event(event: AnalyticsEvent):
    """Track analytics event for user or guest"""
    try:
        supabase = get_supabase_admin()
        
        event_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        event_data = {
            "id": event_id,
            "event_name": event.eventName,
            "user_id": event.userId if event.userId else None,
            "anonymous_id": event.anonymousId,
            "last_intent": event.lastIntent,
            "metadata": event.metadata,
            "device": event.device,
            "referrer": event.referrer,
            "page": event.page,
            "timestamp": timestamp,
            "created_at": timestamp
        }
        
        result = supabase.table('analytics_events').insert(event_data).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to track event"
            )
        
        return {
            "id": event_id,
            "eventName": event.eventName,
            "timestamp": timestamp,
            "message": "Event tracked successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to track event: {str(e)}"
        )

@router.post("/alias")
async def alias_user(anonymous_id: str = None, user_id: str = None):
    """Alias anonymous guest ID to authenticated user ID for funnel tracking"""
    
    if not anonymous_id or not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both anonymous_id and user_id are required"
        )
    try:
        supabase = get_supabase_admin()
        
        # Get events to update
        events_result = supabase.table('analytics_events').select('id').eq('anonymous_id', anonymous_id).is_('user_id', 'null').execute()
        
        if not events_result.data:
            return {
                "message": "No events found to alias",
                "anonymousId": anonymous_id,
                "userId": user_id,
                "count": 0
            }
        
        # Update all matching events
        update_result = supabase.table('analytics_events').update({
            "user_id": user_id,
            "aliased_at": datetime.now(timezone.utc).isoformat()
        }).eq('anonymous_id', anonymous_id).is_('user_id', 'null').execute()
        
        count = len(update_result.data) if update_result.data else 0
        
        return {
            "message": f"Successfully aliased {count} events",
            "anonymousId": anonymous_id,
            "userId": user_id,
            "count": count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to alias events: {str(e)}"
        )

@router.get("/stats", response_model=EventStats)
async def get_event_stats(
    intent: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get analytics statistics"""
    try:
        supabase = get_supabase_admin()
        
        # Build query
        query = supabase.table('analytics_events').select('*')
        
        if intent:
            query = query.eq('last_intent', intent)
        if start_date:
            query = query.gte('timestamp', start_date)
        if end_date:
            query = query.lte('timestamp', end_date)
        
        # Get events (limit to 10000 for performance)
        result = query.limit(10000).execute()
        
        events = result.data if result.data else []
        
        # Calculate stats
        total_events = len(events)
        events_by_name = {}
        for event in events:
            event_name = event.get('event_name', 'unknown')
            events_by_name[event_name] = events_by_name.get(event_name, 0) + 1
        
        # Calculate conversion rate (guest_open_auth_modal → signup)
        conversion_rate = None
        if 'guest_open_auth_modal' in events_by_name:
            auth_opens = events_by_name['guest_open_auth_modal']
            signups = events_by_name.get('user_signup_complete', 0)
            if auth_opens > 0:
                conversion_rate = round((signups / auth_opens) * 100, 2)
        
        return {
            "totalEvents": total_events,
            "eventsByName": events_by_name,
            "conversionRate": conversion_rate
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get stats: {str(e)}"
        )

@router.get("/funnel")
async def get_conversion_funnel(intent: Optional[str] = None):
    """Get conversion funnel metrics by intent"""
    try:
        supabase = get_supabase_admin()
        
        # Build query
        query = supabase.table('analytics_events').select('event_name')
        
        if intent:
            query = query.eq('last_intent', intent)
        
        result = query.limit(10000).execute()
        
        events = result.data if result.data else []
        
        # Calculate funnel stages
        funnel = {
            "landing": 0,
            "browse": 0,
            "intent_action": 0,
            "auth_modal_open": 0,
            "signup_complete": 0
        }
        
        for event in events:
            event_name = event.get('event_name', '')
            if 'landing' in event_name or 'homepage_view' in event_name:
                funnel['landing'] += 1
            elif 'browse' in event_name or 'view_listings' in event_name:
                funnel['browse'] += 1
            elif 'click_apply' in event_name or 'click_post' in event_name or 'click_message' in event_name:
                funnel['intent_action'] += 1
            elif 'open_auth_modal' in event_name:
                funnel['auth_modal_open'] += 1
            elif 'signup_complete' in event_name:
                funnel['signup_complete'] += 1
        
        # Calculate conversion rates
        conversion_rates = {
            "landing_to_browse": round((funnel['browse'] / funnel['landing'] * 100), 2) if funnel['landing'] > 0 else 0,
            "browse_to_action": round((funnel['intent_action'] / funnel['browse'] * 100), 2) if funnel['browse'] > 0 else 0,
            "action_to_auth": round((funnel['auth_modal_open'] / funnel['intent_action'] * 100), 2) if funnel['intent_action'] > 0 else 0,
            "auth_to_signup": round((funnel['signup_complete'] / funnel['auth_modal_open'] * 100), 2) if funnel['auth_modal_open'] > 0 else 0,
        }
        
        return {
            "intent": intent or "all",
            "funnel": funnel,
            "conversion_rates": conversion_rates
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get funnel: {str(e)}"
        )
