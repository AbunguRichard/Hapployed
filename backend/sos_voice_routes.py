from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from emergentintegrations.llm.chat import LlmChat, UserMessage
import os
from dotenv import load_dotenv
import uuid
import asyncio
import json

load_dotenv()

router = APIRouter(prefix="/api/sos", tags=["SOS & Voice"])

# Models
class SOSRequest(BaseModel):
    location: str = None
    recentSearch: str = None
    voicePrompt: str = None
    user_id: str

class VoiceCommandRequest(BaseModel):
    voiceText: str
    user_id: str
    preferredLanguage: str = "en"
    inputLanguage: str = None

class IntentResponse(BaseModel):
    intent: str
    category: str
    urgency: str
    description: str
    nearbyHelpers: list

class LanguageDetectRequest(BaseModel):
    text: str

class TranslateRequest(BaseModel):
    text: str
    targetLanguage: str = "en"
    sourceLanguage: str = None

class SmartSuggestionRequest(BaseModel):
    partialText: str
    context: str = "general"

# Helper function to detect intent using AI
async def detect_intent(prompt: str, context: dict) -> dict:
    """Use AI to detect user intent from voice/text prompt"""
    
    session_id = str(uuid.uuid4())
    api_key = os.getenv('EMERGENT_LLM_KEY')
    
    system_message = """You are an intelligent assistant for Hapployed, a gig marketplace platform.
    Your job is to understand what help the user needs and respond with structured information.
    
    Extract:
    1. intent: What service they need (plumber, electrician, cleaner, mover, etc.)
    2. category: The broad category (handyman, tech, general labor, professional, etc.)
    3. urgency: emergency/normal
    4. description: A clear description of what they need
    
    Respond ONLY in JSON format:
    {
        "intent": "plumber",
        "category": "handyman",
        "urgency": "emergency",
        "description": "User needs a plumber for pipe burst"
    }
    """
    
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5")
        
        # Build context message
        context_info = f"User location: {context.get('location', 'unknown')}\n"
        context_info += f"Recent search: {context.get('recentSearch', 'none')}\n"
        context_info += f"User prompt: {prompt}"
        
        user_message = UserMessage(text=context_info)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        import json
        intent_data = json.loads(response)
        return intent_data
        
    except Exception as e:
        print(f"Error detecting intent: {e}")
        # Fallback response
        return {
            "intent": "general helper",
            "category": "general labor",
            "urgency": "normal",
            "description": f"User needs: {prompt}"
        }

# Mock function to find nearby helpers
def find_nearby_helpers(intent: str, location: str, urgency: str) -> list:
    """Mock function - in production, this would query the database"""
    helpers = [
        {
            "id": "1",
            "name": "John Smith",
            "service": intent,
            "distance": "2 mins away",
            "distanceValue": 2,
            "rating": 4.9,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            "verified": True,
            "price": "$50-80/hr"
        },
        {
            "id": "2",
            "name": "Maria Garcia",
            "service": intent,
            "distance": "4 mins away",
            "distanceValue": 4,
            "rating": 4.8,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
            "verified": True,
            "price": "$45-75/hr"
        },
        {
            "id": "3",
            "name": "David Chen",
            "service": intent,
            "distance": "6 mins away",
            "distanceValue": 6,
            "rating": 4.7,
            "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
            "verified": False,
            "price": "$40-70/hr"
        }
    ]
    
    # Sort by distance and return top 3
    helpers.sort(key=lambda x: x['distanceValue'])
    return helpers[:3]

@router.post("/tap-help")
async def tap_for_help(request: SOSRequest):
    """
    SOS Button endpoint - auto-detects what user needs and finds helpers
    """
    try:
        # Build context
        context = {
            "location": request.location or "user location",
            "recentSearch": request.recentSearch or "none",
        }
        
        # Detect intent using AI
        prompt = request.voicePrompt or "need help now"
        intent_data = await detect_intent(prompt, context)
        
        # Find nearby helpers
        helpers = find_nearby_helpers(
            intent_data['intent'], 
            request.location or "nearby",
            intent_data['urgency']
        )
        
        # Build response
        response = {
            "intent": intent_data['intent'],
            "category": intent_data['category'],
            "urgency": intent_data['urgency'],
            "description": intent_data['description'],
            "nearbyHelpers": helpers,
            "narration": f"Found {len(helpers)} {intent_data['intent']}s nearby. Help is on the way."
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/voice-command")
async def process_voice_command(request: VoiceCommandRequest):
    """
    Voice-Only Mode endpoint - processes voice commands
    """
    try:
        session_id = str(uuid.uuid4())
        api_key = os.getenv('EMERGENT_LLM_KEY')
        
        system_message = """You are a voice assistant for Hapployed. 
        Convert user voice commands into structured actions.
        
        Commands can be:
        - "Find me someone to fix my door" -> search for handyman
        - "Post job for cleaning tomorrow" -> create job posting
        - "Show my jobs" -> view user's posted jobs
        - "Find plumber near me" -> search for plumber
        
        Respond in JSON format:
        {
            "action": "search" | "post_job" | "view_jobs",
            "service": "plumber/cleaner/etc",
            "urgency": "normal/emergency",
            "confirmation": "Friendly confirmation message to speak back"
        }
        """
        
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-5")
        
        user_message = UserMessage(text=request.voiceText)
        response = await chat.send_message(user_message)
        
        import json
        command_data = json.loads(response)
        
        # Process the action
        if command_data['action'] == 'search':
            helpers = find_nearby_helpers(
                command_data['service'],
                "nearby",
                command_data['urgency']
            )
            command_data['helpers'] = helpers
        
        return command_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
