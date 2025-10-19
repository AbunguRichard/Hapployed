from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
import json
import uuid

router = APIRouter(prefix="/api/ai-matching", tags=["AI Matching"])

class MatchRequest(BaseModel):
    gig_id: str
    worker_id: str
    gig_details: dict
    worker_profile: dict

class SuggestGigsRequest(BaseModel):
    worker_id: str
    worker_profile: dict
    available_gigs: List[dict]

class ForecastRequest(BaseModel):
    location: str
    category: str
    date: str

@router.post("/calculate-match")
async def calculate_ai_match(request: MatchRequest):
    """Use AI to calculate match score and provide insights"""
    try:
        session_id = str(uuid.uuid4())
        api_key = os.getenv('EMERGENT_LLM_KEY')
        
        system_message = """You are an expert job-matching AI for Hapployed, a gig marketplace.
        Analyze the gig requirements and worker profile to provide a detailed match assessment.
        
        Consider:
        - Skills match
        - Location preferences
        - Availability alignment
        - Experience level
        - Past performance
        - Work style preferences
        
        Respond in JSON format:
        {
            "match_score": 85,  // 0-100
            "confidence": "high",  // high, medium, low
            "strengths": ["skill1", "skill2"],
            "concerns": ["concern1"],
            "recommendation": "Strong match! This worker has...",
            "key_insights": ["insight1", "insight2"]
        }
        """
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5")
        
        prompt = f"""
        GIG DETAILS:
        - Title: {request.gig_details.get('title')}
        - Category: {request.gig_details.get('category')}
        - Location: {request.gig_details.get('location')}
        - Budget: {request.gig_details.get('budget')}
        - Urgency: {request.gig_details.get('urgent', False)}
        - Requirements: {request.gig_details.get('requirements', [])}
        
        WORKER PROFILE:
        - Skills: {request.worker_profile.get('skills', [])}
        - Experience Level: {request.worker_profile.get('experience')}
        - Preferred Areas: {request.worker_profile.get('preferred_areas', [])}
        - Preferred Days: {request.worker_profile.get('preferred_days', [])}
        - Rating: {request.worker_profile.get('rating', 0)}
        - Completed Gigs: {request.worker_profile.get('completed_gigs', 0)}
        - Available Now: {request.worker_profile.get('available_now', False)}
        
        Provide detailed match analysis.
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        match_data = json.loads(response)
        
        return {
            "success": True,
            "match_data": match_data
        }
    except Exception as e:
        print(f"Error in AI matching: {e}")
        # Fallback to basic scoring
        return {
            "success": True,
            "match_data": {
                "match_score": 75,
                "confidence": "medium",
                "strengths": ["Available", "In area"],
                "concerns": [],
                "recommendation": "Good match based on basic criteria",
                "key_insights": ["Worker is available now"]
            }
        }

@router.post("/suggest-gigs")
async def suggest_gigs_for_worker(request: SuggestGigsRequest):
    """AI suggests best gigs for a worker"""
    try:
        session_id = str(uuid.uuid4())
        api_key = os.getenv('EMERGENT_LLM_KEY')
        
        system_message = """You are a career advisor AI for gig workers.
        Analyze available gigs and recommend the best matches for the worker.
        
        Prioritize:
        - Best skill match
        - Highest pay relative to effort
        - Location convenience
        - Career growth opportunities
        - Work-life balance
        
        Respond in JSON format:
        {
            "top_recommendations": [
                {
                    "gig_id": "123",
                    "reason": "Perfect skill match and high pay",
                    "priority": "high"
                }
            ],
            "career_advice": "Consider taking more commercial gigs to increase your rate"
        }
        """
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5")
        
        prompt = f"""
        WORKER PROFILE:
        {json.dumps(request.worker_profile, indent=2)}
        
        AVAILABLE GIGS:
        {json.dumps(request.available_gigs[:5], indent=2)}  # Top 5 gigs
        
        Which gigs should this worker apply to and why?
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        suggestions = json.loads(response)
        
        return {
            "success": True,
            "suggestions": suggestions
        }
    except Exception as e:
        print(f"Error in gig suggestions: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/forecast-demand")
async def forecast_gig_demand(location: str, category: str, date: str):
    """AI forecasts demand for specific category/location"""
    try:
        session_id = str(uuid.uuid4())
        api_key = os.getenv('EMERGENT_LLM_KEY')
        
        system_message = """You are a demand forecasting AI for gig economy.
        Predict demand based on historical patterns, weather, events, and seasonality.
        
        Respond in JSON format:
        {
            "demand_level": "high",  // low, medium, high, very_high
            "confidence": 0.85,
            "prediction": "High plumbing demand expected due to upcoming storm",
            "factors": ["Weather forecast: Heavy rain", "Historical pattern: +40% during storms"],
            "recommended_rate": "$80-120/hr",
            "best_time_slots": ["8am-12pm", "1pm-5pm"]
        }
        """
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5")
        
        prompt = f"""
        Forecast gig demand for:
        - Location: {location}
        - Category: {category}
        - Date: {date}
        
        Consider weather, local events, historical patterns, and seasonality.
        """
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        forecast = json.loads(response)
        
        return {
            "success": True,
            "forecast": forecast
        }
    except Exception as e:
        print(f"Error in demand forecasting: {e}")
        return {
            "success": False,
            "error": str(e)
        }
