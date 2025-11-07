from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

# Import Supabase client
from supabase_client import supabase, get_supabase_client

# SUPABASE MIGRATION: Using Supabase version for sos_voice_routes
from sos_voice_routes_supabase import router as sos_router
from settings_routes import router as settings_router
# SUPABASE MIGRATION: Using Supabase version for jobs_routes
from jobs_routes_supabase import router as jobs_router
from worker_features_routes import router as worker_features_router
# SUPABASE MIGRATION: Using Supabase version for ai_matching_routes
from ai_matching_routes_supabase import router as ai_matching_router
# SUPABASE MIGRATION: Using Supabase version for voice_ai_routes
from voice_ai_routes_supabase import router as voice_ai_router
# SUPABASE MIGRATION: Using Supabase version for badge_routes
from badge_routes_supabase import router as badge_router
# SUPABASE MIGRATION: Using Supabase version for profile_routes
from profile_routes_supabase import router as profile_router
from job_posting_routes import router as job_posting_router
# SUPABASE MIGRATION: Using Supabase version for worker_profile_routes
from worker_profile_routes_supabase import router as worker_profile_router
# SUPABASE MIGRATION: Using Supabase version for messaging_routes
from messaging_routes_supabase import router as messaging_router
# SUPABASE MIGRATION: Using Supabase version for application_routes
from application_routes_supabase import router as application_router
from quickhire_routes import router as quickhire_router
# SUPABASE MIGRATION: Using Supabase version for auth_routes
from auth_routes_supabase import router as auth_router
# SUPABASE MIGRATION: Using Supabase version for analytics_routes
from analytics_routes_supabase import router as analytics_router
# SUPABASE MIGRATION: Using Supabase version for worker_dashboard_routes
from worker_dashboard_routes_supabase import router as worker_dashboard_router
# SUPABASE MIGRATION: Using Supabase version for wallet_routes
from wallet_routes_supabase import router as wallet_router
# SUPABASE MIGRATION: Using Supabase version for ai_match_routes
from ai_match_routes_supabase import router as ai_match_router
from grow_routes import router as grow_router
# SUPABASE MIGRATION: Using Supabase version for search_routes
from search_routes_supabase import router as search_router
# SUPABASE MIGRATION: Using Supabase version for verification_routes
from verification_routes_supabase import router as verification_router
# SUPABASE MIGRATION: Using Supabase version for sms_routes
from sms_routes_supabase import router as sms_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection (LEGACY - will be deprecated)
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Supabase connection (NEW)
try:
    supabase_client = get_supabase_client()
    print("✅ Supabase database connected successfully")
except Exception as e:
    print(f"⚠️ Warning: Supabase connection failed: {e}")
    supabase_client = None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include all routers under /api prefix
api_router.include_router(auth_router)
api_router.include_router(sos_router)
api_router.include_router(settings_router)
api_router.include_router(jobs_router)
api_router.include_router(worker_features_router)
api_router.include_router(ai_matching_router)
api_router.include_router(voice_ai_router)
api_router.include_router(badge_router)
api_router.include_router(profile_router)
api_router.include_router(job_posting_router)
api_router.include_router(worker_profile_router)
api_router.include_router(messaging_router)
api_router.include_router(application_router)
api_router.include_router(quickhire_router)
api_router.include_router(analytics_router)
api_router.include_router(worker_dashboard_router)
api_router.include_router(wallet_router)
api_router.include_router(ai_match_router)
api_router.include_router(grow_router)
api_router.include_router(search_router)
api_router.include_router(verification_router)
api_router.include_router(sms_router)

# Include the main API router in the app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
