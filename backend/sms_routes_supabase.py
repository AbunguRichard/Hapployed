from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timedelta, timezone
import uuid
import os
import re
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

router = APIRouter(prefix="/api/sms", tags=["SMS Gateway"])

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database(os.getenv('DB_NAME', 'test_database'))

# Collections
sms_commands_collection = db.sms_commands
sms_sessions_collection = db.sms_sessions
offline_gigs_collection = db.offline_gigs
users_collection = db.users
jobs_collection = db.jobs

# Helper function to convert MongoDB ObjectId to string
def convert_objectid(doc):
    """Recursively convert ObjectId to string in document"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [convert_objectid(item) for item in doc]
    if isinstance(doc, dict):
        return {key: str(value) if isinstance(value, ObjectId) else convert_objectid(value) 
                for key, value in doc.items()}
    return doc

# ============================================================================
# MODELS
# ============================================================================

class SMSWebhookRequest(BaseModel):
    From: str = Field(..., description="Sender phone number")
    To: Optional[str] = None
    Body: str = Field(..., description="SMS message content")
    MessageSid: Optional[str] = None
    NumMedia: Optional[int] = 0
    MediaUrls: Optional[List[str]] = []

class SendSMSRequest(BaseModel):
    phone_number: str
    message: str

class SyncGigRequest(BaseModel):
    gig_id: str

class BroadcastRequest(BaseModel):
    message: str
    filter_criteria: Optional[Dict] = None

class ParsedData(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[str] = None
    gig_id: Optional[str] = None

class SMSCommandCreate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    phone_number: str
    command: Literal["create_gig", "update_gig", "delete_gig", "status", "help"]
    raw_message: str
    parsed_data: ParsedData = ParsedData()
    status: Literal["received", "processing", "completed", "failed"] = "received"
    response_message: Optional[str] = None
    response_sent: bool = False
    response_error: Optional[str] = None
    message_count: int = 1
    is_multi_part: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    processed_at: Optional[datetime] = None

class OfflineGigCreate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    phone_number: str
    title: str
    description: Optional[str] = "No description provided"
    category: str = "other"
    price: Optional[float] = None
    duration: Optional[str] = None
    location: str = "Not specified"
    status: Literal["draft", "pending_sync", "published", "failed"] = "draft"
    source: Literal["sms", "web", "app"] = "sms"
    sms_command_id: Optional[str] = None
    sync_attempts: int = 0
    last_sync_attempt: Optional[datetime] = None
    last_sync_error: Optional[str] = None
    synced_at: Optional[datetime] = None
    character_count: int = 0
    language: str = "en"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ============================================================================
# SMS PARSING SERVICE
# ============================================================================

class SMSParserService:
    
    def __init__(self):
        self.categories = {
            'development': ['web', 'app', 'software', 'code', 'programming', 'developer', 'website'],
            'design': ['design', 'logo', 'graphic', 'ui', 'ux', 'photoshop', 'illustrator'],
            'writing': ['write', 'article', 'content', 'blog', 'copy', 'translation', 'editing'],
            'marketing': ['marketing', 'social', 'seo', 'promote', 'ads', 'advertising'],
            'business': ['business', 'consult', 'plan', 'strategy', 'management'],
            'video': ['video', 'edit', 'animation', 'film', 'youtube'],
            'music': ['music', 'audio', 'sound', 'produce', 'recording']
        }
    
    def detect_command(self, message: str) -> str:
        """Detect the command type from message"""
        message_lower = message.lower()
        
        if 'help' in message_lower:
            return 'help'
        if 'status' in message_lower:
            return 'status'
        if 'delete' in message_lower or 'cancel' in message_lower:
            return 'delete_gig'
        if 'update' in message_lower or 'edit' in message_lower:
            return 'update_gig'
        
        # Default to create gig
        return 'create_gig'
    
    def parse_create_gig(self, message: str) -> ParsedData:
        """Parse create gig command"""
        data = ParsedData()
        
        # Extract price (look for $ followed by numbers)
        price_match = re.search(r'\$(\d+)', message)
        if price_match:
            data.price = float(price_match.group(1))
        
        # Extract duration (weeks, days, months)
        duration_match = re.search(r'(\d+)\s*(week|day|month|w|d|m)s?', message, re.IGNORECASE)
        if duration_match:
            num = duration_match.group(1)
            unit = duration_match.group(2).lower()
            unit = unit.replace('w', 'week').replace('d', 'day').replace('m', 'month')
            data.duration = f"{num} {unit}{'s' if int(num) > 1 else ''}"
        
        # Extract category
        data.category = self.detect_category(message)
        
        # Extract title (first meaningful words)
        words = message.split()
        filtered_words = [w for w in words if w.lower() not in ['create', 'gig', 'job', 'post', 'new', 'for']]
        
        # Take first 7 words as title, rest as description
        data.title = ' '.join(filtered_words[:7])
        data.description = ' '.join(filtered_words[7:]) if len(filtered_words) > 7 else 'No description provided'
        
        return data
    
    def detect_category(self, message: str) -> str:
        """Detect category from message keywords"""
        message_lower = message.lower()
        
        for category, keywords in self.categories.items():
            if any(keyword in message_lower for keyword in keywords):
                return category
        
        return 'other'
    
    def parse_update_gig(self, message: str) -> ParsedData:
        """Parse update gig command"""
        data = ParsedData()
        
        # Extract gig ID
        id_match = re.search(r'(?:gig|job)\s+(\w+)', message, re.IGNORECASE)
        if id_match:
            data.gig_id = id_match.group(1)
        
        # Extract price update
        price_match = re.search(r'price\s*\$?\s*(\d+)', message, re.IGNORECASE)
        if price_match:
            data.price = float(price_match.group(1))
        
        # Extract title update
        title_match = re.search(r'title\s*["\']?([^"\']+)["\']?', message, re.IGNORECASE)
        if title_match:
            data.title = title_match.group(1).strip()
        
        return data
    
    def parse_delete_gig(self, message: str) -> ParsedData:
        """Parse delete gig command"""
        data = ParsedData()
        
        id_match = re.search(r'(?:gig|job)\s+(\w+)', message, re.IGNORECASE)
        if id_match:
            data.gig_id = id_match.group(1)
        
        return data
    
    async def parse_sms_message(self, message: str) -> Dict:
        """Parse SMS message and return command and data"""
        command = self.detect_command(message)
        data = ParsedData()
        
        if command == 'create_gig':
            data = self.parse_create_gig(message)
        elif command == 'update_gig':
            data = self.parse_update_gig(message)
        elif command == 'delete_gig':
            data = self.parse_delete_gig(message)
        
        return {"command": command, "data": data}

# Initialize parser service
sms_parser = SMSParserService()

# ============================================================================
# SMS PROCESSING FUNCTIONS
# ============================================================================

async def find_or_create_user_by_phone(phone_number: str) -> Dict:
    """Find or create user by phone number"""
    # Normalize phone number
    normalized_phone = re.sub(r'[^\d+]', '', phone_number)
    
    # Try to find existing user
    user = await users_collection.find_one({
        "$or": [
            {"phoneNumber": normalized_phone},
            {"profile.phone": normalized_phone}
        ]
    })
    
    if not user:
        # Create new SMS user
        username = f"sms_user_{datetime.now().timestamp()}"
        user_data = {
            "id": str(uuid.uuid4()),
            "username": username,
            "email": f"{username}@sms.hapployed.com",
            "phoneNumber": normalized_phone,
            "password": "sms_auth_not_required",  # SMS users don't need password
            "userType": "client",
            "profile": {
                "phone": normalized_phone,
                "registrationSource": "sms",
                "isVerified": True
            },
            "verification": {
                "phoneVerified": True,
                "phoneVerifiedAt": datetime.now(timezone.utc)
            },
            "createdAt": datetime.now(timezone.utc)
        }
        await users_collection.insert_one(user_data)
        user = user_data
    
    return user

async def create_gig_from_sms(user: Dict, sms_command_id: str, data: ParsedData, phone_number: str) -> str:
    """Create an offline gig from SMS"""
    try:
        # Create offline gig
        offline_gig = OfflineGigCreate(
            user_id=user["id"],
            phone_number=phone_number,
            title=data.title or "Untitled Gig",
            description=data.description,
            category=data.category,
            price=data.price,
            duration=data.duration,
            status="pending_sync",
            sms_command_id=sms_command_id,
            character_count=len(data.title or "") + len(data.description or "")
        )
        
        await offline_gigs_collection.insert_one(offline_gig.dict())
        
        # Attempt to sync with main database
        await sync_gig_to_main_database(offline_gig.id)
        
        return f"✅ Gig created successfully! ID: {offline_gig.id[:8]}. Title: {offline_gig.title}. Price: ${offline_gig.price or 'N/A'}. It will be live shortly."
    except Exception as e:
        return f"❌ Failed to create gig. Error: {str(e)}. Please try again or contact support."

async def sync_gig_to_main_database(offline_gig_id: str):
    """Sync offline gig to main gigs collection"""
    try:
        offline_gig = await offline_gigs_collection.find_one({"id": offline_gig_id})
        if not offline_gig:
            raise Exception("Offline gig not found")
        
        # Create main gig
        main_gig = {
            "id": str(uuid.uuid4()),
            "title": offline_gig["title"],
            "description": offline_gig["description"],
            "category": offline_gig["category"],
            "budget": offline_gig.get("price", 0),
            "duration": offline_gig.get("duration", "Not specified"),
            "clientId": offline_gig["user_id"],
            "status": "open",
            "source": "sms",
            "location": offline_gig["location"],
            "skills": [offline_gig["category"]],
            "aiRequirements": {
                "requiredSkills": [{"skill": offline_gig["category"], "level": "intermediate", "weight": 1}],
                "locationPreference": {"type": "remote"},
                "budgetRange": {
                    "min": offline_gig.get("price", 0) * 0.8 if offline_gig.get("price") else 0,
                    "max": offline_gig.get("price", 0) * 1.2 if offline_gig.get("price") else 0,
                    "preferred": offline_gig.get("price", 0)
                }
            },
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc)
        }
        
        await jobs_collection.insert_one(main_gig)
        
        # Update offline gig status
        await offline_gigs_collection.update_one(
            {"id": offline_gig_id},
            {"$set": {
                "status": "published",
                "synced_at": datetime.now(timezone.utc),
                "sync_attempts": offline_gig.get("sync_attempts", 0) + 1
            }}
        )
        
        return main_gig
    except Exception as e:
        # Mark sync failed
        await offline_gigs_collection.update_one(
            {"id": offline_gig_id},
            {"$set": {
                "last_sync_attempt": datetime.now(timezone.utc),
                "sync_attempts": {"$inc": 1},
                "last_sync_error": str(e)
            }}
        )
        raise e

async def update_gig_from_sms(user: Dict, data: ParsedData) -> str:
    """Update gig from SMS"""
    if not data.gig_id:
        return '❌ Please specify gig ID. Format: UPDATE GIG [ID] [FIELD] [VALUE]'
    
    try:
        gig = await jobs_collection.find_one({"id": data.gig_id, "clientId": user["id"]})
        
        if not gig:
            return f"❌ Gig {data.gig_id} not found or you don't have permission to update it."
        
        updates = {}
        if data.price:
            updates["budget"] = data.price
        if data.title:
            updates["title"] = data.title
        
        if not updates:
            return '❌ No valid updates provided. Supported fields: price, title.'
        
        updates["updatedAt"] = datetime.now(timezone.utc)
        await jobs_collection.update_one({"id": data.gig_id}, {"$set": updates})
        
        return f"✅ Gig {data.gig_id[:8]} updated successfully. Changes: {', '.join(updates.keys())}."
    except Exception as e:
        return f"❌ Failed to update gig. Error: {str(e)}."

async def delete_gig_from_sms(user: Dict, data: ParsedData) -> str:
    """Delete/cancel gig from SMS"""
    if not data.gig_id:
        return '❌ Please specify gig ID. Format: DELETE GIG [ID]'
    
    try:
        result = await jobs_collection.update_one(
            {"id": data.gig_id, "clientId": user["id"]},
            {"$set": {"status": "cancelled", "updatedAt": datetime.now(timezone.utc)}}
        )
        
        if result.modified_count == 0:
            return f"❌ Gig {data.gig_id} not found or you don't have permission to delete it."
        
        return f"✅ Gig {data.gig_id[:8]} has been cancelled."
    except Exception as e:
        return f"❌ Failed to delete gig. Error: {str(e)}."

async def get_user_status(user: Dict) -> str:
    """Get user's gig status"""
    try:
        active_gigs = await jobs_collection.count_documents({
            "clientId": user["id"],
            "status": "open"
        })
        
        completed_gigs = await jobs_collection.count_documents({
            "clientId": user["id"],
            "status": "completed"
        })
        
        # Calculate earnings (sum of completed gig budgets)
        pipeline = [
            {"$match": {"clientId": user["id"], "status": "completed"}},
            {"$group": {"_id": None, "total": {"$sum": "$budget"}}}
        ]
        earnings_result = await jobs_collection.aggregate(pipeline).to_list(1)
        earnings = earnings_result[0]["total"] if earnings_result else 0
        
        return f"""📊 Your Status:
Active Gigs: {active_gigs}
Completed: {completed_gigs}
Total Earnings: ${earnings}
View details: app.hapployed.com/dashboard"""
    except Exception as e:
        return f"❌ Could not fetch your status. Error: {str(e)}"

def get_help_message() -> str:
    """Get help message"""
    return """🆘 HAPPLOYED SMS HELP:

📝 CREATE GIG:
"Web development $500 2 weeks"
"Logo design $150"
"Content writing $200"

✏️ UPDATE GIG:
"Update gig ABC123 price $600"

🗑️ DELETE GIG:
"Delete gig ABC123"

📊 CHECK STATUS:
"Status"

💡 TIPS:
- Include price with $ sign
- Mention duration (days/weeks/months)
- Keep descriptions concise

Need help? Visit hapployed.com"""

async def process_sms_command(phone_number: str, message: str) -> str:
    """Main SMS processing function"""
    try:
        # Find or create user
        user = await find_or_create_user_by_phone(phone_number)
        
        # Parse message
        parsed = await sms_parser.parse_sms_message(message)
        command = parsed["command"]
        data = parsed["data"]
        
        # Create SMS command record
        sms_command = SMSCommandCreate(
            user_id=user["id"],
            phone_number=phone_number,
            command=command,
            raw_message=message,
            parsed_data=data
        )
        
        await sms_commands_collection.insert_one(sms_command.dict())
        
        # Process command
        response = ""
        if command == "create_gig":
            response = await create_gig_from_sms(user, sms_command.id, data, phone_number)
        elif command == "update_gig":
            response = await update_gig_from_sms(user, data)
        elif command == "delete_gig":
            response = await delete_gig_from_sms(user, data)
        elif command == "status":
            response = await get_user_status(user)
        elif command == "help":
            response = get_help_message()
        else:
            response = "❓ Unknown command. Send 'HELP' for instructions."
        
        # Update SMS command with response
        await sms_commands_collection.update_one(
            {"id": sms_command.id},
            {"$set": {
                "response_message": response,
                "status": "completed",
                "processed_at": datetime.now(timezone.utc)
            }}
        )
        
        return response
    except Exception as e:
        print(f"Error processing SMS: {e}")
        return f"❌ System error. Please try again. Error: {str(e)}"

# ============================================================================
# SMS ROUTES
# ============================================================================

@router.post("/webhook/incoming")
async def incoming_sms_webhook(request: SMSWebhookRequest, background_tasks: BackgroundTasks):
    """Webhook for receiving incoming SMS from Twilio/Africa's Talking"""
    try:
        print(f"Incoming SMS from {request.From}: {request.Body}")
        
        # Process SMS in background
        response = await process_sms_command(request.From, request.Body)
        
        # In production, this would send SMS via gateway
        # For now, just log the response
        print(f"Response to {request.From}: {response}")
        
        return {
            "success": True,
            "message": "SMS processed",
            "response": response
        }
    except Exception as e:
        print(f"Error in SMS webhook: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@router.post("/send")
async def send_sms(request: SendSMSRequest):
    """Manual SMS sending endpoint (for testing/admin)"""
    try:
        # Mock SMS sending for now
        print(f"Mock SMS to {request.phone_number}: {request.message}")
        
        return {
            "success": True,
            "data": {
                "phone_number": request.phone_number,
                "message": request.message,
                "provider": "mock",
                "message_id": str(uuid.uuid4()),
                "status": "sent"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_sms_analytics(range: str = Query("7d", regex="^(24h|7d|30d)$")):
    """Get SMS usage analytics"""
    try:
        # Calculate date range
        now = datetime.now(timezone.utc)
        if range == "24h":
            start_date = now - timedelta(days=1)
        elif range == "7d":
            start_date = now - timedelta(days=7)
        else:  # 30d
            start_date = now - timedelta(days=30)
        
        # Aggregate SMS commands by date
        pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}
                },
                "totalMessages": {"$sum": 1},
                "totalCost": {"$sum": 0.01},  # Mock cost
                "successful": {
                    "$sum": {"$cond": [{"$eq": ["$status", "completed"]}, 1, 0]}
                }
            }},
            {"$sort": {"_id": 1}}
        ]
        
        analytics = await sms_commands_collection.aggregate(pipeline).to_list(None)
        
        return {
            "success": True,
            "data": convert_objectid(analytics)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/offline-gigs")
async def get_offline_gigs(
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get pending offline gigs"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        total = await offline_gigs_collection.count_documents(query)
        gigs = await offline_gigs_collection.find(query).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(None)
        
        return {
            "success": True,
            "data": {
                "gigs": convert_objectid(gigs),
                "pagination": {
                    "current": page,
                    "pages": (total + limit - 1) // limit,
                    "total": total
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync-gig/{gig_id}")
async def manual_sync_gig(gig_id: str):
    """Manually sync an offline gig"""
    try:
        result = await sync_gig_to_main_database(gig_id)
        
        return {
            "success": True,
            "message": "Gig synced successfully",
            "data": convert_objectid(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_user_sms_history(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Get user's SMS command history"""
    try:
        total = await sms_commands_collection.count_documents({"user_id": user_id})
        commands = await sms_commands_collection.find({"user_id": user_id}).sort("created_at", -1).skip((page - 1) * limit).limit(limit).to_list(None)
        
        return {
            "success": True,
            "data": {
                "commands": convert_objectid(commands),
                "pagination": {
                    "current": page,
                    "pages": (total + limit - 1) // limit,
                    "total": total
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def get_sms_templates():
    """Get SMS command templates"""
    templates = {
        "create_gig": [
            "Web development $500 2 weeks",
            "Logo design $150",
            "Content writing 5 articles $200 1 week",
            "Social media marketing $300 month",
            "Mobile app development $1000 4 weeks"
        ],
        "update_gig": [
            "Update gig [ID] price $600",
            "Update gig [ID] title New Project Title"
        ],
        "delete_gig": [
            "Delete gig [ID]"
        ],
        "status": [
            "Status",
            "Status my gigs"
        ]
    }
    
    return {
        "success": True,
        "data": templates
    }

@router.get("/health")
async def get_sms_health():
    """Get SMS gateway health status"""
    try:
        pending_responses = await sms_commands_collection.count_documents({
            "response_sent": False,
            "status": "completed"
        })
        
        pending_gigs = await offline_gigs_collection.count_documents({
            "status": "pending_sync"
        })
        
        failed_gigs = await offline_gigs_collection.count_documents({
            "status": "failed"
        })
        
        return {
            "success": True,
            "data": {
                "is_running": True,
                "pending_responses": pending_responses,
                "pending_gigs": pending_gigs,
                "failed_gigs": failed_gigs,
                "last_checked": datetime.now(timezone.utc)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
