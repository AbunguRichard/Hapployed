"""
Supabase Database Client
Replaces MongoDB connection with Supabase PostgreSQL
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
from typing import Optional

# Load environment variables explicitly
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase configuration
SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY: str = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY", "")

print(f"🔍 Supabase URL loaded: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "❌ SUPABASE_URL not found")
print(f"🔍 Supabase ANON KEY loaded: {SUPABASE_ANON_KEY[:20]}..." if SUPABASE_ANON_KEY else "❌ SUPABASE_ANON_KEY not found")
print(f"🔍 Supabase SERVICE KEY loaded: {SUPABASE_SERVICE_KEY[:20]}..." if SUPABASE_SERVICE_KEY else "❌ SUPABASE_SERVICE_KEY not found")

# Initialize Supabase clients
supabase: Optional[Client] = None
supabase_admin: Optional[Client] = None

def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance (uses anon key for user operations)
    """
    global supabase
    
    if supabase is None:
        if not SUPABASE_URL or not SUPABASE_ANON_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
            )
        
        supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        print("✅ Supabase client (anon) initialized successfully")
    
    return supabase

def get_supabase_admin() -> Client:
    """
    Get or create Supabase admin client instance (uses service role key - bypasses RLS)
    Use this for operations that need to bypass Row Level Security like user registration
    """
    global supabase_admin
    
    if supabase_admin is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables"
            )
        
        supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Supabase admin client (service role) initialized successfully")
    
    return supabase_admin

# Create client instances on module import
try:
    supabase = get_supabase_client()
    supabase_admin = get_supabase_admin()
except Exception as e:
    print(f"⚠️ Warning: Could not initialize Supabase clients: {e}")
    supabase = None
    supabase_admin = None
