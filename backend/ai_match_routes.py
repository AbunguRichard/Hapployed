from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timezone
import uuid
import os
import math
from motor.motor_asyncio import AsyncIOMotorClient
import difflib

router = APIRouter(prefix="/api/ai-match", tags=["AI Match"])

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database(os.getenv('DB_NAME', 'test_database'))

# Collections
matches_collection = db.ai_matches
jobs_collection = db.jobs
gigs_collection = db.gigs
users_collection = db.users
worker_profiles_collection = db.worker_profiles

# ============================================================================
# MODELS
# ============================================================================

class MatchScore(BaseModel):
    skills: float = 0.0
    experience: float = 0.0
    location: float = 0.0
    availability: float = 0.0
    budget: float = 0.0
    culture: float = 0.0
    response_time: float = 0.0
    overall: float = 0.0

class MatchReason(BaseModel):
    category: str
    reason: str
    strength: Literal["high", "medium", "low"]

class Compatibility(BaseModel):
    score: float = 0.0
    level: Literal["perfect", "excellent", "good", "fair"] = "fair"
    predicted_success: float = 0.0

class AIInsights(BaseModel):
    strengths: List[str] = []
    potential_risks: List[str] = []
    recommendations: List[str] = []

class AIMatch(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    job_id: Optional[str] = None
    gig_id: Optional[str] = None
    talent_id: str
    client_id: str
    match_type: Literal["gig", "project", "quickhire_gig", "quickhire_project"]
    scores: MatchScore = MatchScore()
    match_reasons: List[MatchReason] = []
    compatibility: Compatibility = Compatibility()
    status: Literal["pending", "viewed", "applied", "rejected", "accepted", "expired"] = "pending"
    is_quickhire: bool = False
    urgency: Literal["low", "medium", "high", "critical"] = "medium"
    distance: Optional[float] = None
    ai_insights: AIInsights = AIInsights()
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request Models
class ApplyToMatchRequest(BaseModel):
    proposal: str
    proposed_rate: Optional[float] = None

# ============================================================================
# AI MATCHING SERVICE
# ============================================================================

class AIMatchingService:
    
    def __init__(self):
        self.weights = {
            "skills": 0.35,
            "experience": 0.20,
            "location": 0.15,
            "availability": 0.10,
            "budget": 0.10,
            "culture": 0.10
        }
    
    async def find_matches_for_talent(self, talent_id: str, options: Dict = None) -> List[Dict]:
        """Main matching function for talent"""
        options = options or {}
        match_type = options.get("match_type", "all")
        limit = options.get("limit", 20)
        min_score = options.get("min_score", 60)
        location_filter = options.get("location")
        
        # Get talent profile
        talent = await users_collection.find_one({"email": talent_id})
        if not talent:
            talent = await users_collection.find_one({"_id": talent_id})
        
        if not talent:
            return []
        
        # Get worker profile for skills
        worker_profile = await worker_profiles_collection.find_one({"userId": talent.get("email", talent_id)})
        
        # Get opportunities
        opportunities = []
        
        if match_type in ["gig", "all", "quickhire"]:
            gigs = await self.get_relevant_gigs(talent, location_filter)
            opportunities.extend([{"data": g, "type": "gig"} for g in gigs])
        
        if match_type in ["project", "all"]:
            projects = await self.get_relevant_projects(talent, location_filter)
            opportunities.extend([{"data": p, "type": "project"} for p in projects])
        
        # Calculate matches
        matches = []
        for opp in opportunities:
            match_result = await self.calculate_match(talent, worker_profile, opp)
            
            if match_result["scores"]["overall"] >= min_score:
                matches.append({
                    "opportunity": opp["data"],
                    "matchResult": match_result,
                    "type": opp["type"],
                    "isQuickHire": opp["data"].get("urgency") == "urgent"
                })
        
        # Sort by score
        matches.sort(key=lambda x: x["matchResult"]["scores"]["overall"], reverse=True)
        
        return matches[:limit]
    
    async def calculate_match(self, talent: Dict, worker_profile: Dict, opportunity: Dict) -> Dict:
        """Calculate match score between talent and opportunity"""
        opp_data = opportunity["data"]
        opp_type = opportunity["type"]
        
        scores = {
            "skills": await self.calculate_skills_match(talent, worker_profile, opp_data),
            "experience": self.calculate_experience_match(talent, worker_profile, opp_data),
            "location": self.calculate_location_match(talent, opp_data),
            "availability": self.calculate_availability_match(talent, opp_data),
            "budget": self.calculate_budget_match(talent, worker_profile, opp_data),
            "culture": self.calculate_culture_match(talent, opp_data)
        }
        
        # Calculate overall score
        overall = sum(scores[key] * self.weights[key] for key in scores.keys())
        scores["overall"] = round(overall, 2)
        
        # Generate match reasons
        match_reasons = self.generate_match_reasons(scores, talent, opp_data)
        
        # Predict success
        predicted_success = self.predict_success(scores, talent, opp_data)
        
        # Generate insights
        ai_insights = self.generate_ai_insights(scores, talent, opp_data)
        
        return {
            "scores": scores,
            "compatibility": {
                "score": scores["overall"],
                "level": self.get_compatibility_level(scores["overall"]),
                "predictedSuccess": predicted_success
            },
            "matchReasons": match_reasons,
            "aiInsights": ai_insights
        }
    
    async def calculate_skills_match(self, talent: Dict, worker_profile: Dict, opportunity: Dict) -> float:
        """Calculate skills match using string similarity"""
        if not worker_profile:
            return 50.0
        
        talent_skills = worker_profile.get("skills", [])
        required_skills = opportunity.get("requiredSkills", [])
        
        if not required_skills:
            return 80.0
        
        if not talent_skills:
            return 30.0
        
        # Calculate similarity for each required skill
        total_score = 0
        for req_skill in required_skills:
            best_match = max(
                (self.string_similarity(req_skill.lower(), ts.lower()) for ts in talent_skills),
                default=0
            )
            total_score += best_match
        
        avg_score = (total_score / len(required_skills)) * 100
        return min(100.0, avg_score)
    
    def string_similarity(self, str1: str, str2: str) -> float:
        """Calculate string similarity using SequenceMatcher"""
        return difflib.SequenceMatcher(None, str1, str2).ratio()
    
    def calculate_experience_match(self, talent: Dict, worker_profile: Dict, opportunity: Dict) -> float:
        """Calculate experience match"""
        if not worker_profile:
            return 50.0
        
        talent_exp = worker_profile.get("experience", 0)
        required_exp = opportunity.get("experienceRequired", 0)
        
        if required_exp == 0:
            return 80.0
        
        if talent_exp >= required_exp:
            # Bonus for extra experience
            excess = talent_exp - required_exp
            return min(100.0, 80 + (excess * 5))
        else:
            # Penalty for lack of experience
            deficit = required_exp - talent_exp
            return max(0.0, 60 - (deficit * 10))
    
    def calculate_location_match(self, talent: Dict, opportunity: Dict) -> float:
        """Calculate location compatibility"""
        work_location = opportunity.get("workLocation", "Remote")
        
        if work_location.lower() == "remote":
            return 100.0
        
        if work_location.lower() == "hybrid":
            return 80.0
        
        # For onsite, we'd need geolocation data
        # For now, return a base score
        return 50.0
    
    def calculate_availability_match(self, talent: Dict, opportunity: Dict) -> float:
        """Calculate availability match"""
        # Simplified availability check
        urgency = opportunity.get("urgency", "medium")
        
        urgency_scores = {
            "low": 85.0,
            "medium": 90.0,
            "high": 95.0,
            "urgent": 100.0
        }
        
        return urgency_scores.get(urgency, 75.0)
    
    def calculate_budget_match(self, talent: Dict, worker_profile: Dict, opportunity: Dict) -> float:
        """Calculate budget compatibility"""
        if not worker_profile:
            return 50.0
        
        talent_rate = worker_profile.get("hourlyRate", 0)
        opportunity_budget = opportunity.get("budget", 0)
        opportunity_duration = opportunity.get("duration", 1)
        
        if not talent_rate or not opportunity_budget:
            return 50.0
        
        estimated_hourly = opportunity_budget / max(opportunity_duration, 1)
        
        if talent_rate <= estimated_hourly * 1.1:  # Within 110% of budget
            return 90.0
        elif talent_rate <= estimated_hourly * 1.3:  # Within 130% of budget
            return 70.0
        else:
            return 40.0
    
    def calculate_culture_match(self, talent: Dict, opportunity: Dict) -> float:
        """Calculate culture fit (simplified)"""
        # This would involve NLP analysis in production
        # For now, return a base score
        return 75.0
    
    def generate_match_reasons(self, scores: Dict, talent: Dict, opportunity: Dict) -> List[Dict]:
        """Generate human-readable match reasons"""
        reasons = []
        
        if scores["skills"] > 80:
            reasons.append({
                "category": "skills",
                "reason": "Excellent skills alignment",
                "strength": "high"
            })
        
        if scores["experience"] > 75:
            reasons.append({
                "category": "experience",
                "reason": "Strong relevant experience",
                "strength": "high"
            })
        
        if scores["location"] > 90:
            reasons.append({
                "category": "location",
                "reason": "Perfect location match",
                "strength": "high"
            })
        
        if scores["budget"] > 80:
            reasons.append({
                "category": "budget",
                "reason": "Rate within ideal budget range",
                "strength": "medium"
            })
        
        if scores["availability"] > 85:
            reasons.append({
                "category": "availability",
                "reason": "Availability aligns well with project timeline",
                "strength": "medium"
            })
        
        return reasons[:5]
    
    def predict_success(self, scores: Dict, talent: Dict, opportunity: Dict) -> float:
        """Predict success probability"""
        base_score = scores["overall"]
        
        # Adjust based on urgency
        urgency = opportunity.get("urgency", "medium")
        if urgency == "urgent":
            base_score *= 1.1
        
        # Cap between 5-95%
        return min(95.0, max(5.0, base_score))
    
    def generate_ai_insights(self, scores: Dict, talent: Dict, opportunity: Dict) -> Dict:
        """Generate AI insights"""
        insights = {
            "strengths": [],
            "potentialRisks": [],
            "recommendations": []
        }
        
        # Strengths
        if scores["skills"] > 85:
            insights["strengths"].append("Exceptional skills match for this role")
        
        if scores["experience"] > 80:
            insights["strengths"].append("Strong relevant experience")
        
        # Risks
        if scores["availability"] < 60:
            insights["potentialRisks"].append("Availability may not match project timeline")
        
        if scores["budget"] < 60:
            insights["potentialRisks"].append("Budget alignment may need discussion")
        
        # Recommendations
        if opportunity.get("urgency") == "urgent":
            insights["recommendations"].append("Quick response recommended - apply within 24 hours")
        
        if scores["skills"] > 75 and scores["budget"] < 70:
            insights["recommendations"].append("Consider discussing flexible pricing given strong skills match")
        
        return insights
    
    def get_compatibility_level(self, score: float) -> str:
        """Get compatibility level from score"""
        if score >= 90:
            return "perfect"
        elif score >= 80:
            return "excellent"
        elif score >= 70:
            return "good"
        else:
            return "fair"
    
    async def get_relevant_gigs(self, talent: Dict, location_filter: Optional[Dict] = None) -> List[Dict]:
        """Get relevant gigs for talent"""
        query = {
            "status": {"$in": ["published", "active", "open"]}
        }
        
        # Add location filter if provided
        # In production, would use geospatial queries
        
        gigs_cursor = gigs_collection.find(query).limit(25)
        gigs = await gigs_cursor.to_list(length=25)
        
        return gigs
    
    async def get_relevant_projects(self, talent: Dict, location_filter: Optional[Dict] = None) -> List[Dict]:
        """Get relevant projects for talent"""
        query = {
            "status": {"$in": ["published", "active", "open"]}
        }
        
        jobs_cursor = jobs_collection.find(query).limit(25)
        jobs = await jobs_cursor.to_list(length=25)
        
        return jobs

matching_service = AIMatchingService()

# ============================================================================
# ROUTES
# ============================================================================

def get_current_user_id():
    """Mock function - replace with actual JWT auth"""
    return "demo-user-123"

@router.get("/matches")
async def get_matches(
    type: str = Query("all", description="Match type: all, gig, project, quickhire"),
    location: Optional[str] = Query(None, description="Location filter: nearme, remote"),
    limit: int = Query(20, ge=1, le=100),
    min_score: int = Query(60, ge=0, le=100),
    user_id: str = Depends(get_current_user_id)
):
    """Get AI matches for talent"""
    try:
        location_filter = None
        if location == "nearme":
            # In production, would get from user profile
            location_filter = {"lat": 0, "lng": 0, "radius": 50}
        
        matches = await matching_service.find_matches_for_talent(
            user_id,
            {
                "match_type": type,
                "limit": limit,
                "min_score": min_score,
                "location": location_filter
            }
        )
        
        has_quickhire = any(m.get("isQuickHire") for m in matches)
        
        return {
            "success": True,
            "data": {
                "matches": matches,
                "total": len(matches),
                "type": type,
                "hasQuickHire": has_quickhire
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quickhire")
async def get_quickhire_matches(
    type: str = Query("gig", description="Type: gig or project"),
    user_id: str = Depends(get_current_user_id)
):
    """Get QuickHire matches specifically"""
    try:
        # Find urgent/quickhire opportunities
        query = {
            "status": {"$in": ["published", "active", "open"]},
            "urgency": "urgent"
        }
        
        collection = gigs_collection if type == "gig" else jobs_collection
        opportunities_cursor = collection.find(query).limit(10)
        opportunities = await opportunities_cursor.to_list(length=10)
        
        # Get talent profile
        talent = await users_collection.find_one({"email": user_id})
        if not talent:
            talent = await users_collection.find_one({"_id": user_id})
        
        worker_profile = await worker_profiles_collection.find_one({"userId": user_id})
        
        # Calculate quick matches
        matches = []
        for opp in opportunities:
            match_result = await matching_service.calculate_match(
                talent or {},
                worker_profile or {},
                {"data": opp, "type": type}
            )
            
            if match_result["scores"]["overall"] >= 70:
                matches.append({
                    "opportunity": opp,
                    "matchResult": match_result,
                    "type": type,
                    "isQuickHire": True,
                    "responseDeadline": None  # Would come from opp data
                })
        
        matches.sort(key=lambda x: x["matchResult"]["scores"]["overall"], reverse=True)
        
        return {
            "success": True,
            "data": {
                "matches": matches,
                "type": type,
                "total": len(matches),
                "message": f"Found {len(matches)} QuickHire opportunities" if matches else "No QuickHire matches at the moment"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/matches/{match_id}")
async def get_match_details(
    match_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get match details"""
    try:
        match = await matches_collection.find_one({"id": match_id})
        
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Check ownership
        if match.get("talent_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return {
            "success": True,
            "data": match
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/matches/{match_id}/apply")
async def apply_to_match(
    match_id: str,
    request: ApplyToMatchRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Apply to a match"""
    try:
        match = await matches_collection.find_one({"id": match_id})
        
        if not match:
            raise HTTPException(status_code=404, detail="Match not found")
        
        if match.get("talent_id") != user_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        if match.get("status") != "pending":
            raise HTTPException(status_code=400, detail="Match already processed")
        
        # Update match status
        await matches_collection.update_one(
            {"id": match_id},
            {
                "$set": {
                    "status": "applied",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        next_steps = "Client will review your application within 24 hours" if match.get("is_quickhire") else "Client will review your application soon"
        
        return {
            "success": True,
            "message": "Application submitted successfully",
            "data": {
                "matchId": match_id,
                "status": "applied",
                "nextSteps": next_steps
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_match_stats(user_id: str = Depends(get_current_user_id)):
    """Get match statistics"""
    try:
        # Get all matches for user
        matches_cursor = matches_collection.find({"talent_id": user_id})
        all_matches = await matches_cursor.to_list(length=None)
        
        total_matches = len(all_matches)
        
        if total_matches == 0:
            return {
                "success": True,
                "data": {
                    "overview": {
                        "totalMatches": 0,
                        "averageScore": 0,
                        "perfectMatches": 0,
                        "appliedMatches": 0,
                        "acceptedMatches": 0
                    },
                    "byType": [],
                    "successRate": 0
                }
            }
        
        # Calculate stats
        avg_score = sum(m.get("scores", {}).get("overall", 0) for m in all_matches) / total_matches
        perfect_matches = sum(1 for m in all_matches if m.get("scores", {}).get("overall", 0) >= 90)
        applied_matches = sum(1 for m in all_matches if m.get("status") == "applied")
        accepted_matches = sum(1 for m in all_matches if m.get("status") == "accepted")
        
        # By type
        type_stats = {}
        for match in all_matches:
            match_type = match.get("match_type", "unknown")
            if match_type not in type_stats:
                type_stats[match_type] = {"count": 0, "total_score": 0}
            type_stats[match_type]["count"] += 1
            type_stats[match_type]["total_score"] += match.get("scores", {}).get("overall", 0)
        
        by_type = [
            {
                "_id": k,
                "count": v["count"],
                "avgScore": v["total_score"] / v["count"]
            }
            for k, v in type_stats.items()
        ]
        
        success_rate = (accepted_matches / applied_matches * 100) if applied_matches > 0 else 0
        
        return {
            "success": True,
            "data": {
                "overview": {
                    "totalMatches": total_matches,
                    "averageScore": round(avg_score, 2),
                    "perfectMatches": perfect_matches,
                    "appliedMatches": applied_matches,
                    "acceptedMatches": accepted_matches
                },
                "byType": by_type,
                "successRate": round(success_rate, 2)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/improve-recommendations")
async def improve_recommendations(
    skills: List[str] = [],
    preferences: Dict = {},
    user_id: str = Depends(get_current_user_id)
):
    """Improve match recommendations by updating profile"""
    try:
        # Update worker profile
        await worker_profiles_collection.update_one(
            {"userId": user_id},
            {
                "$addToSet": {"skills": {"$each": skills}},
                "$set": {
                    "matchPreferences": preferences,
                    "profileLastUpdated": datetime.now(timezone.utc).isoformat()
                }
            },
            upsert=True
        )
        
        # Generate new matches
        new_matches = await matching_service.find_matches_for_talent(
            user_id,
            {"limit": 10}
        )
        
        return {
            "success": True,
            "message": "Profile updated and new matches generated",
            "data": {
                "newMatches": new_matches,
                "improvedAreas": skills,
                "nextRefresh": (datetime.now(timezone.utc).timestamp() + 2 * 60 * 60) * 1000  # 2 hours in ms
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
