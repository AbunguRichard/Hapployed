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
SUPABASE_KEY: str = os.environ.get("SUPABASE_ANON_KEY", "")

print(f"🔍 Supabase URL loaded: {SUPABASE_URL[:30]}..." if SUPABASE_URL else "❌ SUPABASE_URL not found")
print(f"🔍 Supabase KEY loaded: {SUPABASE_KEY[:20]}..." if SUPABASE_KEY else "❌ SUPABASE_ANON_KEY not found")

# Initialize Supabase client
supabase: Optional[Client] = None

def get_supabase_client() -> Client:
    """
    Get or create Supabase client instance
    """
    global supabase
    
    if supabase is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables"
            )
        
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Supabase client initialized successfully")
    
    return supabase

# Create client instance on module import
try:
    supabase = get_supabase_client()
except Exception as e:
    print(f"⚠️ Warning: Could not initialize Supabase client: {e}")
    supabase = None
