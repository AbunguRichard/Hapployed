#!/usr/bin/env python3
"""
Debug specific failing endpoints
"""

import requests
import json
import uuid
from datetime import datetime, timedelta

BASE_URL = "https://ai-recruiter-25.preview.emergentagent.com/api"
TEST_USER_ID = "worker-john-smith-123"
TEST_GIG_ID = "plumbing-emergency-456"
TEST_COMPANY_ID = "acme-corp-789"

def test_corporate_pass_create():
    """Debug Corporate Pass Create"""
    print("🔍 Debugging Corporate Pass Create...")
    
    pass_id = str(uuid.uuid4())
    
    # Test with all required fields including renewal_date
    payload = {
        "pass_id": pass_id,
        "company_id": TEST_COMPANY_ID,
        "plan_type": "plumbing_pass",
        "credits_per_month": 10,
        "credits_remaining": 10,
        "priority_access": True,
        "active": True,
        "renewal_date": (datetime.now() + timedelta(days=30)).isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/worker/corporate-pass/create", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        else:
            print(f"Success: {response.json()}")
            return pass_id
    except Exception as e:
        print(f"Exception: {e}")
    
    return None

def test_gig_insurance_activate():
    """Debug Gig Insurance Activate"""
    print("\n🔍 Debugging Gig Insurance Activate...")
    
    # Test with all required fields including expires_at
    payload = {
        "gig_id": TEST_GIG_ID,
        "user_id": TEST_USER_ID,
        "coverage_type": "quality_guarantee",
        "status": "active",
        "claim_window_hours": 24,
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    }
    
    try:
        response = requests.post(f"{BASE_URL}/worker/insurance/activate", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        else:
            print(f"Success: {response.json()}")
    except Exception as e:
        print(f"Exception: {e}")

def test_ai_suggest_gigs_debug():
    """Debug AI Suggest Gigs with simpler approach"""
    print("\n🔍 Debugging AI Suggest Gigs...")
    
    # Try with JSON body instead of query params
    payload = {
        "worker_id": TEST_USER_ID,
        "worker_profile": {
            "skills": ["Plumbing"],
            "experience": "5 years"
        },
        "available_gigs": [
            {
                "gig_id": "gig-001",
                "title": "Kitchen Sink Installation"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/ai-matching/suggest-gigs", json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        else:
            print(f"Success: {response.json()}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    pass_id = test_corporate_pass_create()
    test_gig_insurance_activate()
    test_ai_suggest_gigs_debug()
    
    if pass_id:
        print(f"\n🔍 Testing Corporate Pass Use with pass_id: {pass_id}")
        try:
            response = requests.post(f"{BASE_URL}/worker/corporate-pass/use?pass_id={pass_id}")
            print(f"Status: {response.status_code}")
            if response.status_code != 200:
                print(f"Error: {response.text}")
            else:
                print(f"Success: {response.json()}")
        except Exception as e:
            print(f"Exception: {e}")