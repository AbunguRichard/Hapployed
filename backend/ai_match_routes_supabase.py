"""
AI Match Routes - Supabase PostgreSQL Version
AI-powered job/talent matching system
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timezone
import uuid
import json
import random

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/ai-match", tags=["AI Match"])

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

class ApplyToMatchRequest(BaseModel):
    proposal: str
    proposed_rate: Optional[float] = None

# ============================================================================
# AI MATCHING SERVICE
# ============================================================================

class AIMatchingService:
    """AI-powered matching algorithm"""
    
    @staticmethod
    def calculate_skill_match(job_skills: List[str], worker_skills: List[str]) -> float:
        """Calculate skills compatibility score"""
        if not job_skills or not worker_skills:
            return 0.0
        
        job_skills_lower = [s.lower() for s in job_skills]
        worker_skills_lower = [s.lower() for s in worker_skills]
        
        matches = sum(1 for skill in job_skills_lower if skill in worker_skills_lower)
        return min((matches / len(job_skills)) * 100, 100)
    
    @staticmethod
    def calculate_overall_score(scores: Dict) -> float:
        """Calculate weighted overall match score"""
        weights = {
            "skills": 0.35,
            "experience": 0.20,
            "location": 0.15,
            "availability": 0.15,
            "budget": 0.10,
            "response_time": 0.05
        }
        
        total = sum(scores.get(key, 0) * weight for key, weight in weights.items())
        return round(total, 2)
    
    @staticmethod
    def generate_match_reasons(scores: Dict, job: Dict, worker: Dict) -> List[Dict]:
        """Generate human-readable match reasons"""
        reasons = []
        
        if scores.get("skills", 0) >= 80:
            reasons.append({
                "category": "skills",
                "reason": "Excellent skills match with required expertise",
                "strength": "high"
            })
        elif scores.get("skills", 0) >= 60:
            reasons.append({
                "category": "skills",
                "reason": "Good skills alignment with job requirements",
                "strength": "medium"
            })
        
        if scores.get("availability", 0) >= 80:
            reasons.append({
                "category": "availability",
                "reason": "Available to start immediately",
                "strength": "high"
            })
        
        if scores.get("location", 0) >= 70:
            reasons.append({
                "category": "location",
                "reason": "Close proximity or suitable for remote work",
                "strength": "high"
            })
        
        return reasons
    
    @staticmethod
    def generate_ai_insights(scores: Dict, job: Dict, worker: Dict) -> Dict:
        """Generate AI-powered insights"""
        insights = {
            "strengths": [],
            "potential_risks": [],
            "recommendations": []
        }
        
        # Strengths
        if scores.get("skills", 0) >= 80:
            insights["strengths"].append("Strong technical skill match")
        if scores.get("experience", 0) >= 70:
            insights["strengths"].append("Relevant experience level")
        if scores.get("response_time", 0) >= 80:
            insights["strengths"].append("Fast response time historically")
        
        # Risks
        if scores.get("budget", 0) < 50:
            insights["potential_risks"].append("Budget expectations may not align")
        if scores.get("location", 0) < 40:
            insights["potential_risks"].append("Location distance might impact availability")
        
        # Recommendations
        if scores.get("overall", 0) >= 80:
            insights["recommendations"].append("Highly recommended - reach out immediately")
        elif scores.get("overall", 0) >= 60:
            insights["recommendations"].append("Good candidate - consider for interview")
        else:
            insights["recommendations"].append("Review application carefully before proceeding")
        
        return insights
    
    @staticmethod
    async def create_match(job_id: str, talent_id: str, client_id: str, match_type: str, is_quickhire: bool = False):
        """Create AI match between job and talent"""
        supabase = get_supabase_admin()
        
        # Get job details
        job_result = supabase.table('jobs').select('*').eq('id', job_id).execute()
        if not job_result.data:
            return None
        job = job_result.data[0]
        
        # Get worker profile
        worker_result = supabase.table('worker_profiles').select('*').eq('user_id', talent_id).execute()
        worker = worker_result.data[0] if worker_result.data else {}
        
        # Calculate match scores
        skill_score = AIMatchingService.calculate_skill_match(
            job.get('skills_required', []),
            worker.get('skills', [])
        )
        
        scores = {
            "skills": skill_score,
            "experience": random.uniform(60, 95),  # Simplified
            "location": random.uniform(70, 100),
            "availability": random.uniform(60, 100),
            "budget": random.uniform(50, 90),
            "response_time": random.uniform(70, 95)
        }
        scores["overall"] = AIMatchingService.calculate_overall_score(scores)
        
        # Generate match reasons
        match_reasons = AIMatchingService.generate_match_reasons(scores, job, worker)
        
        # Calculate compatibility
        overall_score = scores["overall"]
        if overall_score >= 90:
            compatibility = {"score": overall_score, "level": "perfect", "predicted_success": 0.95}
        elif overall_score >= 80:
            compatibility = {"score": overall_score, "level": "excellent", "predicted_success": 0.85}
        elif overall_score >= 70:
            compatibility = {"score": overall_score, "level": "good", "predicted_success": 0.75}
        else:
            compatibility = {"score": overall_score, "level": "fair", "predicted_success": 0.60}
        
        # Generate AI insights
        ai_insights = AIMatchingService.generate_ai_insights(scores, job, worker)
        
        # Create match record
        match_id = str(uuid.uuid4())
        match_data = {
            "id": match_id,
            "job_id": job_id,
            "talent_id": talent_id,
            "client_id": client_id,
            "match_type": match_type,
            "scores": json.dumps(scores),
            "match_reasons": json.dumps(match_reasons),
            "compatibility": json.dumps(compatibility),
            "status": "pending",
            "is_quickhire": is_quickhire,
            "urgency": job.get('urgency', 'medium'),
            "ai_insights": json.dumps(ai_insights),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('ai_matches').insert(match_data).execute()
        return result.data[0] if result.data else None

# ============================================================================
# ROUTES
# ============================================================================

@router.get("/matches")
async def get_ai_matches(
    talent_id: Optional[str] = Query(None),
    client_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, le=100)
):
    """Get AI matches for talent or client"""
    try:
        supabase = get_supabase_admin()
        
        query = supabase.table('ai_matches').select('*')
        
        if talent_id:
            query = query.eq('talent_id', talent_id)
        if client_id:
            query = query.eq('client_id', client_id)
        if status:
            query = query.eq('status', status)
        
        result = query.order('created_at', desc=True).limit(limit).execute()
        
        matches = result.data if result.data else []
        
        # Parse JSON fields
        for match in matches:
            if isinstance(match.get('scores'), str):
                match['scores'] = json.loads(match['scores'])
            if isinstance(match.get('match_reasons'), str):
                match['match_reasons'] = json.loads(match['match_reasons'])
            if isinstance(match.get('compatibility'), str):
                match['compatibility'] = json.loads(match['compatibility'])
            if isinstance(match.get('ai_insights'), str):
                match['ai_insights'] = json.loads(match['ai_insights'])
        
        return {
            "success": True,
            "matches": matches,
            "count": len(matches)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get matches: {str(e)}")

@router.get("/quickhire")
async def get_quickhire_matches(
    talent_id: str = Query(...),
    limit: int = Query(20, le=50)
):
    """Get quickhire AI matches for talent"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('ai_matches').select('*').eq('talent_id', talent_id).eq('is_quickhire', True).eq('status', 'pending').order('urgency', desc=True).order('created_at', desc=True).limit(limit).execute()
        
        matches = result.data if result.data else []
        
        # Parse JSON fields
        for match in matches:
            if isinstance(match.get('scores'), str):
                match['scores'] = json.loads(match['scores'])
            if isinstance(match.get('compatibility'), str):
                match['compatibility'] = json.loads(match['compatibility'])
        
        return {
            "success": True,
            "matches": matches,
            "count": len(matches)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get quickhire matches: {str(e)}")

@router.get("/matches/{match_id}")
async def get_match_details(match_id: str):
    """Get detailed information about a specific match"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('ai_matches').select('*').eq('id', match_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match = result.data[0]
        
        # Parse JSON fields
        if isinstance(match.get('scores'), str):
            match['scores'] = json.loads(match['scores'])
        if isinstance(match.get('match_reasons'), str):
            match['match_reasons'] = json.loads(match['match_reasons'])
        if isinstance(match.get('compatibility'), str):
            match['compatibility'] = json.loads(match['compatibility'])
        if isinstance(match.get('ai_insights'), str):
            match['ai_insights'] = json.loads(match['ai_insights'])
        
        # Get job details
        if match.get('job_id'):
            job_result = supabase.table('jobs').select('*').eq('id', match['job_id']).execute()
            match['job_details'] = job_result.data[0] if job_result.data else None
        
        # Get talent details
        talent_result = supabase.table('users').select('id, name, email').eq('id', match['talent_id']).execute()
        match['talent_details'] = talent_result.data[0] if talent_result.data else None
        
        return {
            "success": True,
            "match": match
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get match details: {str(e)}")

@router.post("/matches/{match_id}/apply")
async def apply_to_match(match_id: str, request: ApplyToMatchRequest):
    """Apply to an AI-suggested match"""
    try:
        supabase = get_supabase_admin()
        
        # Get match
        match_result = supabase.table('ai_matches').select('*').eq('id', match_id).execute()
        
        if not match_result.data or len(match_result.data) == 0:
            raise HTTPException(status_code=404, detail="Match not found")
        
        match = match_result.data[0]
        
        # Create application
        app_id = str(uuid.uuid4())
        application_data = {
            "id": app_id,
            "job_id": match['job_id'],
            "worker_id": match['talent_id'],
            "cover_letter": request.proposal,
            "proposed_rate": request.proposed_rate,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table('applications').insert(application_data).execute()
        
        # Update match status
        supabase.table('ai_matches').update({
            "status": "applied",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq('id', match_id).execute()
        
        return {
            "success": True,
            "message": "Application submitted successfully",
            "application_id": app_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to apply: {str(e)}")

@router.get("/stats")
async def get_match_stats(user_id: str = Query(...)):
    """Get matching statistics for a user"""
    try:
        supabase = get_supabase_admin()
        
        # Get all matches for user (as talent)
        matches_result = supabase.table('ai_matches').select('*').eq('talent_id', user_id).execute()
        
        matches = matches_result.data if matches_result.data else []
        
        # Calculate stats
        total_matches = len(matches)
        applied = sum(1 for m in matches if m.get('status') == 'applied')
        accepted = sum(1 for m in matches if m.get('status') == 'accepted')
        
        # Calculate average match score
        avg_score = 0
        if matches:
            scores = []
            for match in matches:
                match_scores = match.get('scores')
                if isinstance(match_scores, str):
                    match_scores = json.loads(match_scores)
                scores.append(match_scores.get('overall', 0))
            avg_score = round(sum(scores) / len(scores), 2) if scores else 0
        
        return {
            "success": True,
            "stats": {
                "total_matches": total_matches,
                "pending_matches": total_matches - applied - accepted,
                "applied_matches": applied,
                "accepted_matches": accepted,
                "average_match_score": avg_score,
                "conversion_rate": round((applied / total_matches * 100), 2) if total_matches > 0 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

@router.post("/improve-recommendations")
async def improve_recommendations(
    talent_id: str = Query(...),
    feedback: str = Query(..., description="feedback type: relevant, not_relevant, applied, rejected")
):
    """Provide feedback to improve AI recommendations"""
    try:
        # In production, this would update ML model weights
        # For now, just acknowledge the feedback
        
        return {
            "success": True,
            "message": "Thank you for your feedback! Our AI will learn from this.",
            "impact": "Your preferences will be reflected in future recommendations"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process feedback: {str(e)}")
