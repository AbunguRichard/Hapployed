#!/usr/bin/env python3
"""
Debug AI Suggest Gigs endpoint specifically
"""

import requests
import json
import urllib.parse

BASE_URL = "https://jobmate-3.preview.emergentagent.com/api"
TEST_USER_ID = "worker-john-smith-123"

def test_ai_suggest_gigs_proper():
    """Test AI Suggest Gigs with proper query parameter format"""
    print("🔍 Testing AI Suggest Gigs with proper format...")
    
    worker_profile = {
        "skills": ["Plumbing"],
        "experience": "5 years"
    }
    
    available_gigs = [
        {
            "gig_id": "gig-001",
            "title": "Kitchen Sink Installation"
        }
    ]
    
    # The endpoint expects query parameters, but dict and list need special handling
    # Let's try different approaches
    
    print("Approach 1: JSON-encoded query parameters")
    try:
        params = {
            'worker_id': TEST_USER_ID,
            'worker_profile': json.dumps(worker_profile),
            'available_gigs': json.dumps(available_gigs)
        }
        
        response = requests.post(f"{BASE_URL}/ai-matching/suggest-gigs", params=params)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        else:
            print(f"Success: {response.json()}")
            return True
    except Exception as e:
        print(f"Exception: {e}")
    
    print("\nApproach 2: URL-encoded query parameters")
    try:
        worker_profile_encoded = urllib.parse.quote(json.dumps(worker_profile))
        available_gigs_encoded = urllib.parse.quote(json.dumps(available_gigs))
        
        url = f"{BASE_URL}/ai-matching/suggest-gigs?worker_id={TEST_USER_ID}&worker_profile={worker_profile_encoded}&available_gigs={available_gigs_encoded}"
        
        response = requests.post(url)
        print(f"Status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        else:
            print(f"Success: {response.json()}")
            return True
    except Exception as e:
        print(f"Exception: {e}")
    
    return False

if __name__ == "__main__":
    test_ai_suggest_gigs_proper()