from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/worker", tags=["Worker Features"])

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database('test_database')
workers_collection = db.workers
achievements_collection = db.achievements
gig_history_collection = db.gig_history

# ============================================================================
# MODELS
# ============================================================================

class WorkerStatus(BaseModel):
    user_id: str
    available_now: bool = False
    radius_miles: int = 10
    current_location: Optional[dict] = None  # {lat, lng, address}
    status_message: Optional[str] = None  # "Heading to downtown for 2 hours"
    available_until: Optional[datetime] = None
    last_updated: datetime = datetime.now()

class Achievement(BaseModel):
    id: str = str(uuid.uuid4())
    user_id: str
    achievement_type: str  # first_responder, weekend_warrior, five_star_streak, neighborhood_hero
    title: str
    description: str
    icon: str
    earned_at: datetime = datetime.now()
    progress: int = 0
    target: int = 0

class GigChainBonus(BaseModel):
    user_id: str
    completed_gig_id: str
    bonus_multiplier: float = 1.5
    next_gig_priority: bool = True
    expires_at: datetime

class WorkerPreferences(BaseModel):
    user_id: str
    preferred_job_types: List[str] = []
    preferred_days: List[str] = []  # monday, tuesday, etc
    preferred_areas: List[str] = []
    min_budget: float = 0
    max_radius: int = 30
    commercial_preferred: bool = False
    residential_preferred: bool = False

class GigSquad(BaseModel):
    squad_id: str = str(uuid.uuid4())
    gig_id: str
    required_roles: List[dict]  # [{role: "plumber", count: 1}, {role: "electrician", count: 1}]
    team_members: List[dict] = []  # [{user_id, role, status: pending/accepted}]
    status: str = "assembling"  # assembling, ready, active, completed
    created_at: datetime = datetime.now()

class CorporatePass(BaseModel):
    pass_id: str = str(uuid.uuid4())
    company_id: str
    plan_type: str  # plumbing_pass, electrical_pass, handyman_pass
    credits_per_month: int = 5
    credits_remaining: int = 5
    priority_access: bool = True
    active: bool = True
    renewal_date: datetime

class GigInsurance(BaseModel):
    gig_id: str
    user_id: str
    coverage_type: str = "quality_guarantee"  # quality_guarantee, payment_protection
    status: str = "active"  # active, claimed, resolved
    claim_window_hours: int = 24
    expires_at: datetime

# ============================================================================
# 1. AVAILABLE NOW TOGGLE
# ============================================================================

@router.post("/status/available")
async def toggle_available_status(status: WorkerStatus):
    """Toggle worker's available now status"""
    try:
        status_dict = status.dict()
        status_dict['last_updated'] = datetime.now().isoformat()
        if status_dict.get('available_until'):
            status_dict['available_until'] = status_dict['available_until'].isoformat()
        
        await workers_collection.update_one(
            {"user_id": status.user_id},
            {"$set": status_dict},
            upsert=True
        )
        
        return {
            "success": True,
            "message": f"Status updated: {'Available Now' if status.available_now else 'Not Available'}",
            "status": status_dict
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status/{user_id}")
async def get_worker_status(user_id: str):
    """Get worker's current status"""
    try:
        status = await workers_collection.find_one({"user_id": user_id})
        if status:
            status.pop('_id', None)
            return status
        return {"available_now": False, "user_id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/available-workers")
async def get_available_workers(radius: int = 10, skills: Optional[str] = None):
    """Get all workers who are available now"""
    try:
        query = {"available_now": True}
        workers = await workers_collection.find(query).to_list(length=100)
        
        for worker in workers:
            worker.pop('_id', None)
        
        return {"workers": workers, "count": len(workers)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# 2. GAMIFICATION SYSTEM
# ============================================================================

ACHIEVEMENT_DEFINITIONS = {
    "first_responder": {
        "title": "⚡ First Responder",
        "description": "Accept within 2 minutes, 10 times",
        "target": 10,
        "icon": "⚡"
    },
    "weekend_warrior": {
        "title": "🎯 Weekend Warrior",
        "description": "Complete 5 weekend gigs",
        "target": 5,
        "icon": "🎯"
    },
    "five_star_streak": {
        "title": "⭐ Five-Star Streak",
        "description": "Get 10 consecutive 5-star reviews",
        "target": 10,
        "icon": "⭐"
    },
    "neighborhood_hero": {
        "title": "🏆 Neighborhood Hero",
        "description": "Complete most gigs in your zip code",
        "target": 20,
        "icon": "🏆"
    },
    "speed_demon": {
        "title": "🚀 Speed Demon",
        "description": "Complete 3 gigs in one day",
        "target": 3,
        "icon": "🚀"
    },
    "reliable_pro": {
        "title": "💎 Reliable Pro",
        "description": "Complete 50 gigs total",
        "target": 50,
        "icon": "💎"
    }
}

@router.post("/achievements/check")
async def check_and_award_achievements(user_id: str):
    """Check and award achievements based on user activity"""
    try:
        # Get user's gig history
        gig_history = await gig_history_collection.find({"user_id": user_id}).to_list(length=None)
        
        new_achievements = []
        
        # Check each achievement type
        for achievement_type, definition in ACHIEVEMENT_DEFINITIONS.items():
            existing = await achievements_collection.find_one({
                "user_id": user_id,
                "achievement_type": achievement_type
            })
            
            if existing:
                continue  # Already earned
            
            progress = 0
            
            # Calculate progress based on type
            if achievement_type == "first_responder":
                progress = len([g for g in gig_history if g.get('response_time_mins', 999) <= 2])
            elif achievement_type == "weekend_warrior":
                progress = len([g for g in gig_history if g.get('day_of_week') in ['Saturday', 'Sunday']])
            elif achievement_type == "reliable_pro":
                progress = len(gig_history)
            
            # Award if target reached
            if progress >= definition['target']:
                achievement = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "achievement_type": achievement_type,
                    "title": definition['title'],
                    "description": definition['description'],
                    "icon": definition['icon'],
                    "earned_at": datetime.now().isoformat(),
                    "progress": progress,
                    "target": definition['target']
                }
                await achievements_collection.insert_one(achievement)
                achievement.pop('_id', None)
                new_achievements.append(achievement)
        
        return {
            "success": True,
            "new_achievements": new_achievements
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """Get all achievements for a user"""
    try:
        achievements = await achievements_collection.find({"user_id": user_id}).to_list(length=None)
        for achievement in achievements:
            achievement.pop('_id', None)
        return {"achievements": achievements}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# 3. WORKER PREFERENCES (for AI matching)
# ============================================================================

@router.post("/preferences")
async def save_worker_preferences(prefs: WorkerPreferences):
    """Save worker preferences for smart matching"""
    try:
        prefs_dict = prefs.dict()
        await workers_collection.update_one(
            {"user_id": prefs.user_id},
            {"$set": {"preferences": prefs_dict}},
            upsert=True
        )
        return {"success": True, "message": "Preferences saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preferences/{user_id}")
async def get_worker_preferences(user_id: str):
    """Get worker preferences"""
    try:
        worker = await workers_collection.find_one({"user_id": user_id})
        if worker and 'preferences' in worker:
            return worker['preferences']
        return {"user_id": user_id, "preferences": {}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# 4. GIG CHAIN - Sequential Booking
# ============================================================================

@router.post("/gig-chain/complete")
async def complete_gig_chain(user_id: str, gig_id: str):
    """Mark gig as complete and activate chain bonus"""
    try:
        # Record completion
        await gig_history_collection.insert_one({
            "user_id": user_id,
            "gig_id": gig_id,
            "completed_at": datetime.now().isoformat(),
            "chain_eligible": True
        })
        
        # Create chain bonus (4-hour window for next gig)
        bonus = {
            "user_id": user_id,
            "completed_gig_id": gig_id,
            "bonus_multiplier": 1.5,
            "next_gig_priority": True,
            "expires_at": (datetime.now() + timedelta(hours=4)).isoformat(),
            "created_at": datetime.now().isoformat()
        }
        
        await db.gig_chain_bonuses.insert_one(bonus)
        
        return {
            "success": True,
            "message": "Gig completed! You have priority access to nearby gigs for 4 hours",
            "bonus": bonus
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gig-chain/{user_id}")
async def get_chain_status(user_id: str):
    """Get active gig chain bonuses"""
    try:
        bonuses = await db.gig_chain_bonuses.find({
            "user_id": user_id,
            "expires_at": {"$gte": datetime.now().isoformat()}
        }).to_list(length=10)
        
        for bonus in bonuses:
            bonus.pop('_id', None)
        
        return {"active_bonuses": bonuses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# 5. GIG SQUAD - Team Assembly
# ============================================================================

@router.post("/squad/create")
async def create_gig_squad(squad: GigSquad):
    """Create a squad for a gig that needs multiple workers"""
    try:
        squad_dict = squad.dict()
        squad_dict['created_at'] = datetime.now().isoformat()
        
        await db.gig_squads.insert_one(squad_dict)
        
        return {
            "success": True,
            "message": "Squad created! Workers can now apply to join",
            "squad_id": squad.squad_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/squad/join")
async def join_squad(squad_id: str, user_id: str, role: str):
    """Worker applies to join a squad"""
    try:
        squad = await db.gig_squads.find_one({"squad_id": squad_id})
        if not squad:
            raise HTTPException(status_code=404, detail="Squad not found")
        
        # Add member
        member = {
            "user_id": user_id,
            "role": role,
            "status": "pending",
            "applied_at": datetime.now().isoformat()
        }
        
        await db.gig_squads.update_one(
            {"squad_id": squad_id},
            {"$push": {"team_members": member}}
        )
        
        return {"success": True, "message": "Application submitted to squad"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/squads/available")
async def get_available_squads():
    """Get squads looking for members"""
    try:
        squads = await db.gig_squads.find({"status": "assembling"}).to_list(length=50)
        for squad in squads:
            squad.pop('_id', None)
        return {"squads": squads}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# 6. CORPORATE GIG PASS
# ============================================================================

@router.post("/corporate-pass/create")
async def create_corporate_pass(pass_data: CorporatePass):
    """Create a corporate subscription pass"""
    try:
        pass_dict = pass_data.dict()
        pass_dict['created_at'] = datetime.now().isoformat()
        pass_dict['renewal_date'] = (datetime.now() + timedelta(days=30)).isoformat()
        
        await db.corporate_passes.insert_one(pass_dict)
        
        return {
            "success": True,
            "message": "Corporate pass activated",
            "pass_id": pass_data.pass_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/corporate-pass/use")
async def use_corporate_pass(pass_id: str):
    """Use one credit from corporate pass"""
    try:
        pass_data = await db.corporate_passes.find_one({"pass_id": pass_id})
        if not pass_data:
            raise HTTPException(status_code=404, detail="Pass not found")
        
        if pass_data['credits_remaining'] <= 0:
            raise HTTPException(status_code=400, detail="No credits remaining")
        
        await db.corporate_passes.update_one(
            {"pass_id": pass_id},
            {"$inc": {"credits_remaining": -1}}
        )
        
        return {"success": True, "credits_remaining": pass_data['credits_remaining'] - 1}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# 7. GIG INSURANCE
# ============================================================================

@router.post("/insurance/activate")
async def activate_gig_insurance(insurance: GigInsurance):
    """Activate insurance for a gig"""
    try:
        insurance_dict = insurance.dict()
        insurance_dict['expires_at'] = (datetime.now() + timedelta(hours=insurance.claim_window_hours)).isoformat()
        insurance_dict['created_at'] = datetime.now().isoformat()
        
        await db.gig_insurance.insert_one(insurance_dict)
        
        return {
            "success": True,
            "message": "Gig is now protected by Hapployed Insurance"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/insurance/claim")
async def file_insurance_claim(gig_id: str, user_id: str, reason: str):
    """File an insurance claim"""
    try:
        claim = {
            "claim_id": str(uuid.uuid4()),
            "gig_id": gig_id,
            "user_id": user_id,
            "reason": reason,
            "status": "under_review",
            "filed_at": datetime.now().isoformat()
        }
        
        await db.insurance_claims.insert_one(claim)
        
        return {
            "success": True,
            "message": "Claim filed. Our team will review within 24 hours",
            "claim_id": claim['claim_id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
