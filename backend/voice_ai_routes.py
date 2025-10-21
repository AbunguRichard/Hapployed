from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
import logging

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

# Models
class VoiceTranscriptRequest(BaseModel):
    transcript: str
    workType: str  # 'project' or 'gig'

class ParsedProjectData(BaseModel):
    title: str
    description: str
    category: str
    duration: str = ""
    location: str
    specificLocation: str = ""
    minBudget: str
    maxBudget: str
    urgency: str
    type: str
    skills: list = []

@router.post("/parse-voice-input")
async def parse_voice_input(request: VoiceTranscriptRequest):
    """
    Parse voice transcript using AI (GPT-5) to extract project/gig details
    """
    try:
        # Get Emergent LLM Key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key not configured")
        
        # Create system message based on work type
        work_type_label = "project" if request.workType == "project" else "gig"
        
        system_message = f"""You are an AI assistant that extracts structured information from voice transcripts for {work_type_label} postings.

Given a voice transcript, extract the following information and return it as a JSON object:
- title: A concise title (max 50 characters)
- description: The full transcript as the description
- category: One of these categories: 'Web Development', 'Mobile Development', 'Design', 'Writing & Content', 'Marketing', 'Data Science', 'Business', 'Labor & Moving', 'Cleaning', 'Maintenance & Repairs', 'Other'
- duration: Extract time duration if mentioned (e.g., "2 hours", "3 days", "1 week")
- location: Either 'remote' or 'on-site'
- specificLocation: Any specific location details mentioned (address, building name, area, room, etc.)
- minBudget: Estimated minimum budget in dollars (number only, no $ sign)
- maxBudget: Estimated maximum budget in dollars (number only, no $ sign)
- urgency: Either 'urgent' or 'normal' (urgent if they mention: today, asap, immediately, urgent, emergency)
- type: Either 'emergency' if urgent, otherwise 'regular'
- skills: Array of relevant skills needed (e.g., ['Python', 'React'] for tech projects or ['Plumbing', 'Electrical'] for gigs)

Budget estimation guidelines:
- For gigs: Labor & Moving ($50-$150), Cleaning ($40-$100), Maintenance & Repairs ($60-$200), Other ($30-$80)
- For projects: Web Development ($500-$2000), Design ($300-$1000), Marketing ($200-$800), Other ($100-$500)

Return ONLY a valid JSON object, no additional text or explanation."""

        # Initialize LLM Chat with GPT-5
        chat = LlmChat(
            api_key=api_key,
            session_id=f"voice-parse-{request.workType}",
            system_message=system_message
        ).with_model("openai", "gpt-5")
        
        # Create user message
        user_message = UserMessage(
            text=f"Parse this {work_type_label} request: {request.transcript}"
        )
        
        # Get AI response
        response = await chat.send_message(user_message)
        
        logger.info(f"AI Response: {response}")
        
        # Parse the JSON response
        import json
        try:
            parsed_data = json.loads(response)
        except json.JSONDecodeError:
            # Try to extract JSON from the response if it's wrapped in other text
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                parsed_data = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse JSON from AI response")
        
        # Convert data types to match Pydantic model expectations
        if parsed_data.get('duration') is None:
            parsed_data['duration'] = ""
        if parsed_data.get('specificLocation') is None:
            parsed_data['specificLocation'] = ""
        if isinstance(parsed_data.get('minBudget'), (int, float)):
            parsed_data['minBudget'] = str(parsed_data['minBudget'])
        if isinstance(parsed_data.get('maxBudget'), (int, float)):
            parsed_data['maxBudget'] = str(parsed_data['maxBudget'])
        
        # Validate and return parsed data
        result = ParsedProjectData(**parsed_data)
        return result.dict()
        
    except Exception as e:
        logger.error(f"Error parsing voice input: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to parse voice input: {str(e)}")
