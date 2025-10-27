from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/analytics")

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get('DB_NAME', 'test_database')]
events_collection = db['analytics_events']

# Pydantic Models
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
    eventsByName: dict
    conversionRate: Optional[float] = None

# Routes
@router.post("/events", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
async def track_event(event: AnalyticsEvent):
    """Track analytics event for user or guest"""
    event_id = str(uuid.uuid4())
    event_doc = event.dict()
    event_doc['_id'] = event_id
    event_doc['timestamp'] = datetime.utcnow().isoformat()
    
    # Store event
    await events_collection.insert_one(event_doc)
    
    return {
        "id": event_id,
        "eventName": event.eventName,
        "timestamp": event_doc['timestamp'],
        "message": "Event tracked successfully"
    }

@router.post("/alias")
async def alias_user(anonymous_id: str, user_id: str):
    """Alias anonymous guest ID to authenticated user ID for funnel tracking"""
    # Update all events with anonymous_id to include user_id
    result = await events_collection.update_many(
        {"anonymousId": anonymous_id, "userId": None},
        {"$set": {"userId": user_id, "aliasedAt": datetime.utcnow().isoformat()}}
    )
    
    return {
        "message": f"Successfully aliased {result.modified_count} events",
        "anonymousId": anonymous_id,
        "userId": user_id
    }

@router.get("/stats", response_model=EventStats)
async def get_event_stats(
    intent: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get analytics statistics"""
    # Build query
    query = {}
    if intent:
        query['lastIntent'] = intent
    if start_date:
        query['timestamp'] = {'$gte': start_date}
    if end_date:
        query.setdefault('timestamp', {})['$lte'] = end_date
    
    # Get events
    events = await events_collection.find(query).to_list(length=10000)
    
    # Calculate stats
    total_events = len(events)
    events_by_name = {}
    for event in events:
        event_name = event.get('eventName', 'unknown')
        events_by_name[event_name] = events_by_name.get(event_name, 0) + 1
    
    # Calculate conversion rate (guest_open_auth_modal → signup)
    conversion_rate = None
    if 'guest_open_auth_modal' in events_by_name:
        auth_opens = events_by_name['guest_open_auth_modal']
        signups = events_by_name.get('user_signup_complete', 0)
        if auth_opens > 0:
            conversion_rate = (signups / auth_opens) * 100
    
    return {
        "totalEvents": total_events,
        "eventsByName": events_by_name,
        "conversionRate": conversion_rate
    }

@router.get("/funnel")
async def get_conversion_funnel(intent: Optional[str] = None):
    """Get conversion funnel metrics by intent"""
    query = {}
    if intent:
        query['lastIntent'] = intent
    
    events = await events_collection.find(query).to_list(length=10000)
    
    # Calculate funnel stages
    funnel = {
        "landing": 0,
        "browse": 0,
        "intent_action": 0,  # Apply, Post, Message
        "auth_modal_open": 0,
        "signup_complete": 0
    }
    
    for event in events:
        event_name = event.get('eventName', '')
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
    
    return {
        "intent": intent or "all",
        "funnel": funnel,
        "conversion_rates": {
            "landing_to_browse": (funnel['browse'] / funnel['landing'] * 100) if funnel['landing'] > 0 else 0,
            "browse_to_action": (funnel['intent_action'] / funnel['browse'] * 100) if funnel['browse'] > 0 else 0,
            "action_to_auth": (funnel['auth_modal_open'] / funnel['intent_action'] * 100) if funnel['intent_action'] > 0 else 0,
            "auth_to_signup": (funnel['signup_complete'] / funnel['auth_modal_open'] * 100) if funnel['auth_modal_open'] > 0 else 0,
        }
    }
