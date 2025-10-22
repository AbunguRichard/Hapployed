#!/usr/bin/env python3
"""
Test only the AI Voice Parsing endpoint
"""

import requests
import json

# Configuration
BASE_URL = "https://jobmate-3.preview.emergentagent.com/api"

def test_voice_parsing():
    """Test AI Voice Parsing endpoint"""
    print("🎤 Testing AI Voice Parsing...")
    
    # Test 1: Professional project transcript
    print("\n1. Testing Professional Project...")
    try:
        payload = {
            "transcript": "I need a website developer to build a modern e-commerce website for my clothing store. I need it done in 3 weeks and my budget is around $1500.",
            "workType": "project"
        }
        
        response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Check specific fields
            print(f"Category: {data.get('category')}")
            print(f"Duration: {data.get('duration')}")
            print(f"Budget: ${data.get('minBudget')} - ${data.get('maxBudget')}")
            print(f"Skills: {data.get('skills')}")
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 2: Local gig transcript
    print("\n2. Testing Local Gig...")
    try:
        payload = {
            "transcript": "I need a plumber today at 5 PM to fix a leak in my kitchen sink. It's urgent.",
            "workType": "gig"
        }
        
        response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Check specific fields
            print(f"Category: {data.get('category')}")
            print(f"Urgency: {data.get('urgency')}")
            print(f"Location: {data.get('location')}")
            print(f"Specific Location: {data.get('specificLocation')}")
            print(f"Type: {data.get('type')}")
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 3: Empty transcript
    print("\n3. Testing Empty Transcript...")
    try:
        payload = {
            "transcript": "",
            "workType": "project"
        }
        
        response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
    
    # Test 4: Missing workType
    print("\n4. Testing Missing WorkType...")
    try:
        payload = {
            "transcript": "I need help with something"
        }
        
        response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")

if __name__ == "__main__":
    test_voice_parsing()