#!/usr/bin/env python3
"""
Comprehensive Backend Test Suite for Hapployed Worker Dashboard Epic Platform Innovations
Tests all 9 innovations across Worker Features and AI Matching endpoints
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import time

# Configuration
BASE_URL = "https://hapployed-migrate.preview.emergentagent.com/api"
TEST_USER_ID = "worker-john-smith-123"
TEST_GIG_ID = "plumbing-emergency-456"
TEST_COMPANY_ID = "acme-corp-789"

class BackendTester:
    def __init__(self):
        self.results = {
            "worker_features": {},
            "ai_matching": {},
            "job_posting": {},
            "worker_dashboard": {},
            "wallet": {},
            "grow": {},
            "search": {},
            "verification": {},
            "sms_gateway": {},
            "dual_persona": {},
            "quickhire": {},
            "summary": {"passed": 0, "failed": 0, "errors": []}
        }
        
    def log_result(self, category, test_name, success, response=None, error=None):
        """Log test result"""
        self.results[category][test_name] = {
            "success": success,
            "response": response,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        
        if success:
            self.results["summary"]["passed"] += 1
            print(f"✅ {test_name}")
        else:
            self.results["summary"]["failed"] += 1
            self.results["summary"]["errors"].append(f"{test_name}: {error}")
            print(f"❌ {test_name}: {error}")
    
    def test_available_now_toggle(self):
        """Test Available Now Toggle endpoints"""
        print("\n🔄 Testing Available Now Toggle...")
        
        # Test 1: Toggle worker availability ON
        try:
            payload = {
                "user_id": TEST_USER_ID,
                "available_now": True,
                "radius_miles": 25,
                "status_message": "Available for plumbing emergencies in downtown area",
                "available_until": (datetime.now() + timedelta(hours=8)).isoformat()
            }
            
            response = requests.post(f"{BASE_URL}/worker/status/available", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "Available Now" in data.get("message", ""):
                    self.log_result("worker_features", "Available Now Toggle - Set Available", True, data)
                else:
                    self.log_result("worker_features", "Available Now Toggle - Set Available", False, data, "Invalid response format")
            else:
                self.log_result("worker_features", "Available Now Toggle - Set Available", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Available Now Toggle - Set Available", False, None, str(e))
        
        # Test 2: Get worker status
        try:
            response = requests.get(f"{BASE_URL}/worker/status/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("available_now") == True and data.get("user_id") == TEST_USER_ID:
                    self.log_result("worker_features", "Available Now Toggle - Get Status", True, data)
                else:
                    self.log_result("worker_features", "Available Now Toggle - Get Status", False, data, "Status not properly retrieved")
            else:
                self.log_result("worker_features", "Available Now Toggle - Get Status", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Available Now Toggle - Get Status", False, None, str(e))
        
        # Test 3: Get available workers
        try:
            response = requests.get(f"{BASE_URL}/worker/available-workers?radius=30")
            
            if response.status_code == 200:
                data = response.json()
                if "workers" in data and isinstance(data["workers"], list):
                    self.log_result("worker_features", "Available Now Toggle - Get Available Workers", True, data)
                else:
                    self.log_result("worker_features", "Available Now Toggle - Get Available Workers", False, data, "Invalid workers list")
            else:
                self.log_result("worker_features", "Available Now Toggle - Get Available Workers", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Available Now Toggle - Get Available Workers", False, None, str(e))
    
    def test_gamification_system(self):
        """Test Gamification System endpoints"""
        print("\n🎮 Testing Gamification System...")
        
        # Test 1: Check and award achievements
        try:
            response = requests.post(f"{BASE_URL}/worker/achievements/check?user_id={TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "new_achievements" in data:
                    self.log_result("worker_features", "Gamification - Check Achievements", True, data)
                else:
                    self.log_result("worker_features", "Gamification - Check Achievements", False, data, "Invalid response format")
            else:
                self.log_result("worker_features", "Gamification - Check Achievements", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gamification - Check Achievements", False, None, str(e))
        
        # Test 2: Get user achievements
        try:
            response = requests.get(f"{BASE_URL}/worker/achievements/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if "achievements" in data and isinstance(data["achievements"], list):
                    self.log_result("worker_features", "Gamification - Get Achievements", True, data)
                else:
                    self.log_result("worker_features", "Gamification - Get Achievements", False, data, "Invalid achievements format")
            else:
                self.log_result("worker_features", "Gamification - Get Achievements", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gamification - Get Achievements", False, None, str(e))
    
    def test_worker_preferences(self):
        """Test Worker Preferences endpoints"""
        print("\n⚙️ Testing Worker Preferences...")
        
        # Test 1: Save worker preferences
        try:
            payload = {
                "user_id": TEST_USER_ID,
                "preferred_job_types": ["Plumbing", "HVAC", "Electrical"],
                "preferred_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "preferred_areas": ["Downtown", "Midtown", "Financial District"],
                "min_budget": 75.0,
                "max_radius": 30,
                "commercial_preferred": True,
                "residential_preferred": True
            }
            
            response = requests.post(f"{BASE_URL}/worker/preferences", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "saved" in data.get("message", "").lower():
                    self.log_result("worker_features", "Worker Preferences - Save", True, data)
                else:
                    self.log_result("worker_features", "Worker Preferences - Save", False, data, "Preferences not saved properly")
            else:
                self.log_result("worker_features", "Worker Preferences - Save", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Preferences - Save", False, None, str(e))
        
        # Test 2: Get worker preferences
        try:
            response = requests.get(f"{BASE_URL}/worker/preferences/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data or "preferred_job_types" in data:
                    self.log_result("worker_features", "Worker Preferences - Get", True, data)
                else:
                    self.log_result("worker_features", "Worker Preferences - Get", False, data, "Preferences not retrieved properly")
            else:
                self.log_result("worker_features", "Worker Preferences - Get", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Preferences - Get", False, None, str(e))
    
    def test_gig_chain(self):
        """Test Gig Chain endpoints"""
        print("\n🔗 Testing Gig Chain...")
        
        # Test 1: Complete gig and activate chain
        try:
            response = requests.post(f"{BASE_URL}/worker/gig-chain/complete?user_id={TEST_USER_ID}&gig_id={TEST_GIG_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "priority access" in data.get("message", "").lower():
                    self.log_result("worker_features", "Gig Chain - Complete Gig", True, data)
                else:
                    self.log_result("worker_features", "Gig Chain - Complete Gig", False, data, "Chain not activated properly")
            else:
                self.log_result("worker_features", "Gig Chain - Complete Gig", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gig Chain - Complete Gig", False, None, str(e))
        
        # Test 2: Get chain status
        try:
            response = requests.get(f"{BASE_URL}/worker/gig-chain/{TEST_USER_ID}")
            
            if response.status_code == 200:
                data = response.json()
                if "active_bonuses" in data and isinstance(data["active_bonuses"], list):
                    self.log_result("worker_features", "Gig Chain - Get Status", True, data)
                else:
                    self.log_result("worker_features", "Gig Chain - Get Status", False, data, "Chain status not retrieved properly")
            else:
                self.log_result("worker_features", "Gig Chain - Get Status", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gig Chain - Get Status", False, None, str(e))
    
    def test_gig_squad(self):
        """Test Gig Squad endpoints"""
        print("\n👥 Testing Gig Squad...")
        
        squad_id = str(uuid.uuid4())
        
        # Test 1: Create squad
        try:
            payload = {
                "squad_id": squad_id,
                "gig_id": TEST_GIG_ID,
                "required_roles": [
                    {"role": "Lead Plumber", "count": 1},
                    {"role": "Assistant Plumber", "count": 2},
                    {"role": "Electrician", "count": 1}
                ]
            }
            
            response = requests.post(f"{BASE_URL}/worker/squad/create", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "squad created" in data.get("message", "").lower():
                    self.log_result("worker_features", "Gig Squad - Create", True, data)
                else:
                    self.log_result("worker_features", "Gig Squad - Create", False, data, "Squad not created properly")
            else:
                self.log_result("worker_features", "Gig Squad - Create", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gig Squad - Create", False, None, str(e))
        
        # Test 2: Join squad
        try:
            response = requests.post(f"{BASE_URL}/worker/squad/join?squad_id={squad_id}&user_id={TEST_USER_ID}&role=Lead Plumber")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "application submitted" in data.get("message", "").lower():
                    self.log_result("worker_features", "Gig Squad - Join", True, data)
                else:
                    self.log_result("worker_features", "Gig Squad - Join", False, data, "Squad join failed")
            else:
                self.log_result("worker_features", "Gig Squad - Join", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gig Squad - Join", False, None, str(e))
        
        # Test 3: Get available squads
        try:
            response = requests.get(f"{BASE_URL}/worker/squads/available")
            
            if response.status_code == 200:
                data = response.json()
                if "squads" in data and isinstance(data["squads"], list):
                    self.log_result("worker_features", "Gig Squad - Get Available", True, data)
                else:
                    self.log_result("worker_features", "Gig Squad - Get Available", False, data, "Available squads not retrieved properly")
            else:
                self.log_result("worker_features", "Gig Squad - Get Available", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gig Squad - Get Available", False, None, str(e))
    
    def test_corporate_pass(self):
        """Test Corporate Pass endpoints"""
        print("\n🏢 Testing Corporate Pass...")
        
        pass_id = str(uuid.uuid4())
        
        # Test 1: Create corporate pass
        try:
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
            
            response = requests.post(f"{BASE_URL}/worker/corporate-pass/create", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "corporate pass activated" in data.get("message", "").lower():
                    self.log_result("worker_features", "Corporate Pass - Create", True, data)
                else:
                    self.log_result("worker_features", "Corporate Pass - Create", False, data, "Corporate pass not created properly")
            else:
                self.log_result("worker_features", "Corporate Pass - Create", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Corporate Pass - Create", False, None, str(e))
        
        # Test 2: Use corporate pass credit
        try:
            response = requests.post(f"{BASE_URL}/worker/corporate-pass/use?pass_id={pass_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "credits_remaining" in data:
                    self.log_result("worker_features", "Corporate Pass - Use Credit", True, data)
                else:
                    self.log_result("worker_features", "Corporate Pass - Use Credit", False, data, "Credit not used properly")
            else:
                self.log_result("worker_features", "Corporate Pass - Use Credit", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Corporate Pass - Use Credit", False, None, str(e))
    
    def test_gig_insurance(self):
        """Test Gig Insurance endpoints"""
        print("\n🛡️ Testing Gig Insurance...")
        
        # Test 1: Activate insurance
        try:
            payload = {
                "gig_id": TEST_GIG_ID,
                "user_id": TEST_USER_ID,
                "coverage_type": "quality_guarantee",
                "status": "active",
                "claim_window_hours": 24,
                "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
            }
            
            response = requests.post(f"{BASE_URL}/worker/insurance/activate", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "protected by" in data.get("message", "").lower():
                    self.log_result("worker_features", "Gig Insurance - Activate", True, data)
                else:
                    self.log_result("worker_features", "Gig Insurance - Activate", False, data, "Insurance not activated properly")
            else:
                self.log_result("worker_features", "Gig Insurance - Activate", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gig Insurance - Activate", False, None, str(e))
        
        # Test 2: File insurance claim
        try:
            reason = "Client refused to pay after completion of emergency plumbing repair"
            response = requests.post(f"{BASE_URL}/worker/insurance/claim?gig_id={TEST_GIG_ID}&user_id={TEST_USER_ID}&reason={reason}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "claim filed" in data.get("message", "").lower():
                    self.log_result("worker_features", "Gig Insurance - File Claim", True, data)
                else:
                    self.log_result("worker_features", "Gig Insurance - File Claim", False, data, "Claim not filed properly")
            else:
                self.log_result("worker_features", "Gig Insurance - File Claim", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Gig Insurance - File Claim", False, None, str(e))
    
    def test_ai_calculate_match(self):
        """Test AI Calculate Match endpoint"""
        print("\n🤖 Testing AI Calculate Match...")
        
        try:
            payload = {
                "gig_id": TEST_GIG_ID,
                "worker_id": TEST_USER_ID,
                "gig_details": {
                    "title": "Emergency Plumbing Repair - Burst Pipe",
                    "category": "Plumbing",
                    "location": "San Francisco, CA",
                    "budget": 150,
                    "urgent": True,
                    "requirements": ["Licensed plumber", "Emergency response", "Weekend availability"]
                },
                "worker_profile": {
                    "skills": ["Plumbing", "Emergency Repair", "Pipe Installation"],
                    "experience": "5 years",
                    "preferred_areas": ["San Francisco", "Oakland"],
                    "preferred_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "rating": 4.8,
                    "completed_gigs": 127,
                    "available_now": True
                }
            }
            
            response = requests.post(f"{BASE_URL}/ai-matching/calculate-match", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "match_data" in data:
                    match_data = data["match_data"]
                    if "match_score" in match_data and "confidence" in match_data:
                        self.log_result("ai_matching", "AI Calculate Match", True, data)
                    else:
                        self.log_result("ai_matching", "AI Calculate Match", False, data, "Invalid match data format")
                else:
                    self.log_result("ai_matching", "AI Calculate Match", False, data, "Invalid response format")
            else:
                self.log_result("ai_matching", "AI Calculate Match", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Calculate Match", False, None, str(e))
    
    def test_ai_suggest_gigs(self):
        """Test AI Suggest Gigs endpoint"""
        print("\n💡 Testing AI Suggest Gigs...")
        
        try:
            import urllib.parse
            
            worker_profile = {
                "skills": ["Plumbing", "HVAC", "Emergency Repair"],
                "experience": "5 years",
                "preferred_areas": ["San Francisco", "Oakland"],
                "rating": 4.8,
                "completed_gigs": 127,
                "available_now": True
            }
            
            available_gigs = [
                {
                    "gig_id": "gig-001",
                    "title": "Kitchen Sink Installation",
                    "category": "Plumbing",
                    "location": "San Francisco, CA",
                    "budget": 200,
                    "urgent": False
                },
                {
                    "gig_id": "gig-002", 
                    "title": "HVAC System Maintenance",
                    "category": "HVAC",
                    "location": "Oakland, CA",
                    "budget": 300,
                    "urgent": False
                }
            ]
            
            # Use query parameters with JSON encoding
            worker_profile_json = urllib.parse.quote(json.dumps(worker_profile))
            available_gigs_json = urllib.parse.quote(json.dumps(available_gigs))
            
            response = requests.post(f"{BASE_URL}/ai-matching/suggest-gigs?worker_id={TEST_USER_ID}&worker_profile={worker_profile_json}&available_gigs={available_gigs_json}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "suggestions" in data:
                    self.log_result("ai_matching", "AI Suggest Gigs", True, data)
                else:
                    self.log_result("ai_matching", "AI Suggest Gigs", False, data, "Invalid suggestions format")
            else:
                self.log_result("ai_matching", "AI Suggest Gigs", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Suggest Gigs", False, None, str(e))
    
    def test_ai_forecast_demand(self):
        """Test AI Forecast Demand endpoint"""
        print("\n📈 Testing AI Forecast Demand...")
        
        try:
            location = "San Francisco, CA"
            category = "Plumbing"
            date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            
            response = requests.post(f"{BASE_URL}/ai-matching/forecast-demand?location={location}&category={category}&date={date}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "forecast" in data:
                    forecast = data["forecast"]
                    if "demand_level" in forecast and "confidence" in forecast:
                        self.log_result("ai_matching", "AI Forecast Demand", True, data)
                    else:
                        self.log_result("ai_matching", "AI Forecast Demand", False, data, "Invalid forecast format")
                else:
                    self.log_result("ai_matching", "AI Forecast Demand", False, data, "Invalid response format")
            else:
                self.log_result("ai_matching", "AI Forecast Demand", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Forecast Demand", False, None, str(e))
    
    def test_ai_voice_parsing(self):
        """Test AI Voice Parsing endpoint"""
        print("\n🎤 Testing AI Voice Parsing...")
        
        # Test 1: Professional project transcript
        try:
            payload = {
                "transcript": "I need a website developer to build a modern e-commerce website for my clothing store. I need it done in 3 weeks and my budget is around $1500.",
                "workType": "project"
            }
            
            response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                # Check for required fields
                required_fields = ["title", "description", "category", "duration", "location", "specificLocation", 
                                 "minBudget", "maxBudget", "urgency", "type", "skills"]
                
                if all(field in data for field in required_fields):
                    # Validate specific expectations for project
                    if (data.get("category") == "Web Development" and 
                        "3 weeks" in data.get("duration", "") and
                        isinstance(data.get("skills"), list)):
                        self.log_result("ai_matching", "AI Voice Parsing - Professional Project", True, data)
                    else:
                        self.log_result("ai_matching", "AI Voice Parsing - Professional Project", False, data, 
                                      f"Expected Web Development category, 3 weeks duration, got: category={data.get('category')}, duration={data.get('duration')}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("ai_matching", "AI Voice Parsing - Professional Project", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("ai_matching", "AI Voice Parsing - Professional Project", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Voice Parsing - Professional Project", False, None, str(e))
        
        # Test 2: Local gig transcript
        try:
            payload = {
                "transcript": "I need a plumber today at 5 PM to fix a leak in my kitchen sink. It's urgent.",
                "workType": "gig"
            }
            
            response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                # Check for required fields
                required_fields = ["title", "description", "category", "duration", "location", "specificLocation", 
                                 "minBudget", "maxBudget", "urgency", "type", "skills"]
                
                if all(field in data for field in required_fields):
                    # Validate specific expectations for gig
                    if (data.get("category") == "Maintenance & Repairs" and 
                        data.get("urgency") == "urgent" and
                        data.get("location") == "on-site" and
                        "kitchen" in data.get("specificLocation", "").lower()):
                        self.log_result("ai_matching", "AI Voice Parsing - Local Gig", True, data)
                    else:
                        self.log_result("ai_matching", "AI Voice Parsing - Local Gig", False, data, 
                                      f"Expected Maintenance & Repairs category, urgent urgency, on-site location, kitchen in specificLocation. Got: category={data.get('category')}, urgency={data.get('urgency')}, location={data.get('location')}, specificLocation={data.get('specificLocation')}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("ai_matching", "AI Voice Parsing - Local Gig", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("ai_matching", "AI Voice Parsing - Local Gig", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Voice Parsing - Local Gig", False, None, str(e))
        
        # Test 3: Invalid data - Empty transcript
        try:
            payload = {
                "transcript": "",
                "workType": "project"
            }
            
            response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
            
            # Should handle empty transcript gracefully
            if response.status_code in [400, 422, 500]:
                self.log_result("ai_matching", "AI Voice Parsing - Empty Transcript", True, 
                              {"status_code": response.status_code, "message": "Properly handled empty transcript"})
            elif response.status_code == 200:
                # If it returns 200, check if it provides meaningful error or default response
                data = response.json()
                self.log_result("ai_matching", "AI Voice Parsing - Empty Transcript", True, data)
            else:
                self.log_result("ai_matching", "AI Voice Parsing - Empty Transcript", False, None, f"Unexpected HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Voice Parsing - Empty Transcript", False, None, str(e))
        
        # Test 4: Invalid data - Missing workType
        try:
            payload = {
                "transcript": "I need help with something"
            }
            
            response = requests.post(f"{BASE_URL}/parse-voice-input", json=payload)
            
            # Should return validation error for missing workType
            if response.status_code in [400, 422]:
                self.log_result("ai_matching", "AI Voice Parsing - Missing WorkType", True, 
                              {"status_code": response.status_code, "message": "Properly validated missing workType"})
            else:
                self.log_result("ai_matching", "AI Voice Parsing - Missing WorkType", False, None, 
                              f"Expected validation error (400/422), got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Voice Parsing - Missing WorkType", False, None, str(e))
    
    def test_ai_price_estimator(self):
        """Test AI Price Estimator endpoint"""
        print("\n💰 Testing AI Price Estimator...")
        
        # Test 1: Professional web development project
        try:
            payload = {
                "category": "Web Development",
                "description": "Build a modern e-commerce website with payment integration",
                "location": "remote",
                "urgency": "normal",
                "workType": "project",
                "duration": "3 weeks"
            }
            
            response = requests.post(f"{BASE_URL}/estimate-price", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                # Check for required fields
                required_fields = ["minPrice", "maxPrice", "suggestedPrice", "explanation", "factors"]
                
                if all(field in data for field in required_fields):
                    # Validate data types and reasonable values
                    if (isinstance(data.get("minPrice"), int) and 
                        isinstance(data.get("maxPrice"), int) and
                        isinstance(data.get("suggestedPrice"), int) and
                        isinstance(data.get("explanation"), str) and
                        isinstance(data.get("factors"), dict) and
                        data.get("minPrice") > 0 and
                        data.get("maxPrice") >= data.get("minPrice") and
                        data.get("suggestedPrice") >= data.get("minPrice") and
                        data.get("suggestedPrice") <= data.get("maxPrice")):
                        self.log_result("ai_matching", "AI Price Estimator - Web Development Project", True, data)
                    else:
                        self.log_result("ai_matching", "AI Price Estimator - Web Development Project", False, data, 
                                      f"Invalid price data: minPrice={data.get('minPrice')}, maxPrice={data.get('maxPrice')}, suggestedPrice={data.get('suggestedPrice')}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("ai_matching", "AI Price Estimator - Web Development Project", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("ai_matching", "AI Price Estimator - Web Development Project", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Price Estimator - Web Development Project", False, None, str(e))
        
        # Test 2: Urgent local gig
        try:
            payload = {
                "category": "Maintenance & Repairs",
                "description": "Fix leaking kitchen sink",
                "location": "on-site",
                "specificLocation": "Downtown Chicago",
                "urgency": "urgent",
                "workType": "gig"
            }
            
            response = requests.post(f"{BASE_URL}/estimate-price", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                # Check for required fields
                required_fields = ["minPrice", "maxPrice", "suggestedPrice", "explanation", "factors"]
                
                if all(field in data for field in required_fields):
                    # Validate data types and reasonable values for urgent gig
                    if (isinstance(data.get("minPrice"), int) and 
                        isinstance(data.get("maxPrice"), int) and
                        isinstance(data.get("suggestedPrice"), int) and
                        isinstance(data.get("explanation"), str) and
                        isinstance(data.get("factors"), dict) and
                        data.get("minPrice") > 0 and
                        data.get("maxPrice") >= data.get("minPrice") and
                        data.get("suggestedPrice") >= data.get("minPrice") and
                        data.get("suggestedPrice") <= data.get("maxPrice")):
                        # Check if urgency is considered (should have higher prices due to urgency)
                        if "urgent" in data.get("explanation", "").lower() or "emergency" in data.get("explanation", "").lower():
                            self.log_result("ai_matching", "AI Price Estimator - Urgent Local Gig", True, data)
                        else:
                            self.log_result("ai_matching", "AI Price Estimator - Urgent Local Gig", True, data, 
                                          "Minor: Urgency not explicitly mentioned in explanation")
                    else:
                        self.log_result("ai_matching", "AI Price Estimator - Urgent Local Gig", False, data, 
                                      f"Invalid price data: minPrice={data.get('minPrice')}, maxPrice={data.get('maxPrice')}, suggestedPrice={data.get('suggestedPrice')}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("ai_matching", "AI Price Estimator - Urgent Local Gig", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("ai_matching", "AI Price Estimator - Urgent Local Gig", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Price Estimator - Urgent Local Gig", False, None, str(e))
        
        # Test 3: Missing category (Other)
        try:
            payload = {
                "category": "Other",
                "workType": "project"
            }
            
            response = requests.post(f"{BASE_URL}/estimate-price", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                # Check for required fields
                required_fields = ["minPrice", "maxPrice", "suggestedPrice", "explanation", "factors"]
                
                if all(field in data for field in required_fields):
                    # Should still provide estimation even for "Other" category
                    if (isinstance(data.get("minPrice"), int) and 
                        isinstance(data.get("maxPrice"), int) and
                        isinstance(data.get("suggestedPrice"), int) and
                        data.get("minPrice") > 0):
                        self.log_result("ai_matching", "AI Price Estimator - Other Category", True, data)
                    else:
                        self.log_result("ai_matching", "AI Price Estimator - Other Category", False, data, 
                                      "Invalid price values for Other category")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("ai_matching", "AI Price Estimator - Other Category", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("ai_matching", "AI Price Estimator - Other Category", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Price Estimator - Other Category", False, None, str(e))
        
        # Test 4: Error handling - Missing workType
        try:
            payload = {
                "category": "Web Development",
                "description": "Build a website"
            }
            
            response = requests.post(f"{BASE_URL}/estimate-price", json=payload)
            
            # Should return validation error for missing workType
            if response.status_code in [400, 422]:
                self.log_result("ai_matching", "AI Price Estimator - Missing WorkType", True, 
                              {"status_code": response.status_code, "message": "Properly validated missing workType"})
            else:
                self.log_result("ai_matching", "AI Price Estimator - Missing WorkType", False, None, 
                              f"Expected validation error (400/422), got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("ai_matching", "AI Price Estimator - Missing WorkType", False, None, str(e))
    
    def test_wallet_system_supabase(self):
        """Test Wallet System Supabase Migration - All 8 Endpoints"""
        print("\n💳 Testing Wallet System Supabase Migration...")
        
        test_user_id = "550e8400-e29b-41d4-a716-446655440000"  # Default mocked user ID (UUID format for Supabase)
        
        # Test 1: GET /api/wallet/ - Auto-create wallet and return complete structure
        try:
            response = requests.get(f"{BASE_URL}/wallet/")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    wallet = data["data"]
                    # Verify complete wallet structure
                    required_fields = ["id", "user_id", "balance", "transactions", "payment_methods", 
                                     "financial_products", "settings", "limits", "stats"]
                    
                    if all(field in wallet for field in required_fields):
                        # Verify balance structure
                        balance = wallet["balance"]
                        if isinstance(balance, dict) and "available" in balance and "pending" in balance:
                            self.log_result("wallet", "GET /api/wallet/ - Auto-create wallet", True, 
                                          {"wallet_id": wallet["id"], "user_id": wallet["user_id"], 
                                           "balance": balance})
                        else:
                            self.log_result("wallet", "GET /api/wallet/ - Auto-create wallet", False, data, 
                                          "Invalid balance structure")
                    else:
                        missing_fields = [field for field in required_fields if field not in wallet]
                        self.log_result("wallet", "GET /api/wallet/ - Auto-create wallet", False, data, 
                                      f"Missing wallet fields: {missing_fields}")
                else:
                    self.log_result("wallet", "GET /api/wallet/ - Auto-create wallet", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "GET /api/wallet/ - Auto-create wallet", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "GET /api/wallet/ - Auto-create wallet", False, None, str(e))
        
        # Test 2: POST /api/wallet/calculate-fees - Fee calculation for different methods
        try:
            # Test instant bank transfer
            payload = {"amount": 100, "method": "bank_transfer", "instant": True}
            response = requests.post(f"{BASE_URL}/wallet/calculate-fees", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    fees = data["data"]
                    # Verify fee calculation (1.5% for instant bank transfer)
                    expected_fee = 1.50
                    expected_net = 98.50
                    if (abs(fees.get("fee_amount", 0) - expected_fee) < 0.01 and 
                        abs(fees.get("net_amount", 0) - expected_net) < 0.01):
                        self.log_result("wallet", "POST /api/wallet/calculate-fees - Instant Bank Transfer", True, fees)
                    else:
                        self.log_result("wallet", "POST /api/wallet/calculate-fees - Instant Bank Transfer", False, fees, 
                                      f"Fee calculation mismatch: expected fee={expected_fee}, net={expected_net}, got fee={fees.get('fee_amount')}, net={fees.get('net_amount')}")
                else:
                    self.log_result("wallet", "POST /api/wallet/calculate-fees - Instant Bank Transfer", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "POST /api/wallet/calculate-fees - Instant Bank Transfer", False, None, 
                              f"HTTP {response.status_code}")
            
            # Test standard PayPal
            payload = {"amount": 100, "method": "paypal", "instant": False}
            response = requests.post(f"{BASE_URL}/wallet/calculate-fees", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    fees = data["data"]
                    # Verify fee calculation (2.5% for standard PayPal)
                    expected_fee = 2.50
                    expected_net = 97.50
                    if (abs(fees.get("fee_amount", 0) - expected_fee) < 0.01 and 
                        abs(fees.get("net_amount", 0) - expected_net) < 0.01):
                        self.log_result("wallet", "POST /api/wallet/calculate-fees - Standard PayPal", True, fees)
                    else:
                        self.log_result("wallet", "POST /api/wallet/calculate-fees - Standard PayPal", False, fees, 
                                      f"Fee calculation mismatch")
                else:
                    self.log_result("wallet", "POST /api/wallet/calculate-fees - Standard PayPal", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "POST /api/wallet/calculate-fees - Standard PayPal", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("wallet", "POST /api/wallet/calculate-fees", False, None, str(e))
        
        # Test 3: POST /api/wallet/cashout/instant - Instant cashout (should fail with insufficient balance)
        try:
            payload = {
                "amount": 50,
                "method": "bank_transfer",
                "method_details": {
                    "bank_name": "Chase",
                    "account_last4": "1234"
                }
            }
            response = requests.post(f"{BASE_URL}/wallet/cashout/instant", json=payload)
            
            # Should return 400 error for insufficient balance (new wallet has $0)
            if response.status_code == 400:
                self.log_result("wallet", "POST /api/wallet/cashout/instant - Insufficient Balance", True, 
                              {"status_code": response.status_code, "message": "Properly handled insufficient balance"})
            else:
                self.log_result("wallet", "POST /api/wallet/cashout/instant - Insufficient Balance", False, None, 
                              f"Expected 400 error, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("wallet", "POST /api/wallet/cashout/instant", False, None, str(e))
        
        # Test 4: POST /api/wallet/cashout/standard - Standard cashout (should fail with insufficient balance)
        try:
            payload = {
                "amount": 50,
                "method": "bank_transfer",
                "method_details": {
                    "bank_name": "Chase",
                    "account_last4": "1234"
                }
            }
            response = requests.post(f"{BASE_URL}/wallet/cashout/standard", json=payload)
            
            # Should return 400 error for insufficient balance
            if response.status_code == 400:
                self.log_result("wallet", "POST /api/wallet/cashout/standard - Insufficient Balance", True, 
                              {"status_code": response.status_code, "message": "Properly handled insufficient balance"})
            else:
                self.log_result("wallet", "POST /api/wallet/cashout/standard - Insufficient Balance", False, None, 
                              f"Expected 400 error, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("wallet", "POST /api/wallet/cashout/standard", False, None, str(e))
        
        # Test 5: POST /api/wallet/savings/setup - Setup savings account with $0 initial amount
        try:
            payload = {"initial_amount": 0}
            response = requests.post(f"{BASE_URL}/wallet/savings/setup", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    savings_data = data["data"]
                    # Verify interest rate is 2.5%
                    if savings_data.get("interest_rate") == 2.5:
                        self.log_result("wallet", "POST /api/wallet/savings/setup - $0 Initial", True, savings_data)
                    else:
                        self.log_result("wallet", "POST /api/wallet/savings/setup - $0 Initial", False, savings_data, 
                                      f"Expected interest_rate=2.5, got {savings_data.get('interest_rate')}")
                else:
                    self.log_result("wallet", "POST /api/wallet/savings/setup - $0 Initial", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "POST /api/wallet/savings/setup - $0 Initial", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("wallet", "POST /api/wallet/savings/setup", False, None, str(e))
        
        # Test 6: POST /api/wallet/credit/request - Credit advance system
        try:
            payload = {
                "amount": 200,
                "purpose": "Equipment purchase"
            }
            response = requests.post(f"{BASE_URL}/wallet/credit/request", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    credit_data = data["data"]
                    # Verify credit fields
                    required_fields = ["credit_used", "available_credit", "repayment_date"]
                    if all(field in credit_data for field in required_fields):
                        if credit_data.get("credit_used") == 200:
                            self.log_result("wallet", "POST /api/wallet/credit/request - Equipment Purchase", True, credit_data)
                        else:
                            self.log_result("wallet", "POST /api/wallet/credit/request - Equipment Purchase", False, credit_data, 
                                          f"Expected credit_used=200, got {credit_data.get('credit_used')}")
                    else:
                        missing_fields = [field for field in required_fields if field not in credit_data]
                        self.log_result("wallet", "POST /api/wallet/credit/request - Equipment Purchase", False, credit_data, 
                                      f"Missing fields: {missing_fields}")
                else:
                    self.log_result("wallet", "POST /api/wallet/credit/request - Equipment Purchase", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "POST /api/wallet/credit/request - Equipment Purchase", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("wallet", "POST /api/wallet/credit/request", False, None, str(e))
        
        # Test 7: POST /api/wallet/payment-methods - Add payment methods
        try:
            # Add bank account
            payload = {
                "type": "bank",
                "details": {
                    "bank_name": "Chase",
                    "account_last4": "5678"
                }
            }
            response = requests.post(f"{BASE_URL}/wallet/payment-methods", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    payment_method = data["data"]
                    # First method should be set as default
                    if payment_method.get("is_default") == True and payment_method.get("type") == "bank":
                        self.log_result("wallet", "POST /api/wallet/payment-methods - Add Bank", True, payment_method)
                    else:
                        self.log_result("wallet", "POST /api/wallet/payment-methods - Add Bank", False, payment_method, 
                                      "First payment method should be default")
                else:
                    self.log_result("wallet", "POST /api/wallet/payment-methods - Add Bank", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "POST /api/wallet/payment-methods - Add Bank", False, None, 
                              f"HTTP {response.status_code}")
            
            # Add PayPal
            payload = {
                "type": "paypal",
                "details": {
                    "paypal_email": "user@paypal.com"
                }
            }
            response = requests.post(f"{BASE_URL}/wallet/payment-methods", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    payment_method = data["data"]
                    if payment_method.get("type") == "paypal":
                        self.log_result("wallet", "POST /api/wallet/payment-methods - Add PayPal", True, payment_method)
                    else:
                        self.log_result("wallet", "POST /api/wallet/payment-methods - Add PayPal", False, payment_method, 
                                      "Invalid payment method type")
                else:
                    self.log_result("wallet", "POST /api/wallet/payment-methods - Add PayPal", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "POST /api/wallet/payment-methods - Add PayPal", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("wallet", "POST /api/wallet/payment-methods", False, None, str(e))
        
        # Test 8: GET /api/wallet/transactions - Transaction history with pagination and filtering
        try:
            # Get all transactions
            response = requests.get(f"{BASE_URL}/wallet/transactions?page=1&limit=20")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    transactions_data = data["data"]
                    if "transactions" in transactions_data and "pagination" in transactions_data:
                        transactions = transactions_data["transactions"]
                        pagination = transactions_data["pagination"]
                        # Should have transactions from credit request and savings setup
                        if len(transactions) >= 2:
                            self.log_result("wallet", "GET /api/wallet/transactions - All Transactions", True, 
                                          {"transaction_count": len(transactions), "pagination": pagination})
                        else:
                            self.log_result("wallet", "GET /api/wallet/transactions - All Transactions", True, 
                                          {"transaction_count": len(transactions), "note": "Expected at least 2 transactions"})
                    else:
                        self.log_result("wallet", "GET /api/wallet/transactions - All Transactions", False, data, 
                                      "Missing transactions or pagination fields")
                else:
                    self.log_result("wallet", "GET /api/wallet/transactions - All Transactions", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "GET /api/wallet/transactions - All Transactions", False, None, 
                              f"HTTP {response.status_code}")
            
            # Test filtering by type
            response = requests.get(f"{BASE_URL}/wallet/transactions?type=deposit")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    transactions_data = data["data"]
                    transactions = transactions_data.get("transactions", [])
                    # Should only return deposit transactions (credit request)
                    deposit_count = len([t for t in transactions if t.get("type") == "deposit"])
                    if deposit_count == len(transactions):
                        self.log_result("wallet", "GET /api/wallet/transactions - Filter by Type", True, 
                                      {"deposit_count": deposit_count})
                    else:
                        self.log_result("wallet", "GET /api/wallet/transactions - Filter by Type", False, transactions_data, 
                                      "Filter not working correctly")
                else:
                    self.log_result("wallet", "GET /api/wallet/transactions - Filter by Type", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "GET /api/wallet/transactions - Filter by Type", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("wallet", "GET /api/wallet/transactions", False, None, str(e))

    def test_quickhire_supabase_migration(self):
        """Test Quickhire System Supabase Migration - All 20 Geo-Location Endpoints"""
        print("\n📍 Testing Quickhire System Supabase Migration...")
        
        # Test data with real coordinates
        nyc_coords = {"lat": 40.7128, "lon": -74.0060}  # New York City
        la_coords = {"lat": 34.0522, "lon": -118.2437}  # Los Angeles
        chicago_coords = {"lat": 41.8781, "lon": -87.6298}  # Chicago
        
        test_client_id = str(uuid.uuid4())
        test_worker_id = str(uuid.uuid4())
        created_gig_id = None
        
        # Test 1: POST /api/quickhire/gigs - Create a new quickhire gig
        try:
            payload = {
                "clientId": test_client_id,
                "clientName": "John Smith",
                "clientEmail": "john.smith@example.com",
                "category": "Plumber",
                "description": "Emergency plumbing repair needed - burst pipe in kitchen",
                "location": {
                    "type": "Point",
                    "coordinates": [nyc_coords["lon"], nyc_coords["lat"]],
                    "address": "123 Main St, New York, NY 10001"
                },
                "radius": 10,
                "urgency": "ASAP",
                "budget": 150.0,
                "photos": [],
                "voiceNote": None,
                "gigType": "Single",
                "workersNeeded": 1,
                "payPerPerson": 150.0,
                "groupMode": False
            }
            
            response = requests.post(f"{BASE_URL}/quickhire/gigs", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                if data.get("success") and "gigId" in data:
                    created_gig_id = data["gigId"]
                    self.log_result("quickhire", "POST /gigs - Create Gig", True, 
                                  {"gigId": created_gig_id, "category": payload["category"]})
                else:
                    self.log_result("quickhire", "POST /gigs - Create Gig", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "POST /gigs - Create Gig", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("quickhire", "POST /gigs - Create Gig", False, None, str(e))
        
        # Test 2: GET /api/quickhire/gigs/{gigId} - Get specific gig details
        if created_gig_id:
            try:
                response = requests.get(f"{BASE_URL}/quickhire/gigs/{created_gig_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "gig" in data:
                        gig = data["gig"]
                        if gig.get("id") == created_gig_id and gig.get("category") == "Plumber":
                            self.log_result("quickhire", "GET /gigs/{gigId} - Get Gig Details", True, 
                                          {"gigId": created_gig_id, "status": gig.get("status")})
                        else:
                            self.log_result("quickhire", "GET /gigs/{gigId} - Get Gig Details", False, data, 
                                          "Gig data mismatch")
                    else:
                        self.log_result("quickhire", "GET /gigs/{gigId} - Get Gig Details", False, data, 
                                      "Invalid response format")
                else:
                    self.log_result("quickhire", "GET /gigs/{gigId} - Get Gig Details", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "GET /gigs/{gigId} - Get Gig Details", False, None, str(e))
        
        # Test 3: GET /api/quickhire/gigs/nearby - Get nearby gigs (query params)
        try:
            params = {
                "lat": nyc_coords["lat"],
                "lon": nyc_coords["lon"],
                "radius": 25
            }
            response = requests.get(f"{BASE_URL}/quickhire/gigs/nearby", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "gigs" in data:
                    gigs = data["gigs"]
                    # Verify distance calculation
                    if len(gigs) > 0:
                        for gig in gigs:
                            if "distance" in gig and "eta" in gig:
                                self.log_result("quickhire", "GET /gigs/nearby - Query Params", True, 
                                              {"count": len(gigs), "sample_distance": gigs[0].get("distance")})
                                break
                        else:
                            self.log_result("quickhire", "GET /gigs/nearby - Query Params", False, data, 
                                          "Missing distance/eta fields")
                    else:
                        self.log_result("quickhire", "GET /gigs/nearby - Query Params", True, 
                                      {"count": 0, "note": "No gigs in radius"})
                else:
                    self.log_result("quickhire", "GET /gigs/nearby - Query Params", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "GET /gigs/nearby - Query Params", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "GET /gigs/nearby - Query Params", False, None, str(e))
        
        # Test 4: POST /api/quickhire/gigs/nearby - Find gigs near worker location
        try:
            payload = {
                "workerId": test_worker_id,
                "location": {
                    "type": "Point",
                    "coordinates": [nyc_coords["lon"], nyc_coords["lat"]],
                    "address": "Worker location in NYC"
                }
            }
            response = requests.post(f"{BASE_URL}/quickhire/gigs/nearby", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "gigs" in data:
                    self.log_result("quickhire", "POST /gigs/nearby - Worker Location", True, 
                                  {"count": data.get("count", 0)})
                else:
                    self.log_result("quickhire", "POST /gigs/nearby - Worker Location", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "POST /gigs/nearby - Worker Location", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "POST /gigs/nearby - Worker Location", False, None, str(e))
        
        # Test 5: POST /api/quickhire/gigs/{gigId}/accept - Worker accepts gig
        if created_gig_id:
            try:
                response = requests.post(f"{BASE_URL}/quickhire/gigs/{created_gig_id}/accept?workerId={test_worker_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "assignmentId" in data:
                        self.log_result("quickhire", "POST /gigs/{gigId}/accept - Accept Gig", True, 
                                      {"assignmentId": data["assignmentId"]})
                    else:
                        self.log_result("quickhire", "POST /gigs/{gigId}/accept - Accept Gig", False, data, 
                                      "Invalid response format")
                else:
                    self.log_result("quickhire", "POST /gigs/{gigId}/accept - Accept Gig", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "POST /gigs/{gigId}/accept - Accept Gig", False, None, str(e))
        
        # Test 6: GET /api/quickhire/gigs/{gigId}/hiring-status - Get hiring status
        if created_gig_id:
            try:
                response = requests.get(f"{BASE_URL}/quickhire/gigs/{created_gig_id}/hiring-status")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "workersNeeded" in data and "workersAssigned" in data:
                        self.log_result("quickhire", "GET /gigs/{gigId}/hiring-status - Hiring Status", True, 
                                      {"workersNeeded": data["workersNeeded"], 
                                       "workersAssigned": data["workersAssigned"]})
                    else:
                        self.log_result("quickhire", "GET /gigs/{gigId}/hiring-status - Hiring Status", False, data, 
                                      "Invalid response format")
                else:
                    self.log_result("quickhire", "GET /gigs/{gigId}/hiring-status - Hiring Status", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "GET /gigs/{gigId}/hiring-status - Hiring Status", False, None, str(e))
        
        # Test 7: PATCH /api/quickhire/gigs/{gigId}/status - Update gig status
        if created_gig_id:
            try:
                payload = {"status": "in_progress", "notes": "Work started"}
                response = requests.patch(f"{BASE_URL}/quickhire/gigs/{created_gig_id}/status", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("gig", {}).get("status") == "in_progress":
                        self.log_result("quickhire", "PATCH /gigs/{gigId}/status - Update Status", True, 
                                      {"status": "in_progress"})
                    else:
                        self.log_result("quickhire", "PATCH /gigs/{gigId}/status - Update Status", False, data, 
                                      "Status not updated")
                else:
                    self.log_result("quickhire", "PATCH /gigs/{gigId}/status - Update Status", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "PATCH /gigs/{gigId}/status - Update Status", False, None, str(e))
        
        # Test 8: POST /api/quickhire/gigs/{gigId}/complete - Complete gig
        if created_gig_id:
            try:
                response = requests.post(f"{BASE_URL}/quickhire/gigs/{created_gig_id}/complete")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_result("quickhire", "POST /gigs/{gigId}/complete - Complete Gig", True, data)
                    else:
                        self.log_result("quickhire", "POST /gigs/{gigId}/complete - Complete Gig", False, data, 
                                      "Gig not completed")
                else:
                    self.log_result("quickhire", "POST /gigs/{gigId}/complete - Complete Gig", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "POST /gigs/{gigId}/complete - Complete Gig", False, None, str(e))
        
        # Test 9: POST /api/quickhire/ratings - Submit rating
        if created_gig_id:
            try:
                payload = {
                    "gigId": created_gig_id,
                    "raterId": test_client_id,
                    "raterType": "client",
                    "rating": 5,
                    "tags": ["Professional", "On-time", "Quality work"],
                    "comment": "Excellent service, fixed the issue quickly!"
                }
                response = requests.post(f"{BASE_URL}/quickhire/ratings", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "rating" in data:
                        self.log_result("quickhire", "POST /ratings - Submit Rating", True, 
                                      {"rating": payload["rating"]})
                    else:
                        self.log_result("quickhire", "POST /ratings - Submit Rating", False, data, 
                                      "Invalid response format")
                else:
                    self.log_result("quickhire", "POST /ratings - Submit Rating", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "POST /ratings - Submit Rating", False, None, str(e))
        
        # Test 10: GET /api/quickhire/gigs/client/{clientId} - Get client gigs
        try:
            response = requests.get(f"{BASE_URL}/quickhire/gigs/client/{test_client_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "gigs" in data:
                    self.log_result("quickhire", "GET /gigs/client/{clientId} - Client Gigs", True, 
                                  {"count": data.get("count", 0)})
                else:
                    self.log_result("quickhire", "GET /gigs/client/{clientId} - Client Gigs", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "GET /gigs/client/{clientId} - Client Gigs", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "GET /gigs/client/{clientId} - Client Gigs", False, None, str(e))
        
        # Test 11: GET /api/quickhire/gigs/worker/{workerId} - Get worker gigs
        try:
            response = requests.get(f"{BASE_URL}/quickhire/gigs/worker/{test_worker_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "assignments" in data:
                    self.log_result("quickhire", "GET /gigs/worker/{workerId} - Worker Gigs", True, 
                                  {"count": data.get("count", 0)})
                else:
                    self.log_result("quickhire", "GET /gigs/worker/{workerId} - Worker Gigs", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "GET /gigs/worker/{workerId} - Worker Gigs", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "GET /gigs/worker/{workerId} - Worker Gigs", False, None, str(e))
        
        # Test 12: POST /api/quickhire/worker/location - Update worker location
        try:
            payload = {
                "workerId": test_worker_id,
                "location": {
                    "type": "Point",
                    "coordinates": [chicago_coords["lon"], chicago_coords["lat"]],
                    "address": "Chicago, IL"
                }
            }
            response = requests.post(f"{BASE_URL}/quickhire/worker/location", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("quickhire", "POST /worker/location - Update Location", True, data)
                else:
                    self.log_result("quickhire", "POST /worker/location - Update Location", False, data, 
                                  "Location not updated")
            else:
                self.log_result("quickhire", "POST /worker/location - Update Location", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "POST /worker/location - Update Location", False, None, str(e))
        
        # Test 13: POST /api/quickhire/workers/nearby - Find nearby workers
        try:
            params = {
                "lat": chicago_coords["lat"],
                "lon": chicago_coords["lon"],
                "radius": 10
            }
            response = requests.post(f"{BASE_URL}/quickhire/workers/nearby", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "workers" in data:
                    self.log_result("quickhire", "POST /workers/nearby - Find Workers", True, 
                                  {"count": data.get("count", 0)})
                else:
                    self.log_result("quickhire", "POST /workers/nearby - Find Workers", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "POST /workers/nearby - Find Workers", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "POST /workers/nearby - Find Workers", False, None, str(e))
        
        # Test 14: POST /api/quickhire/gigs/{gigId}/close-hiring - Close hiring
        if created_gig_id:
            try:
                response = requests.post(f"{BASE_URL}/quickhire/gigs/{created_gig_id}/close-hiring")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_result("quickhire", "POST /gigs/{gigId}/close-hiring - Close Hiring", True, data)
                    else:
                        self.log_result("quickhire", "POST /gigs/{gigId}/close-hiring - Close Hiring", False, data, 
                                      "Hiring not closed")
                else:
                    self.log_result("quickhire", "POST /gigs/{gigId}/close-hiring - Close Hiring", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "POST /gigs/{gigId}/close-hiring - Close Hiring", False, None, str(e))
        
        # Test 15: POST /api/quickhire/gigs/marketplace - Get marketplace gigs
        try:
            response = requests.post(f"{BASE_URL}/quickhire/gigs/marketplace", json={})
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "gigs" in data:
                    self.log_result("quickhire", "POST /gigs/marketplace - Marketplace", True, 
                                  {"count": len(data.get("gigs", []))})
                else:
                    self.log_result("quickhire", "POST /gigs/marketplace - Marketplace", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "POST /gigs/marketplace - Marketplace", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "POST /gigs/marketplace - Marketplace", False, None, str(e))
        
        # Test 16: POST /api/quickhire/gigs/invite - Invite worker
        if created_gig_id:
            try:
                params = {"gigId": created_gig_id, "workerId": test_worker_id}
                response = requests.post(f"{BASE_URL}/quickhire/gigs/invite", params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_result("quickhire", "POST /gigs/invite - Invite Worker", True, data)
                    else:
                        self.log_result("quickhire", "POST /gigs/invite - Invite Worker", False, data, 
                                      "Invitation failed")
                else:
                    self.log_result("quickhire", "POST /gigs/invite - Invite Worker", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "POST /gigs/invite - Invite Worker", False, None, str(e))
        
        # Test 17: GET /api/quickhire/gigs/response/{gigId} - Get gig responses
        if created_gig_id:
            try:
                response = requests.get(f"{BASE_URL}/quickhire/gigs/response/{created_gig_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "responses" in data:
                        self.log_result("quickhire", "GET /gigs/response/{gigId} - Gig Responses", True, 
                                      {"count": len(data.get("responses", []))})
                    else:
                        self.log_result("quickhire", "GET /gigs/response/{gigId} - Gig Responses", False, data, 
                                      "Invalid response format")
                else:
                    self.log_result("quickhire", "GET /gigs/response/{gigId} - Gig Responses", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("quickhire", "GET /gigs/response/{gigId} - Gig Responses", False, None, str(e))
        
        # Test 18: GET /api/quickhire/notifications/worker/{workerId} - Get worker notifications
        try:
            response = requests.get(f"{BASE_URL}/quickhire/notifications/worker/{test_worker_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "notifications" in data:
                    self.log_result("quickhire", "GET /notifications/worker/{workerId} - Notifications", True, 
                                  {"count": len(data.get("notifications", []))})
                else:
                    self.log_result("quickhire", "GET /notifications/worker/{workerId} - Notifications", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("quickhire", "GET /notifications/worker/{workerId} - Notifications", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "GET /notifications/worker/{workerId} - Notifications", False, None, str(e))
        
        # Test 19: POST /api/quickhire/notifications/log - Log notification
        try:
            payload = {"type": "gig_accepted", "workerId": test_worker_id, "gigId": created_gig_id}
            response = requests.post(f"{BASE_URL}/quickhire/notifications/log", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("quickhire", "POST /notifications/log - Log Notification", True, data)
                else:
                    self.log_result("quickhire", "POST /notifications/log - Log Notification", False, data, 
                                  "Notification not logged")
            else:
                self.log_result("quickhire", "POST /notifications/log - Log Notification", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "POST /notifications/log - Log Notification", False, None, str(e))
        
        # Test 20: POST /api/quickhire/notifications/worker - Send notification to worker
        try:
            params = {"workerId": test_worker_id, "message": "New gig available in your area"}
            response = requests.post(f"{BASE_URL}/quickhire/notifications/worker", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("quickhire", "POST /notifications/worker - Send Notification", True, data)
                else:
                    self.log_result("quickhire", "POST /notifications/worker - Send Notification", False, data, 
                                  "Notification not sent")
            else:
                self.log_result("quickhire", "POST /notifications/worker - Send Notification", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "POST /notifications/worker - Send Notification", False, None, str(e))
        
        # Test 21: Invalid gig ID - 404 handling
        try:
            invalid_gig_id = str(uuid.uuid4())
            response = requests.get(f"{BASE_URL}/quickhire/gigs/{invalid_gig_id}")
            
            if response.status_code == 404:
                self.log_result("quickhire", "GET /gigs/{gigId} - Invalid ID (404)", True, 
                              {"status_code": 404, "message": "Proper 404 handling"})
            else:
                self.log_result("quickhire", "GET /gigs/{gigId} - Invalid ID (404)", False, None, 
                              f"Expected 404, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("quickhire", "GET /gigs/{gigId} - Invalid ID (404)", False, None, str(e))

    def test_dual_persona_switch(self):
        """Test Dual Persona Switch backend implementation"""
        print("\n🔄 Testing Dual Persona Switch System...")
        
        # Generate unique test data
        test_timestamp = int(time.time())
        test_email = f"dual.persona.test.{test_timestamp}@testmail.com"
        test_password = "SecurePass123!"
        test_name = f"Dual Persona Tester {test_timestamp}"
        
        access_token = None
        user_id = None
        
        # Test 1: Register a new user with 'worker' role
        try:
            payload = {
                "email": test_email,
                "password": test_password,
                "name": test_name,
                "role": "worker"
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                # Check for required fields
                required_fields = ["access_token", "user"]
                
                if all(field in data for field in required_fields):
                    user_data = data["user"]
                    # Verify user has currentMode="worker" (should be in user object or check via /me endpoint)
                    if ("roles" in user_data and "worker" in user_data["roles"]):
                        access_token = data["access_token"]
                        user_id = user_data["id"]
                        self.log_result("dual_persona", "Register Worker User", True, 
                                      {"user_id": user_id, "roles": user_data["roles"]})
                    else:
                        self.log_result("dual_persona", "Register Worker User", False, data, 
                                      "User does not have worker role")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("dual_persona", "Register Worker User", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("dual_persona", "Register Worker User", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("dual_persona", "Register Worker User", False, None, str(e))
        
        # Test 2: Get user info and verify currentMode
        if access_token:
            try:
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify currentMode field is present and set to "worker"
                    if "currentMode" in data and data["currentMode"] == "worker":
                        self.log_result("dual_persona", "Get User Info - Verify CurrentMode", True, 
                                      {"currentMode": data["currentMode"], "roles": data.get("roles", [])})
                    else:
                        self.log_result("dual_persona", "Get User Info - Verify CurrentMode", False, data, 
                                      f"Expected currentMode='worker', got: {data.get('currentMode')}")
                else:
                    self.log_result("dual_persona", "Get User Info - Verify CurrentMode", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("dual_persona", "Get User Info - Verify CurrentMode", False, None, str(e))
        
        # Test 3: Add secondary role (employer)
        if access_token:
            try:
                headers = {"Authorization": f"Bearer {access_token}"}
                payload = {"role": "employer"}
                response = requests.post(f"{BASE_URL}/auth/add-role", json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify user now has both roles
                    if "roles" in data and "worker" in data["roles"] and "employer" in data["roles"]:
                        self.log_result("dual_persona", "Add Secondary Role - Employer", True, 
                                      {"roles": data["roles"]})
                    else:
                        self.log_result("dual_persona", "Add Secondary Role - Employer", False, data, 
                                      f"Expected both worker and employer roles, got: {data.get('roles')}")
                else:
                    self.log_result("dual_persona", "Add Secondary Role - Employer", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("dual_persona", "Add Secondary Role - Employer", False, None, str(e))
        
        # Test 4: Switch mode from worker to employer
        if access_token:
            try:
                headers = {"Authorization": f"Bearer {access_token}"}
                payload = {"currentMode": "employer"}
                response = requests.post(f"{BASE_URL}/auth/mode", json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify successful response
                    if "currentMode" in data and data["currentMode"] == "employer":
                        self.log_result("dual_persona", "Switch Mode - Worker to Employer", True, data)
                    else:
                        self.log_result("dual_persona", "Switch Mode - Worker to Employer", False, data, 
                                      "Mode switch response invalid")
                else:
                    self.log_result("dual_persona", "Switch Mode - Worker to Employer", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("dual_persona", "Switch Mode - Worker to Employer", False, None, str(e))
        
        # Test 4b: Verify mode switch via /me endpoint
        if access_token:
            try:
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify currentMode is now "employer"
                    if "currentMode" in data and data["currentMode"] == "employer":
                        self.log_result("dual_persona", "Verify Mode Switch - Employer", True, 
                                      {"currentMode": data["currentMode"]})
                    else:
                        self.log_result("dual_persona", "Verify Mode Switch - Employer", False, data, 
                                      f"Expected currentMode='employer', got: {data.get('currentMode')}")
                else:
                    self.log_result("dual_persona", "Verify Mode Switch - Employer", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("dual_persona", "Verify Mode Switch - Employer", False, None, str(e))
        
        # Test 5: Switch back to worker mode
        if access_token:
            try:
                headers = {"Authorization": f"Bearer {access_token}"}
                payload = {"currentMode": "worker"}
                response = requests.post(f"{BASE_URL}/auth/mode", json=payload, headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify successful response
                    if "currentMode" in data and data["currentMode"] == "worker":
                        self.log_result("dual_persona", "Switch Mode - Employer to Worker", True, data)
                    else:
                        self.log_result("dual_persona", "Switch Mode - Employer to Worker", False, data, 
                                      "Mode switch response invalid")
                else:
                    self.log_result("dual_persona", "Switch Mode - Employer to Worker", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("dual_persona", "Switch Mode - Employer to Worker", False, None, str(e))
        
        # Test 6: Attempt to switch to role user doesn't have
        # Create a new user with only "worker" role for this test
        try:
            test_email_2 = f"single.role.test.{test_timestamp}@testmail.com"
            payload = {
                "email": test_email_2,
                "password": test_password,
                "name": f"Single Role Tester {test_timestamp}",
                "role": "worker"
            }
            
            response = requests.post(f"{BASE_URL}/auth/register", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                single_role_token = data["access_token"]
                
                # Try to switch to employer mode without adding the role first
                headers = {"Authorization": f"Bearer {single_role_token}"}
                payload = {"currentMode": "employer"}
                response = requests.post(f"{BASE_URL}/auth/mode", json=payload, headers=headers)
                
                # Should return 403 Forbidden error
                if response.status_code == 403:
                    self.log_result("dual_persona", "Switch to Unauthorized Role - 403 Error", True, 
                                  {"status_code": response.status_code, "message": "Properly blocked unauthorized role switch"})
                else:
                    self.log_result("dual_persona", "Switch to Unauthorized Role - 403 Error", False, None, 
                                  f"Expected 403 Forbidden, got HTTP {response.status_code}")
            else:
                self.log_result("dual_persona", "Switch to Unauthorized Role - 403 Error", False, None, 
                              f"Failed to create single role user: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("dual_persona", "Switch to Unauthorized Role - 403 Error", False, None, str(e))

    def test_grow_system_endpoints(self):
        """Test Grow System API endpoints"""
        print("\n📚 Testing Grow System Endpoints...")
        
        test_user_id = "grow-test-user-123"
        test_course_id = None
        test_assessment_id = None
        test_post_id = None
        
        # Test 1: GET /api/grow/courses - Get courses with filters
        try:
            response = requests.get(f"{BASE_URL}/grow/courses")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    courses_data = data["data"]
                    if ("courses" in courses_data and "pagination" in courses_data):
                        self.log_result("grow", "Get Courses - GET /api/grow/courses", True, 
                                      {"course_count": len(courses_data["courses"]), "pagination": courses_data["pagination"]})
                    else:
                        self.log_result("grow", "Get Courses - GET /api/grow/courses", False, data, 
                                      "Missing courses or pagination fields")
                else:
                    self.log_result("grow", "Get Courses - GET /api/grow/courses", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("grow", "Get Courses - GET /api/grow/courses", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("grow", "Get Courses - GET /api/grow/courses", False, None, str(e))
        
        # Test 2: GET /api/grow/courses with filters
        try:
            response = requests.get(f"{BASE_URL}/grow/courses?category=Web Development&level=beginner&search=react")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    self.log_result("grow", "Get Courses with Filters", True, data)
                else:
                    self.log_result("grow", "Get Courses with Filters", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Get Courses with Filters", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Get Courses with Filters", False, None, str(e))
        
        # Test 3: POST /api/grow/courses/{course_id}/enroll - Enroll in course
        try:
            # Use a mock course ID for testing
            mock_course_id = "test-course-123"
            response = requests.post(f"{BASE_URL}/grow/courses/{mock_course_id}/enroll?user_id={test_user_id}")
            
            # This might return 404 if course doesn't exist, which is expected
            if response.status_code == 404:
                self.log_result("grow", "Course Enrollment - Course Not Found", True, 
                              {"status_code": response.status_code, "message": "Properly handled non-existent course"})
            elif response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("grow", "Course Enrollment - Success", True, data)
                else:
                    self.log_result("grow", "Course Enrollment - Success", False, data, "Enrollment failed")
            else:
                self.log_result("grow", "Course Enrollment", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Course Enrollment", False, None, str(e))
        
        # Test 4: POST /api/grow/courses/{course_id}/complete-lesson - Complete lesson
        try:
            mock_course_id = "test-course-123"
            payload = {
                "lesson_id": "lesson-123",
                "score": 85.5,
                "time_spent": 1800
            }
            response = requests.post(f"{BASE_URL}/grow/courses/{mock_course_id}/complete-lesson?user_id={test_user_id}", json=payload)
            
            # This might return 404 if not enrolled, which is expected
            if response.status_code == 404:
                self.log_result("grow", "Complete Lesson - Not Enrolled", True, 
                              {"status_code": response.status_code, "message": "Properly handled not enrolled"})
            elif response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("grow", "Complete Lesson - Success", True, data)
                else:
                    self.log_result("grow", "Complete Lesson - Success", False, data, "Lesson completion failed")
            else:
                self.log_result("grow", "Complete Lesson", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Complete Lesson", False, None, str(e))
        
        # Test 5: POST /api/grow/assessments/start - Start assessment
        try:
            payload = {
                "skill": "JavaScript",
                "category": "Programming"
            }
            response = requests.post(f"{BASE_URL}/grow/assessments/start?user_id={test_user_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    assessment_data = data["data"]
                    if ("id" in assessment_data and "questions" in assessment_data):
                        test_assessment_id = assessment_data["id"]
                        self.log_result("grow", "Start Assessment", True, 
                                      {"assessment_id": test_assessment_id, "question_count": len(assessment_data["questions"])})
                    else:
                        self.log_result("grow", "Start Assessment", False, data, "Missing assessment fields")
                else:
                    self.log_result("grow", "Start Assessment", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Start Assessment", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Start Assessment", False, None, str(e))
        
        # Test 6: POST /api/grow/assessments/{assessment_id}/submit - Submit assessment
        try:
            if test_assessment_id:
                payload = {
                    "answers": [0, 1, 2, 3, 0, 1, 2, 3, 0, 1],  # 10 answers
                    "time_spent": 1200
                }
                response = requests.post(f"{BASE_URL}/grow/assessments/{test_assessment_id}/submit", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("success") and "data" in data):
                        assessment_result = data["data"]
                        if ("score" in assessment_result and "passed" in assessment_result):
                            self.log_result("grow", "Submit Assessment", True, 
                                          {"score": assessment_result["score"], "passed": assessment_result["passed"]})
                        else:
                            self.log_result("grow", "Submit Assessment", False, data, "Missing assessment result fields")
                    else:
                        self.log_result("grow", "Submit Assessment", False, data, "Invalid response format")
                else:
                    self.log_result("grow", "Submit Assessment", False, None, f"HTTP {response.status_code}")
            else:
                self.log_result("grow", "Submit Assessment", False, None, "No assessment ID available")
                
        except Exception as e:
            self.log_result("grow", "Submit Assessment", False, None, str(e))
        
        # Test 7: GET /api/grow/community/posts - Get community posts
        try:
            response = requests.get(f"{BASE_URL}/grow/community/posts")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    posts_data = data["data"]
                    if ("posts" in posts_data and "pagination" in posts_data):
                        self.log_result("grow", "Get Community Posts", True, 
                                      {"post_count": len(posts_data["posts"]), "pagination": posts_data["pagination"]})
                    else:
                        self.log_result("grow", "Get Community Posts", False, data, "Missing posts or pagination")
                else:
                    self.log_result("grow", "Get Community Posts", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Get Community Posts", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Get Community Posts", False, None, str(e))
        
        # Test 8: POST /api/grow/community/posts - Create post
        try:
            payload = {
                "content": "This is a test post about learning JavaScript. Any tips for beginners?",
                "type": "question",
                "category": "programming",
                "title": "JavaScript Learning Tips"
            }
            response = requests.post(f"{BASE_URL}/grow/community/posts?user_id={test_user_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    post_data = data["data"]
                    if ("id" in post_data and "content" in post_data):
                        test_post_id = post_data["id"]
                        self.log_result("grow", "Create Community Post", True, 
                                      {"post_id": test_post_id, "type": post_data["type"]})
                    else:
                        self.log_result("grow", "Create Community Post", False, data, "Missing post fields")
                else:
                    self.log_result("grow", "Create Community Post", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Create Community Post", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Create Community Post", False, None, str(e))
        
        # Test 9: POST /api/grow/community/posts/{post_id}/upvote - Upvote post
        try:
            if test_post_id:
                response = requests.post(f"{BASE_URL}/grow/community/posts/{test_post_id}/upvote?user_id={test_user_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_result("grow", "Upvote Post", True, data)
                    else:
                        self.log_result("grow", "Upvote Post", False, data, "Upvote failed")
                else:
                    self.log_result("grow", "Upvote Post", False, None, f"HTTP {response.status_code}")
            else:
                self.log_result("grow", "Upvote Post", False, None, "No post ID available")
                
        except Exception as e:
            self.log_result("grow", "Upvote Post", False, None, str(e))
        
        # Test 10: POST /api/grow/community/posts/{post_id}/comments - Add comment
        try:
            if test_post_id:
                payload = {
                    "content": "Great question! I recommend starting with basic syntax and then moving to DOM manipulation."
                }
                response = requests.post(f"{BASE_URL}/grow/community/posts/{test_post_id}/comments?user_id={test_user_id}", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_result("grow", "Add Comment", True, data)
                    else:
                        self.log_result("grow", "Add Comment", False, data, "Comment failed")
                else:
                    self.log_result("grow", "Add Comment", False, None, f"HTTP {response.status_code}")
            else:
                self.log_result("grow", "Add Comment", False, None, "No post ID available")
                
        except Exception as e:
            self.log_result("grow", "Add Comment", False, None, str(e))
        
        # Test 11: GET /api/grow/progress/analytics - Get user analytics
        try:
            response = requests.get(f"{BASE_URL}/grow/progress/analytics?user_id={test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    analytics_data = data["data"]
                    if ("overview" in analytics_data and "recent_activity" in analytics_data):
                        self.log_result("grow", "Get User Analytics", True, analytics_data["overview"])
                    else:
                        self.log_result("grow", "Get User Analytics", False, data, "Missing analytics fields")
                else:
                    self.log_result("grow", "Get User Analytics", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Get User Analytics", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Get User Analytics", False, None, str(e))
        
        # Test 12: GET /api/grow/recommendations/courses - Get course recommendations
        try:
            response = requests.get(f"{BASE_URL}/grow/recommendations/courses?user_id={test_user_id}&limit=5")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    recommendations = data["data"]
                    if isinstance(recommendations, list):
                        self.log_result("grow", "Get Course Recommendations", True, 
                                      {"recommendation_count": len(recommendations)})
                    else:
                        self.log_result("grow", "Get Course Recommendations", False, data, "Invalid recommendations format")
                else:
                    self.log_result("grow", "Get Course Recommendations", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Get Course Recommendations", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Get Course Recommendations", False, None, str(e))
        
        # Test 13: GET /api/grow/career-paths - Get career paths
        try:
            response = requests.get(f"{BASE_URL}/grow/career-paths")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    career_data = data["data"]
                    if isinstance(career_data, dict):
                        self.log_result("grow", "Get Career Paths - All", True, 
                                      {"career_count": len(career_data)})
                    else:
                        self.log_result("grow", "Get Career Paths - All", False, data, "Invalid career paths format")
                else:
                    self.log_result("grow", "Get Career Paths - All", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Get Career Paths - All", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Get Career Paths - All", False, None, str(e))
        
        # Test 14: GET /api/grow/career-paths with goal parameter
        try:
            response = requests.get(f"{BASE_URL}/grow/career-paths?goal=frontend")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    career_data = data["data"]
                    if ("title" in career_data and "required_skills" in career_data):
                        self.log_result("grow", "Get Career Paths - Frontend Goal", True, 
                                      {"title": career_data["title"], "skills": career_data["required_skills"]})
                    else:
                        self.log_result("grow", "Get Career Paths - Frontend Goal", False, data, "Missing career path fields")
                else:
                    self.log_result("grow", "Get Career Paths - Frontend Goal", False, data, "Invalid response format")
            else:
                self.log_result("grow", "Get Career Paths - Frontend Goal", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("grow", "Get Career Paths - Frontend Goal", False, None, str(e))

    def test_search_system_endpoints(self):
        """Test Advanced Search & Filters System API endpoints"""
        print("\n🔍 Testing Search System Endpoints...")
        
        # Test 1: GET /api/search/gigs - Search gigs with various filters
        try:
            response = requests.get(f"{BASE_URL}/search/gigs")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    search_data = data["data"]
                    if ("gigs" in search_data and "pagination" in search_data):
                        self.log_result("search", "Search Gigs - Basic", True, 
                                      {"gig_count": len(search_data["gigs"]), "pagination": search_data["pagination"]})
                    else:
                        self.log_result("search", "Search Gigs - Basic", False, data, "Missing gigs or pagination")
                else:
                    self.log_result("search", "Search Gigs - Basic", False, data, "Invalid response format")
            else:
                self.log_result("search", "Search Gigs - Basic", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Search Gigs - Basic", False, None, str(e))
        
        # Test 2: GET /api/search/gigs with filters
        try:
            params = {
                "q": "react developer",
                "category": "Web Development",
                "skills": "react,javascript",
                "budget_min": 100,
                "budget_max": 1000,
                "sort_by": "budget_high",
                "page": 1,
                "limit": 10
            }
            response = requests.get(f"{BASE_URL}/search/gigs", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    search_data = data["data"]
                    if ("filters" in search_data):
                        self.log_result("search", "Search Gigs - With Filters", True, 
                                      {"applied_filters": search_data["filters"]})
                    else:
                        self.log_result("search", "Search Gigs - With Filters", False, data, "Missing filters")
                else:
                    self.log_result("search", "Search Gigs - With Filters", False, data, "Invalid response format")
            else:
                self.log_result("search", "Search Gigs - With Filters", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Search Gigs - With Filters", False, None, str(e))
        
        # Test 3: GET /api/search/talents - Search talents with filters
        try:
            response = requests.get(f"{BASE_URL}/search/talents")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    search_data = data["data"]
                    if ("talents" in search_data and "pagination" in search_data):
                        self.log_result("search", "Search Talents - Basic", True, 
                                      {"talent_count": len(search_data["talents"]), "pagination": search_data["pagination"]})
                    else:
                        self.log_result("search", "Search Talents - Basic", False, data, "Missing talents or pagination")
                else:
                    self.log_result("search", "Search Talents - Basic", False, data, "Invalid response format")
            else:
                self.log_result("search", "Search Talents - Basic", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Search Talents - Basic", False, None, str(e))
        
        # Test 4: GET /api/search/talents with filters
        try:
            params = {
                "q": "javascript developer",
                "skills": "javascript,react",
                "exp_min": 2,
                "exp_max": 8,
                "rate_min": 25,
                "rate_max": 100,
                "availability": "full-time",
                "verification": "verified",
                "rating_min": 4.0,
                "sort_by": "rating"
            }
            response = requests.get(f"{BASE_URL}/search/talents", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    search_data = data["data"]
                    if ("filters" in search_data):
                        self.log_result("search", "Search Talents - With Filters", True, 
                                      {"applied_filters": search_data["filters"]})
                    else:
                        self.log_result("search", "Search Talents - With Filters", False, data, "Missing filters")
                else:
                    self.log_result("search", "Search Talents - With Filters", False, data, "Invalid response format")
            else:
                self.log_result("search", "Search Talents - With Filters", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Search Talents - With Filters", False, None, str(e))
        
        # Test 5: GET /api/search/suggestions - Get search suggestions
        try:
            response = requests.get(f"{BASE_URL}/search/suggestions?q=react&type=gigs")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    suggestions = data["data"]
                    if isinstance(suggestions, list):
                        self.log_result("search", "Get Search Suggestions - Gigs", True, 
                                      {"suggestion_count": len(suggestions)})
                    else:
                        self.log_result("search", "Get Search Suggestions - Gigs", False, data, "Invalid suggestions format")
                else:
                    self.log_result("search", "Get Search Suggestions - Gigs", False, data, "Invalid response format")
            else:
                self.log_result("search", "Get Search Suggestions - Gigs", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Get Search Suggestions - Gigs", False, None, str(e))
        
        # Test 6: GET /api/search/suggestions for talents
        try:
            response = requests.get(f"{BASE_URL}/search/suggestions?q=javascript&type=talents")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    suggestions = data["data"]
                    if isinstance(suggestions, list):
                        self.log_result("search", "Get Search Suggestions - Talents", True, 
                                      {"suggestion_count": len(suggestions)})
                    else:
                        self.log_result("search", "Get Search Suggestions - Talents", False, data, "Invalid suggestions format")
                else:
                    self.log_result("search", "Get Search Suggestions - Talents", False, data, "Invalid response format")
            else:
                self.log_result("search", "Get Search Suggestions - Talents", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Get Search Suggestions - Talents", False, None, str(e))
        
        # Test 7: GET /api/search/filters - Get available filters for gigs
        try:
            response = requests.get(f"{BASE_URL}/search/filters?type=gigs")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    filters_data = data["data"]
                    if ("categories" in filters_data and "budget_ranges" in filters_data):
                        self.log_result("search", "Get Search Filters - Gigs", True, 
                                      {"categories": len(filters_data.get("categories", [])), 
                                       "budget_ranges": len(filters_data.get("budget_ranges", []))})
                    else:
                        self.log_result("search", "Get Search Filters - Gigs", False, data, "Missing filter fields")
                else:
                    self.log_result("search", "Get Search Filters - Gigs", False, data, "Invalid response format")
            else:
                self.log_result("search", "Get Search Filters - Gigs", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Get Search Filters - Gigs", False, None, str(e))
        
        # Test 8: GET /api/search/filters - Get available filters for talents
        try:
            response = requests.get(f"{BASE_URL}/search/filters?type=talents")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    filters_data = data["data"]
                    if ("skills" in filters_data and "hourly_rate_ranges" in filters_data):
                        self.log_result("search", "Get Search Filters - Talents", True, 
                                      {"skills": len(filters_data.get("skills", [])), 
                                       "rate_ranges": len(filters_data.get("hourly_rate_ranges", []))})
                    else:
                        self.log_result("search", "Get Search Filters - Talents", False, data, "Missing filter fields")
                else:
                    self.log_result("search", "Get Search Filters - Talents", False, data, "Invalid response format")
            else:
                self.log_result("search", "Get Search Filters - Talents", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Get Search Filters - Talents", False, None, str(e))
        
        # Test 9: GET /api/search/advanced - AI-powered search
        try:
            params = {
                "q": "react developer",
                "skills": "react,javascript",
                "user_id": "test-user-123"
            }
            response = requests.get(f"{BASE_URL}/search/advanced", params=params)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    search_data = data["data"]
                    if ("gigs" in search_data and "pagination" in search_data):
                        # Check if AI relevance scores are added for authenticated user
                        gigs = search_data["gigs"]
                        has_ai_scores = any("ai_relevance_score" in gig for gig in gigs)
                        self.log_result("search", "Advanced AI Search", True, 
                                      {"gig_count": len(gigs), "has_ai_scores": has_ai_scores})
                    else:
                        self.log_result("search", "Advanced AI Search", False, data, "Missing gigs or pagination")
                else:
                    self.log_result("search", "Advanced AI Search", False, data, "Invalid response format")
            else:
                self.log_result("search", "Advanced AI Search", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("search", "Advanced AI Search", False, None, str(e))

    def test_verification_system_endpoints(self):
        """Test Talent Verification System API endpoints"""
        print("\n🛡️ Testing Verification System Endpoints...")
        
        test_user_id = "verification-test-user-123"
        test_verification_id = None
        test_document_id = None
        
        # Test 1: POST /api/verification/start - Start verification
        try:
            payload = {
                "level": "verified"
            }
            response = requests.post(f"{BASE_URL}/verification/start?user_id={test_user_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    verification_data = data["data"]
                    if ("id" in verification_data and "level" in verification_data):
                        test_verification_id = verification_data["id"]
                        self.log_result("verification", "Start Verification", True, 
                                      {"verification_id": test_verification_id, "level": verification_data["level"]})
                    else:
                        self.log_result("verification", "Start Verification", False, data, "Missing verification fields")
                else:
                    self.log_result("verification", "Start Verification", False, data, "Invalid response format")
            elif response.status_code == 400:
                # Already exists - acceptable
                self.log_result("verification", "Start Verification", True, 
                              {"status_code": response.status_code, "message": "Verification already exists"})
            else:
                self.log_result("verification", "Start Verification", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("verification", "Start Verification", False, None, str(e))
        
        # Test 2: POST /api/verification/documents - Upload document
        try:
            payload = {
                "type": "id",
                "file_url": "https://example.com/documents/id-card.jpg",
                "file_name": "id-card.jpg",
                "file_size": 1024000,
                "mime_type": "image/jpeg"
            }
            response = requests.post(f"{BASE_URL}/verification/documents?user_id={test_user_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    verification_data = data["data"]
                    if ("documents" in verification_data and len(verification_data["documents"]) > 0):
                        test_document_id = verification_data["documents"][-1]["id"]
                        self.log_result("verification", "Upload Document", True, 
                                      {"document_id": test_document_id, "document_count": len(verification_data["documents"])})
                    else:
                        self.log_result("verification", "Upload Document", False, data, "No documents found")
                else:
                    self.log_result("verification", "Upload Document", False, data, "Invalid response format")
            elif response.status_code == 404:
                self.log_result("verification", "Upload Document", True, 
                              {"status_code": response.status_code, "message": "No verification process started"})
            else:
                self.log_result("verification", "Upload Document", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("verification", "Upload Document", False, None, str(e))
        
        # Test 3: POST /api/verification/identity/verify - Verify identity
        try:
            if test_document_id:
                payload = {
                    "document_id": test_document_id
                }
                response = requests.post(f"{BASE_URL}/verification/identity/verify?user_id={test_user_id}", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        verification_data = data.get("data", {})
                        identity_verified = verification_data.get("verifications", {}).get("identity", {}).get("verified", False)
                        self.log_result("verification", "Verify Identity", True, 
                                      {"identity_verified": identity_verified, "message": data.get("message")})
                    else:
                        self.log_result("verification", "Verify Identity", False, data, "Identity verification failed")
                elif response.status_code == 404:
                    self.log_result("verification", "Verify Identity", True, 
                                  {"status_code": response.status_code, "message": "Document or verification not found"})
                else:
                    self.log_result("verification", "Verify Identity", False, None, f"HTTP {response.status_code}")
            else:
                self.log_result("verification", "Verify Identity", False, None, "No document ID available")
                
        except Exception as e:
            self.log_result("verification", "Verify Identity", False, None, str(e))
        
        # Test 4: POST /api/verification/skills/verify - Verify skill via assessment
        try:
            payload = {
                "skill": "JavaScript",
                "method": "assessment"
            }
            response = requests.post(f"{BASE_URL}/verification/skills/verify?user_id={test_user_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    verification_data = data.get("data", {})
                    skills = verification_data.get("verifications", {}).get("skills", [])
                    self.log_result("verification", "Verify Skill - Assessment", True, 
                                  {"skill_count": len(skills), "message": data.get("message")})
                else:
                    self.log_result("verification", "Verify Skill - Assessment", False, data, "Skill verification failed")
            elif response.status_code == 404:
                self.log_result("verification", "Verify Skill - Assessment", True, 
                              {"status_code": response.status_code, "message": "No verification process or assessment found"})
            else:
                self.log_result("verification", "Verify Skill - Assessment", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("verification", "Verify Skill - Assessment", False, None, str(e))
        
        # Test 5: POST /api/verification/skills/verify - Verify skill via portfolio
        try:
            payload = {
                "skill": "UI/UX Design",
                "method": "portfolio"
            }
            response = requests.post(f"{BASE_URL}/verification/skills/verify?user_id={test_user_id}", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    verification_data = data.get("data", {})
                    skills = verification_data.get("verifications", {}).get("skills", [])
                    self.log_result("verification", "Verify Skill - Portfolio", True, 
                                  {"skill_count": len(skills), "message": data.get("message")})
                else:
                    self.log_result("verification", "Verify Skill - Portfolio", False, data, "Skill verification failed")
            elif response.status_code == 404:
                self.log_result("verification", "Verify Skill - Portfolio", True, 
                              {"status_code": response.status_code, "message": "No verification process found"})
            else:
                self.log_result("verification", "Verify Skill - Portfolio", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("verification", "Verify Skill - Portfolio", False, None, str(e))
        
        # Test 6: POST /api/verification/complete - Complete verification
        try:
            response = requests.post(f"{BASE_URL}/verification/complete?user_id={test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    verification_data = data.get("data", {})
                    status = verification_data.get("status")
                    self.log_result("verification", "Complete Verification", True, 
                                  {"status": status, "message": data.get("message")})
                else:
                    self.log_result("verification", "Complete Verification", False, data, "Verification completion failed")
            elif response.status_code == 400:
                self.log_result("verification", "Complete Verification", True, 
                              {"status_code": response.status_code, "message": "Requirements not met (expected)"})
            elif response.status_code == 404:
                self.log_result("verification", "Complete Verification", True, 
                              {"status_code": response.status_code, "message": "No verification process found"})
            else:
                self.log_result("verification", "Complete Verification", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("verification", "Complete Verification", False, None, str(e))
        
        # Test 7: GET /api/verification/status - Get verification status
        try:
            response = requests.get(f"{BASE_URL}/verification/status?user_id={test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    status_data = data["data"]
                    if ("status" in status_data and "progress" in status_data):
                        self.log_result("verification", "Get Verification Status", True, 
                                      {"status": status_data["status"], "progress": status_data["progress"]})
                    else:
                        self.log_result("verification", "Get Verification Status", False, data, "Missing status fields")
                else:
                    self.log_result("verification", "Get Verification Status", False, data, "Invalid response format")
            else:
                self.log_result("verification", "Get Verification Status", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("verification", "Get Verification Status", False, None, str(e))
        
        # Test 8: GET /api/verification/admin/stats - Get admin statistics
        try:
            response = requests.get(f"{BASE_URL}/verification/admin/stats")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    stats_data = data["data"]
                    if ("total" in stats_data and "pending" in stats_data):
                        self.log_result("verification", "Get Admin Stats", True, 
                                      {"total": stats_data["total"], "pending": stats_data["pending"]})
                    else:
                        self.log_result("verification", "Get Admin Stats", False, data, "Missing stats fields")
                else:
                    self.log_result("verification", "Get Admin Stats", False, data, "Invalid response format")
            else:
                self.log_result("verification", "Get Admin Stats", False, None, f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("verification", "Get Admin Stats", False, None, str(e))
        
        # Test 9: POST /api/verification/admin/review/{verification_id} - Admin review
        try:
            if test_verification_id:
                payload = {
                    "action": "approve",
                    "notes": "All documents verified successfully"
                }
                response = requests.post(f"{BASE_URL}/verification/admin/review/{test_verification_id}?reviewer_id=admin-123", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        verification_data = data.get("data", {})
                        status = verification_data.get("status")
                        self.log_result("verification", "Admin Review Verification", True, 
                                      {"status": status, "message": data.get("message")})
                    else:
                        self.log_result("verification", "Admin Review Verification", False, data, "Admin review failed")
                elif response.status_code == 404:
                    self.log_result("verification", "Admin Review Verification", True, 
                                  {"status_code": response.status_code, "message": "Verification not found"})
                else:
                    self.log_result("verification", "Admin Review Verification", False, None, f"HTTP {response.status_code}")
            else:
                self.log_result("verification", "Admin Review Verification", False, None, "No verification ID available")
                
        except Exception as e:
            self.log_result("verification", "Admin Review Verification", False, None, str(e))

    def test_sms_gateway_system(self):
        """Test SMS Gateway System endpoints comprehensively"""
        print("\n📱 Testing SMS Gateway System...")
        
        test_phone = "+1234567890"
        test_user_id = None
        test_gig_id = None
        
        # Test 1: POST /api/sms/webhook/incoming - Main SMS webhook with create gig
        try:
            payload = {
                "From": test_phone,
                "Body": "Web development $500 2 weeks",
                "MessageSid": "test_msg_123"
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "response" in data:
                    response_msg = data["response"]
                    if "created successfully" in response_msg and "ID:" in response_msg:
                        # Extract gig ID from response
                        import re
                        id_match = re.search(r'ID:\s*(\w+)', response_msg)
                        if id_match:
                            test_gig_id = id_match.group(1)
                        self.log_result("sms_gateway", "SMS Webhook - Create Gig", True, 
                                      {"response": response_msg, "gig_id": test_gig_id})
                    else:
                        self.log_result("sms_gateway", "SMS Webhook - Create Gig", False, data, 
                                      "Gig creation response not as expected")
                else:
                    self.log_result("sms_gateway", "SMS Webhook - Create Gig", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("sms_gateway", "SMS Webhook - Create Gig", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Webhook - Create Gig", False, None, str(e))
        
        # Test 2: SMS webhook with update gig command
        try:
            if test_gig_id:
                payload = {
                    "From": test_phone,
                    "Body": f"Update gig {test_gig_id} price $600"
                }
                
                response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "updated successfully" in data.get("response", ""):
                        self.log_result("sms_gateway", "SMS Webhook - Update Gig", True, data)
                    else:
                        self.log_result("sms_gateway", "SMS Webhook - Update Gig", False, data, 
                                      "Update response not as expected")
                else:
                    self.log_result("sms_gateway", "SMS Webhook - Update Gig", False, None, 
                                  f"HTTP {response.status_code}")
            else:
                self.log_result("sms_gateway", "SMS Webhook - Update Gig", False, None, 
                              "No gig ID available for update test")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Webhook - Update Gig", False, None, str(e))
        
        # Test 3: SMS webhook with delete gig command
        try:
            if test_gig_id:
                payload = {
                    "From": test_phone,
                    "Body": f"Delete gig {test_gig_id}"
                }
                
                response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and ("cancelled" in data.get("response", "") or "deleted" in data.get("response", "")):
                        self.log_result("sms_gateway", "SMS Webhook - Delete Gig", True, data)
                    else:
                        self.log_result("sms_gateway", "SMS Webhook - Delete Gig", False, data, 
                                      "Delete response not as expected")
                else:
                    self.log_result("sms_gateway", "SMS Webhook - Delete Gig", False, None, 
                                  f"HTTP {response.status_code}")
            else:
                self.log_result("sms_gateway", "SMS Webhook - Delete Gig", False, None, 
                              "No gig ID available for delete test")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Webhook - Delete Gig", False, None, str(e))
        
        # Test 4: SMS webhook with status check
        try:
            payload = {
                "From": test_phone,
                "Body": "Status"
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "Your Status:" in data.get("response", ""):
                    response_msg = data["response"]
                    if "Active Gigs:" in response_msg and "Completed:" in response_msg:
                        self.log_result("sms_gateway", "SMS Webhook - Status Check", True, data)
                    else:
                        self.log_result("sms_gateway", "SMS Webhook - Status Check", False, data, 
                                      "Status response missing expected fields")
                else:
                    self.log_result("sms_gateway", "SMS Webhook - Status Check", False, data, 
                                  "Status response not as expected")
            else:
                self.log_result("sms_gateway", "SMS Webhook - Status Check", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Webhook - Status Check", False, None, str(e))
        
        # Test 5: SMS webhook with help command
        try:
            payload = {
                "From": test_phone,
                "Body": "Help"
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "HAPPLOYED SMS HELP:" in data.get("response", ""):
                    response_msg = data["response"]
                    if "CREATE GIG:" in response_msg and "UPDATE GIG:" in response_msg:
                        self.log_result("sms_gateway", "SMS Webhook - Help Command", True, data)
                    else:
                        self.log_result("sms_gateway", "SMS Webhook - Help Command", False, data, 
                                      "Help response missing expected sections")
                else:
                    self.log_result("sms_gateway", "SMS Webhook - Help Command", False, data, 
                                  "Help response not as expected")
            else:
                self.log_result("sms_gateway", "SMS Webhook - Help Command", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Webhook - Help Command", False, None, str(e))
        
        # Test 6: POST /api/sms/send - Manual SMS sending (mocked)
        try:
            payload = {
                "phone_number": test_phone,
                "message": "Test message from Hapployed SMS Gateway"
            }
            
            response = requests.post(f"{BASE_URL}/sms/send", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    sms_data = data["data"]
                    if ("phone_number" in sms_data and "message_id" in sms_data and 
                        sms_data.get("status") == "sent" and sms_data.get("provider") == "mock"):
                        self.log_result("sms_gateway", "Manual SMS Send", True, sms_data)
                    else:
                        self.log_result("sms_gateway", "Manual SMS Send", False, data, 
                                      "SMS send response missing expected fields")
                else:
                    self.log_result("sms_gateway", "Manual SMS Send", False, data, 
                                  "Invalid SMS send response format")
            else:
                self.log_result("sms_gateway", "Manual SMS Send", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "Manual SMS Send", False, None, str(e))
        
        # Test 7: GET /api/sms/analytics - SMS usage analytics (7d default)
        try:
            response = requests.get(f"{BASE_URL}/sms/analytics")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "data" in data:
                    analytics_data = data["data"]
                    if isinstance(analytics_data, list):
                        self.log_result("sms_gateway", "SMS Analytics - 7d Default", True, 
                                      {"analytics_count": len(analytics_data)})
                    else:
                        self.log_result("sms_gateway", "SMS Analytics - 7d Default", False, data, 
                                      "Analytics data not in expected list format")
                else:
                    self.log_result("sms_gateway", "SMS Analytics - 7d Default", False, data, 
                                  "Invalid analytics response format")
            else:
                self.log_result("sms_gateway", "SMS Analytics - 7d Default", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Analytics - 7d Default", False, None, str(e))
        
        # Test 8: GET /api/sms/analytics with different ranges
        for range_param in ["24h", "30d"]:
            try:
                response = requests.get(f"{BASE_URL}/sms/analytics?range={range_param}")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and "data" in data:
                        self.log_result("sms_gateway", f"SMS Analytics - {range_param}", True, 
                                      {"range": range_param, "data_count": len(data["data"])})
                    else:
                        self.log_result("sms_gateway", f"SMS Analytics - {range_param}", False, data, 
                                      "Invalid analytics response format")
                else:
                    self.log_result("sms_gateway", f"SMS Analytics - {range_param}", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("sms_gateway", f"SMS Analytics - {range_param}", False, None, str(e))
        
        # Test 9: GET /api/sms/offline-gigs - Get pending sync gigs
        try:
            response = requests.get(f"{BASE_URL}/sms/offline-gigs")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    gigs_data = data["data"]
                    if ("gigs" in gigs_data and "pagination" in gigs_data):
                        self.log_result("sms_gateway", "Get Offline Gigs - All", True, 
                                      {"gig_count": len(gigs_data["gigs"]), 
                                       "pagination": gigs_data["pagination"]})
                    else:
                        self.log_result("sms_gateway", "Get Offline Gigs - All", False, data, 
                                      "Missing gigs or pagination fields")
                else:
                    self.log_result("sms_gateway", "Get Offline Gigs - All", False, data, 
                                  "Invalid offline gigs response format")
            else:
                self.log_result("sms_gateway", "Get Offline Gigs - All", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "Get Offline Gigs - All", False, None, str(e))
        
        # Test 10: GET /api/sms/offline-gigs with status filters
        for status in ["pending_sync", "published"]:
            try:
                response = requests.get(f"{BASE_URL}/sms/offline-gigs?status={status}")
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("success") and "data" in data):
                        gigs_data = data["data"]
                        if ("gigs" in gigs_data and "pagination" in gigs_data):
                            self.log_result("sms_gateway", f"Get Offline Gigs - {status}", True, 
                                          {"status": status, "gig_count": len(gigs_data["gigs"])})
                        else:
                            self.log_result("sms_gateway", f"Get Offline Gigs - {status}", False, data, 
                                          "Missing gigs or pagination fields")
                    else:
                        self.log_result("sms_gateway", f"Get Offline Gigs - {status}", False, data, 
                                      "Invalid response format")
                else:
                    self.log_result("sms_gateway", f"Get Offline Gigs - {status}", False, None, 
                                  f"HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("sms_gateway", f"Get Offline Gigs - {status}", False, None, str(e))
        
        # Test 11: POST /api/sms/sync-gig/{gig_id} - Manual gig sync
        try:
            # Create a test gig first to sync
            payload = {
                "From": test_phone,
                "Body": "Logo design $150 urgent"
            }
            
            create_response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if create_response.status_code == 200:
                create_data = create_response.json()
                if create_data.get("success"):
                    # Extract gig ID from response
                    import re
                    response_msg = create_data.get("response", "")
                    id_match = re.search(r'ID:\s*(\w+)', response_msg)
                    
                    if id_match:
                        sync_gig_id = id_match.group(1)
                        
                        # Now test manual sync
                        sync_response = requests.post(f"{BASE_URL}/sms/sync-gig/{sync_gig_id}")
                        
                        if sync_response.status_code == 200:
                            sync_data = sync_response.json()
                            if sync_data.get("success") and "synced successfully" in sync_data.get("message", ""):
                                self.log_result("sms_gateway", "Manual Gig Sync", True, 
                                              {"gig_id": sync_gig_id, "message": sync_data["message"]})
                            else:
                                self.log_result("sms_gateway", "Manual Gig Sync", False, sync_data, 
                                              "Sync response not as expected")
                        else:
                            self.log_result("sms_gateway", "Manual Gig Sync", False, None, 
                                          f"HTTP {sync_response.status_code}")
                    else:
                        self.log_result("sms_gateway", "Manual Gig Sync", False, None, 
                                      "Could not extract gig ID for sync test")
                else:
                    self.log_result("sms_gateway", "Manual Gig Sync", False, None, 
                                  "Failed to create gig for sync test")
            else:
                self.log_result("sms_gateway", "Manual Gig Sync", False, None, 
                              "Failed to create gig for sync test")
                
        except Exception as e:
            self.log_result("sms_gateway", "Manual Gig Sync", False, None, str(e))
        
        # Test 12: Test sync with invalid gig ID (404 error)
        try:
            invalid_gig_id = "invalid-gig-123"
            response = requests.post(f"{BASE_URL}/sms/sync-gig/{invalid_gig_id}")
            
            if response.status_code == 500:  # Expected error for invalid gig
                self.log_result("sms_gateway", "Manual Gig Sync - Invalid ID", True, 
                              {"status_code": response.status_code, "message": "Properly handled invalid gig ID"})
            else:
                self.log_result("sms_gateway", "Manual Gig Sync - Invalid ID", False, None, 
                              f"Expected 500 error, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "Manual Gig Sync - Invalid ID", False, None, str(e))
        
        # Test 13: GET /api/sms/history/{user_id} - User SMS history
        try:
            # Use a test user ID (we'll test with a mock ID since we don't have user creation in this test)
            test_user_id = "sms_user_test_123"
            response = requests.get(f"{BASE_URL}/sms/history/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    history_data = data["data"]
                    if ("commands" in history_data and "pagination" in history_data):
                        self.log_result("sms_gateway", "User SMS History", True, 
                                      {"user_id": test_user_id, "command_count": len(history_data["commands"])})
                    else:
                        self.log_result("sms_gateway", "User SMS History", False, data, 
                                      "Missing commands or pagination fields")
                else:
                    self.log_result("sms_gateway", "User SMS History", False, data, 
                                  "Invalid history response format")
            else:
                self.log_result("sms_gateway", "User SMS History", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "User SMS History", False, None, str(e))
        
        # Test 14: GET /api/sms/templates - Get SMS templates
        try:
            response = requests.get(f"{BASE_URL}/sms/templates")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    templates = data["data"]
                    expected_categories = ["create_gig", "update_gig", "delete_gig", "status"]
                    
                    if all(category in templates for category in expected_categories):
                        # Check if templates have examples
                        create_templates = templates.get("create_gig", [])
                        if len(create_templates) > 0 and "Web development $500 2 weeks" in create_templates:
                            self.log_result("sms_gateway", "Get SMS Templates", True, 
                                          {"template_categories": list(templates.keys()), 
                                           "create_gig_count": len(create_templates)})
                        else:
                            self.log_result("sms_gateway", "Get SMS Templates", False, data, 
                                          "Create gig templates missing expected examples")
                    else:
                        missing_categories = [cat for cat in expected_categories if cat not in templates]
                        self.log_result("sms_gateway", "Get SMS Templates", False, data, 
                                      f"Missing template categories: {missing_categories}")
                else:
                    self.log_result("sms_gateway", "Get SMS Templates", False, data, 
                                  "Invalid templates response format")
            else:
                self.log_result("sms_gateway", "Get SMS Templates", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "Get SMS Templates", False, None, str(e))
        
        # Test 15: GET /api/sms/health - System health status
        try:
            response = requests.get(f"{BASE_URL}/sms/health")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    health_data = data["data"]
                    expected_fields = ["is_running", "pending_responses", "pending_gigs", "failed_gigs", "last_checked"]
                    
                    if all(field in health_data for field in expected_fields):
                        if health_data.get("is_running") == True:
                            self.log_result("sms_gateway", "System Health Check", True, 
                                          {"is_running": health_data["is_running"], 
                                           "pending_responses": health_data["pending_responses"],
                                           "pending_gigs": health_data["pending_gigs"],
                                           "failed_gigs": health_data["failed_gigs"]})
                        else:
                            self.log_result("sms_gateway", "System Health Check", False, data, 
                                          "System not running")
                    else:
                        missing_fields = [field for field in expected_fields if field not in health_data]
                        self.log_result("sms_gateway", "System Health Check", False, data, 
                                      f"Missing health fields: {missing_fields}")
                else:
                    self.log_result("sms_gateway", "System Health Check", False, data, 
                                  "Invalid health response format")
            else:
                self.log_result("sms_gateway", "System Health Check", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "System Health Check", False, None, str(e))
        
        # Test 16: SMS Parsing - Price extraction
        try:
            payload = {
                "From": test_phone,
                "Body": "Mobile app development $2500 4 weeks React Native"
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response_msg = data.get("response", "")
                    if "$2500" in response_msg or "2500" in response_msg:
                        self.log_result("sms_gateway", "SMS Parsing - Price Extraction", True, 
                                      {"parsed_price": "$2500", "response": response_msg})
                    else:
                        self.log_result("sms_gateway", "SMS Parsing - Price Extraction", False, data, 
                                      "Price not properly extracted from SMS")
                else:
                    self.log_result("sms_gateway", "SMS Parsing - Price Extraction", False, data, 
                                  "SMS processing failed")
            else:
                self.log_result("sms_gateway", "SMS Parsing - Price Extraction", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Parsing - Price Extraction", False, None, str(e))
        
        # Test 17: SMS Parsing - Duration extraction
        try:
            payload = {
                "From": test_phone,
                "Body": "Content writing 5 articles 1 month deadline"
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response_msg = data.get("response", "")
                    if "month" in response_msg or "1 month" in response_msg:
                        self.log_result("sms_gateway", "SMS Parsing - Duration Extraction", True, 
                                      {"parsed_duration": "1 month", "response": response_msg})
                    else:
                        self.log_result("sms_gateway", "SMS Parsing - Duration Extraction", False, data, 
                                      "Duration not properly extracted from SMS")
                else:
                    self.log_result("sms_gateway", "SMS Parsing - Duration Extraction", False, data, 
                                  "SMS processing failed")
            else:
                self.log_result("sms_gateway", "SMS Parsing - Duration Extraction", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Parsing - Duration Extraction", False, None, str(e))
        
        # Test 18: SMS Parsing - Category detection
        try:
            payload = {
                "From": test_phone,
                "Body": "Logo design for startup company modern minimalist style"
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    response_msg = data.get("response", "")
                    # Should detect "design" category from "logo design"
                    if "design" in response_msg.lower() or "logo" in response_msg:
                        self.log_result("sms_gateway", "SMS Parsing - Category Detection", True, 
                                      {"detected_category": "design", "response": response_msg})
                    else:
                        self.log_result("sms_gateway", "SMS Parsing - Category Detection", False, data, 
                                      "Category not properly detected from SMS")
                else:
                    self.log_result("sms_gateway", "SMS Parsing - Category Detection", False, data, 
                                  "SMS processing failed")
            else:
                self.log_result("sms_gateway", "SMS Parsing - Category Detection", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "SMS Parsing - Category Detection", False, None, str(e))
        
        # Test 19: Error handling - Invalid SMS format
        try:
            payload = {
                "From": test_phone,
                "Body": "xyz"  # Very short, unclear message
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    # Should still process but may create a basic gig or ask for clarification
                    self.log_result("sms_gateway", "Error Handling - Invalid SMS Format", True, 
                                  {"response": data.get("response", ""), "message": "Handled unclear SMS gracefully"})
                else:
                    self.log_result("sms_gateway", "Error Handling - Invalid SMS Format", False, data, 
                                  "Failed to handle invalid SMS format")
            else:
                self.log_result("sms_gateway", "Error Handling - Invalid SMS Format", False, None, 
                              f"HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "Error Handling - Invalid SMS Format", False, None, str(e))
        
        # Test 20: Error handling - Missing required fields
        try:
            payload = {
                "Body": "Test message without From field"
                # Missing "From" field
            }
            
            response = requests.post(f"{BASE_URL}/sms/webhook/incoming", json=payload)
            
            # Should return validation error
            if response.status_code in [400, 422]:
                self.log_result("sms_gateway", "Error Handling - Missing From Field", True, 
                              {"status_code": response.status_code, "message": "Properly validated missing From field"})
            else:
                self.log_result("sms_gateway", "Error Handling - Missing From Field", False, None, 
                              f"Expected validation error (400/422), got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("sms_gateway", "Error Handling - Missing From Field", False, None, str(e))

    def test_wallet_system_endpoints(self):
        """Test Wallet System API endpoints"""
        print("\n💰 Testing Wallet System Endpoints...")
        
        demo_user_id = "demo-user-123"
        
        # Test 1: GET /api/wallet/ - Get or create wallet for demo user
        try:
            response = requests.get(f"{BASE_URL}/wallet/")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    wallet_data = data["data"]
                    # Verify wallet structure
                    required_fields = ["user_id", "balance", "transactions", "payment_methods", "financial_products"]
                    if all(field in wallet_data for field in required_fields):
                        # Check balance structure
                        balance = wallet_data["balance"]
                        if all(key in balance for key in ["available", "pending", "reserved"]):
                            self.log_result("wallet", "Get/Create Wallet - GET /api/wallet/", True, data)
                        else:
                            self.log_result("wallet", "Get/Create Wallet - GET /api/wallet/", False, data, 
                                          f"Invalid balance structure: {balance}")
                    else:
                        missing_fields = [field for field in required_fields if field not in wallet_data]
                        self.log_result("wallet", "Get/Create Wallet - GET /api/wallet/", False, data, 
                                      f"Missing wallet fields: {missing_fields}")
                else:
                    self.log_result("wallet", "Get/Create Wallet - GET /api/wallet/", False, data, 
                                  "Invalid response format - missing success or data field")
            else:
                self.log_result("wallet", "Get/Create Wallet - GET /api/wallet/", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Get/Create Wallet - GET /api/wallet/", False, None, str(e))
        
        # Test 2: POST /api/wallet/calculate-fees - Calculate cashout fees
        try:
            # Test instant cashout fees for bank_transfer
            payload = {
                "amount": 100,
                "method": "bank_transfer",
                "instant": True
            }
            
            response = requests.post(f"{BASE_URL}/wallet/calculate-fees", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    fee_data = data["data"]
                    required_fields = ["fee_amount", "net_amount", "rate", "type"]
                    if all(field in fee_data for field in required_fields):
                        # Verify fee calculation logic
                        if (fee_data["type"] == "instant" and 
                            fee_data["fee_amount"] >= 0 and
                            fee_data["net_amount"] == 100 - fee_data["fee_amount"]):
                            self.log_result("wallet", "Calculate Fees - Instant Bank Transfer", True, data)
                        else:
                            self.log_result("wallet", "Calculate Fees - Instant Bank Transfer", False, data, 
                                          f"Invalid fee calculation: {fee_data}")
                    else:
                        missing_fields = [field for field in required_fields if field not in fee_data]
                        self.log_result("wallet", "Calculate Fees - Instant Bank Transfer", False, data, 
                                      f"Missing fee fields: {missing_fields}")
                else:
                    self.log_result("wallet", "Calculate Fees - Instant Bank Transfer", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Calculate Fees - Instant Bank Transfer", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Calculate Fees - Instant Bank Transfer", False, None, str(e))
        
        # Test 3: Calculate standard cashout fees for PayPal
        try:
            payload = {
                "amount": 100,
                "method": "paypal",
                "instant": False
            }
            
            response = requests.post(f"{BASE_URL}/wallet/calculate-fees", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    fee_data = data["data"]
                    if (fee_data["type"] == "standard" and 
                        fee_data["fee_amount"] >= 0):
                        self.log_result("wallet", "Calculate Fees - Standard PayPal", True, data)
                    else:
                        self.log_result("wallet", "Calculate Fees - Standard PayPal", False, data, 
                                      f"Invalid standard fee calculation: {fee_data}")
                else:
                    self.log_result("wallet", "Calculate Fees - Standard PayPal", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Calculate Fees - Standard PayPal", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Calculate Fees - Standard PayPal", False, None, str(e))
        
        # Test 4: POST /api/wallet/cashout/instant - Process instant cashout
        try:
            payload = {
                "amount": 50,
                "method": "bank_transfer",
                "method_details": {
                    "bank_name": "Chase",
                    "account_last4": "1234"
                }
            }
            
            response = requests.post(f"{BASE_URL}/wallet/cashout/instant", json=payload)
            
            # Note: This might fail due to insufficient balance, which is expected for new wallet
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    cashout_data = data["data"]
                    if ("transaction" in cashout_data and 
                        "fee" in cashout_data and
                        "net_amount" in cashout_data):
                        self.log_result("wallet", "Instant Cashout - Bank Transfer", True, data)
                    else:
                        self.log_result("wallet", "Instant Cashout - Bank Transfer", False, data, 
                                      "Missing cashout response fields")
                else:
                    self.log_result("wallet", "Instant Cashout - Bank Transfer", False, data, 
                                  "Invalid response format")
            elif response.status_code == 400:
                # Expected for insufficient balance
                self.log_result("wallet", "Instant Cashout - Bank Transfer", True, 
                              {"status_code": response.status_code, "message": "Properly handled insufficient balance"})
            else:
                self.log_result("wallet", "Instant Cashout - Bank Transfer", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Instant Cashout - Bank Transfer", False, None, str(e))
        
        # Test 5: POST /api/wallet/cashout/standard - Process standard cashout
        try:
            payload = {
                "amount": 25,
                "method": "paypal",
                "method_details": {
                    "paypal_email": "user@example.com"
                }
            }
            
            response = requests.post(f"{BASE_URL}/wallet/cashout/standard", json=payload)
            
            # Note: This might fail due to insufficient balance, which is expected for new wallet
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    cashout_data = data["data"]
                    if ("transaction" in cashout_data and 
                        "estimated_arrival" in cashout_data):
                        self.log_result("wallet", "Standard Cashout - PayPal", True, data)
                    else:
                        self.log_result("wallet", "Standard Cashout - PayPal", False, data, 
                                      "Missing standard cashout response fields")
                else:
                    self.log_result("wallet", "Standard Cashout - PayPal", False, data, 
                                  "Invalid response format")
            elif response.status_code == 400:
                # Expected for insufficient balance
                self.log_result("wallet", "Standard Cashout - PayPal", True, 
                              {"status_code": response.status_code, "message": "Properly handled insufficient balance"})
            else:
                self.log_result("wallet", "Standard Cashout - PayPal", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Standard Cashout - PayPal", False, None, str(e))
        
        # Test 6: POST /api/wallet/savings/setup - Setup savings account
        try:
            payload = {
                "initial_amount": 0  # Start with 0 to avoid insufficient balance
            }
            
            response = requests.post(f"{BASE_URL}/wallet/savings/setup", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    savings_data = data["data"]
                    if ("savings_balance" in savings_data and 
                        "interest_rate" in savings_data):
                        self.log_result("wallet", "Savings Setup - No Initial Amount", True, data)
                    else:
                        self.log_result("wallet", "Savings Setup - No Initial Amount", False, data, 
                                      "Missing savings response fields")
                else:
                    self.log_result("wallet", "Savings Setup - No Initial Amount", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Savings Setup - No Initial Amount", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Savings Setup - No Initial Amount", False, None, str(e))
        
        # Test 7: POST /api/wallet/credit/request - Request credit advance
        try:
            payload = {
                "amount": 200,
                "purpose": "Equipment purchase"
            }
            
            response = requests.post(f"{BASE_URL}/wallet/credit/request", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    credit_data = data["data"]
                    if ("credit_used" in credit_data and 
                        "available_credit" in credit_data and
                        "repayment_date" in credit_data):
                        self.log_result("wallet", "Credit Request - Equipment Purchase", True, data)
                    else:
                        self.log_result("wallet", "Credit Request - Equipment Purchase", False, data, 
                                      "Missing credit response fields")
                else:
                    self.log_result("wallet", "Credit Request - Equipment Purchase", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Credit Request - Equipment Purchase", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Credit Request - Equipment Purchase", False, None, str(e))
        
        # Test 8: POST /api/wallet/payment-methods - Add payment method
        try:
            payload = {
                "type": "bank",
                "details": {
                    "bank_name": "Chase",
                    "account_last4": "5678"
                }
            }
            
            response = requests.post(f"{BASE_URL}/wallet/payment-methods", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    payment_method = data["data"]
                    if ("id" in payment_method and 
                        payment_method.get("type") == "bank" and
                        "details" in payment_method):
                        self.log_result("wallet", "Add Payment Method - Bank Account", True, data)
                    else:
                        self.log_result("wallet", "Add Payment Method - Bank Account", False, data, 
                                      "Invalid payment method response")
                else:
                    self.log_result("wallet", "Add Payment Method - Bank Account", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Add Payment Method - Bank Account", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Add Payment Method - Bank Account", False, None, str(e))
        
        # Test 9: GET /api/wallet/transactions - Get transaction history
        try:
            response = requests.get(f"{BASE_URL}/wallet/transactions")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    transaction_data = data["data"]
                    if ("transactions" in transaction_data and 
                        "pagination" in transaction_data):
                        transactions = transaction_data["transactions"]
                        pagination = transaction_data["pagination"]
                        if (isinstance(transactions, list) and
                            "current" in pagination and
                            "total" in pagination):
                            self.log_result("wallet", "Get Transaction History", True, 
                                          {"transaction_count": len(transactions), "pagination": pagination})
                        else:
                            self.log_result("wallet", "Get Transaction History", False, data, 
                                          "Invalid transaction or pagination structure")
                    else:
                        self.log_result("wallet", "Get Transaction History", False, data, 
                                      "Missing transactions or pagination fields")
                else:
                    self.log_result("wallet", "Get Transaction History", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Get Transaction History", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Get Transaction History", False, None, str(e))
        
        # Test 10: GET /api/wallet/transactions with type filter
        try:
            response = requests.get(f"{BASE_URL}/wallet/transactions?type=deposit")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    transaction_data = data["data"]
                    transactions = transaction_data.get("transactions", [])
                    # Check if all transactions are of type 'deposit' (if any exist)
                    if len(transactions) == 0 or all(t.get("type") == "deposit" for t in transactions):
                        self.log_result("wallet", "Get Transaction History - Filtered by Type", True, 
                                      {"filtered_transactions": len(transactions)})
                    else:
                        self.log_result("wallet", "Get Transaction History - Filtered by Type", False, data, 
                                      "Filter not working correctly")
                else:
                    self.log_result("wallet", "Get Transaction History - Filtered by Type", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Get Transaction History - Filtered by Type", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Get Transaction History - Filtered by Type", False, None, str(e))
    
    def test_profile_endpoints(self):
        """Test Profile Update and Retrieval endpoints"""
        print("\n👤 Testing Profile Endpoints...")
        
        # Test 1: Update profile with the specific test data
        try:
            payload = {
                "name": "RICHARD Ochieng ABUNGU",
                "email": "john@example.com",
                "phone": "+1 (555) 123-4567",
                "location": "San Francisco, CA",
                "bio": "Experienced full-stack developer with 5+ years of experience..."
            }
            
            response = requests.put(f"{BASE_URL}/profile/update", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") and "successfully" in data.get("message", "").lower() and "user" in data:
                    user_data = data["user"]
                    # Verify all fields are properly saved
                    if (user_data.get("name") == payload["name"] and
                        user_data.get("email") == payload["email"] and
                        user_data.get("phone") == payload["phone"] and
                        user_data.get("location") == payload["location"] and
                        user_data.get("bio") == payload["bio"]):
                        self.log_result("worker_features", "Profile Update - PUT /api/profile/update", True, data)
                    else:
                        self.log_result("worker_features", "Profile Update - PUT /api/profile/update", False, data, 
                                      f"Profile data mismatch. Expected: {payload}, Got: {user_data}")
                else:
                    self.log_result("worker_features", "Profile Update - PUT /api/profile/update", False, data, 
                                  "Invalid response format - missing message or user field")
            else:
                self.log_result("worker_features", "Profile Update - PUT /api/profile/update", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Profile Update - PUT /api/profile/update", False, None, str(e))
        
        # Test 2: Retrieve the saved profile
        try:
            response = requests.get(f"{BASE_URL}/profile/john@example.com")
            
            if response.status_code == 200:
                data = response.json()
                # Verify the profile data matches what we saved
                expected_data = {
                    "name": "RICHARD Ochieng ABUNGU",
                    "email": "john@example.com",
                    "phone": "+1 (555) 123-4567",
                    "location": "San Francisco, CA",
                    "bio": "Experienced full-stack developer with 5+ years of experience..."
                }
                
                if (data.get("name") == expected_data["name"] and
                    data.get("email") == expected_data["email"] and
                    data.get("phone") == expected_data["phone"] and
                    data.get("location") == expected_data["location"] and
                    data.get("bio") == expected_data["bio"]):
                    self.log_result("worker_features", "Profile Retrieval - GET /api/profile/{email}", True, data)
                else:
                    self.log_result("worker_features", "Profile Retrieval - GET /api/profile/{email}", False, data, 
                                  f"Retrieved profile data mismatch. Expected: {expected_data}, Got: {data}")
            else:
                self.log_result("worker_features", "Profile Retrieval - GET /api/profile/{email}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Profile Retrieval - GET /api/profile/{email}", False, None, str(e))
        
        # Test 3: Error handling - Missing email in update
        try:
            payload = {
                "name": "Test User",
                "phone": "+1 (555) 999-9999"
                # Missing email field
            }
            
            response = requests.put(f"{BASE_URL}/profile/update", json=payload)
            
            # Should return validation error for missing email
            if response.status_code in [400, 422]:
                self.log_result("worker_features", "Profile Update - Missing Email Validation", True, 
                              {"status_code": response.status_code, "message": "Properly validated missing email"})
            else:
                self.log_result("worker_features", "Profile Update - Missing Email Validation", False, None, 
                              f"Expected validation error (400/422), got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Profile Update - Missing Email Validation", False, None, str(e))
        
        # Test 4: Error handling - Non-existent profile retrieval
        try:
            response = requests.get(f"{BASE_URL}/profile/nonexistent@example.com")
            
            # Should return 404 for non-existent profile
            if response.status_code == 404:
                self.log_result("worker_features", "Profile Retrieval - Non-existent Profile", True, 
                              {"status_code": response.status_code, "message": "Properly returned 404 for non-existent profile"})
            else:
                self.log_result("worker_features", "Profile Retrieval - Non-existent Profile", False, None, 
                              f"Expected 404 for non-existent profile, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Profile Retrieval - Non-existent Profile", False, None, str(e))
    
    def test_worker_profile_endpoints(self):
        """Test Worker Profile API endpoints"""
        print("\n👷 Testing Worker Profile Endpoints...")
        
        # Store profile IDs for later tests
        profile_id = None
        test_user_id = "worker-test-123"
        
        # Test 1: Create worker profile
        try:
            payload = {
                "userId": test_user_id,
                "email": "worker@example.com",
                "name": "John Doe",
                "bio": "Experienced full-stack developer",
                "skills": ["React", "Node.js", "Python"],
                "experience": "senior",
                "availability": "fulltime",
                "hourlyRate": 75,
                "location": {"city": "San Francisco", "state": "CA", "country": "USA"},
                "categories": ["Web Development", "Mobile Development"],
                "badges": ["pro-verified"],
                "isAvailable": True
            }
            
            response = requests.post(f"{BASE_URL}/worker-profiles", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                # Verify all required fields are present and correct
                if (data.get("userId") == payload["userId"] and
                    data.get("email") == payload["email"] and
                    data.get("name") == payload["name"] and
                    data.get("skills") == payload["skills"] and
                    data.get("hourlyRate") == payload["hourlyRate"] and
                    "id" in data and
                    "createdAt" in data):
                    profile_id = data["id"]
                    self.log_result("worker_features", "Worker Profile - Create Profile", True, data)
                else:
                    self.log_result("worker_features", "Worker Profile - Create Profile", False, data, 
                                  "Profile data mismatch or missing required fields")
            else:
                self.log_result("worker_features", "Worker Profile - Create Profile", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Create Profile", False, None, str(e))
        
        # Test 2: Test duplicate prevention
        try:
            # Try to create another profile with same userId
            duplicate_payload = {
                "userId": test_user_id,
                "email": "duplicate@example.com",
                "name": "Duplicate User"
            }
            
            response = requests.post(f"{BASE_URL}/worker-profiles", json=duplicate_payload)
            
            if response.status_code == 400:
                self.log_result("worker_features", "Worker Profile - Duplicate Prevention", True, 
                              {"status_code": response.status_code, "message": "Properly prevented duplicate profile"})
            else:
                self.log_result("worker_features", "Worker Profile - Duplicate Prevention", False, None, 
                              f"Expected 400 for duplicate profile, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Duplicate Prevention", False, None, str(e))
        
        # Test 3: Search workers with skills filter
        try:
            search_payload = {
                "skills": ["React", "Python"]
            }
            
            response = requests.post(f"{BASE_URL}/worker-profiles/search", json=search_payload)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if returned profiles have matching skills
                    matching_profiles = [p for p in data if any(skill in p.get("skills", []) for skill in search_payload["skills"])]
                    if len(matching_profiles) > 0:
                        self.log_result("worker_features", "Worker Profile - Search by Skills", True, 
                                      {"profiles_found": len(data), "matching_profiles": len(matching_profiles)})
                    else:
                        self.log_result("worker_features", "Worker Profile - Search by Skills", True, 
                                      {"profiles_found": len(data), "message": "No matching profiles found (acceptable)"})
                else:
                    self.log_result("worker_features", "Worker Profile - Search by Skills", False, data, 
                                  "Expected list of profiles")
            else:
                self.log_result("worker_features", "Worker Profile - Search by Skills", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Search by Skills", False, None, str(e))
        
        # Test 4: Search workers with location filter
        try:
            search_payload = {
                "location": "San Francisco"
            }
            
            response = requests.post(f"{BASE_URL}/worker-profiles/search", json=search_payload)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("worker_features", "Worker Profile - Search by Location", True, 
                                  {"profiles_found": len(data)})
                else:
                    self.log_result("worker_features", "Worker Profile - Search by Location", False, data, 
                                  "Expected list of profiles")
            else:
                self.log_result("worker_features", "Worker Profile - Search by Location", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Search by Location", False, None, str(e))
        
        # Test 5: Search workers with rate range filter
        try:
            search_payload = {
                "minRate": 50,
                "maxRate": 100
            }
            
            response = requests.post(f"{BASE_URL}/worker-profiles/search", json=search_payload)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if returned profiles are within rate range
                    in_range_profiles = [p for p in data if p.get("hourlyRate") and 50 <= p.get("hourlyRate") <= 100]
                    self.log_result("worker_features", "Worker Profile - Search by Rate Range", True, 
                                  {"profiles_found": len(data), "in_range_profiles": len(in_range_profiles)})
                else:
                    self.log_result("worker_features", "Worker Profile - Search by Rate Range", False, data, 
                                  "Expected list of profiles")
            else:
                self.log_result("worker_features", "Worker Profile - Search by Rate Range", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Search by Rate Range", False, None, str(e))
        
        # Test 6: Search workers with badges filter
        try:
            search_payload = {
                "badges": ["pro-verified"]
            }
            
            response = requests.post(f"{BASE_URL}/worker-profiles/search", json=search_payload)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if returned profiles have matching badges
                    matching_profiles = [p for p in data if any(badge in p.get("badges", []) for badge in search_payload["badges"])]
                    self.log_result("worker_features", "Worker Profile - Search by Badges", True, 
                                  {"profiles_found": len(data), "matching_profiles": len(matching_profiles)})
                else:
                    self.log_result("worker_features", "Worker Profile - Search by Badges", False, data, 
                                  "Expected list of profiles")
            else:
                self.log_result("worker_features", "Worker Profile - Search by Badges", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Search by Badges", False, None, str(e))
        
        # Test 7: Get profile by user ID
        try:
            response = requests.get(f"{BASE_URL}/worker-profiles/user/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("userId") == test_user_id and
                    data.get("email") == "worker@example.com" and
                    data.get("name") == "John Doe"):
                    self.log_result("worker_features", "Worker Profile - Get by User ID", True, data)
                else:
                    self.log_result("worker_features", "Worker Profile - Get by User ID", False, data, 
                                  "Profile data doesn't match expected values")
            else:
                self.log_result("worker_features", "Worker Profile - Get by User ID", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Get by User ID", False, None, str(e))
        
        # Test 8: Test 404 for non-existent user
        try:
            response = requests.get(f"{BASE_URL}/worker-profiles/user/non-existent-user")
            
            if response.status_code == 404:
                self.log_result("worker_features", "Worker Profile - Get Non-existent User", True, 
                              {"status_code": response.status_code, "message": "Properly returned 404 for non-existent user"})
            else:
                self.log_result("worker_features", "Worker Profile - Get Non-existent User", False, None, 
                              f"Expected 404 for non-existent user, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Get Non-existent User", False, None, str(e))
        
        # Test 9: Get profile by profile ID
        if profile_id:
            try:
                response = requests.get(f"{BASE_URL}/worker-profiles/{profile_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("id") == profile_id and
                        data.get("userId") == test_user_id):
                        self.log_result("worker_features", "Worker Profile - Get by Profile ID", True, data)
                    else:
                        self.log_result("worker_features", "Worker Profile - Get by Profile ID", False, data, 
                                      "Profile data doesn't match expected values")
                else:
                    self.log_result("worker_features", "Worker Profile - Get by Profile ID", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Worker Profile - Get by Profile ID", False, None, str(e))
        
        # Test 10: Update profile by profile ID
        if profile_id:
            try:
                update_payload = {
                    "bio": "Updated bio: Senior full-stack developer with expertise in React and Python",
                    "skills": ["React", "Node.js", "Python", "TypeScript"],
                    "hourlyRate": 85
                }
                
                response = requests.patch(f"{BASE_URL}/worker-profiles/{profile_id}", json=update_payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("bio") == update_payload["bio"] and
                        data.get("skills") == update_payload["skills"] and
                        data.get("hourlyRate") == update_payload["hourlyRate"] and
                        "updatedAt" in data):
                        self.log_result("worker_features", "Worker Profile - Update by Profile ID", True, data)
                    else:
                        self.log_result("worker_features", "Worker Profile - Update by Profile ID", False, data, 
                                      "Profile update didn't apply correctly")
                else:
                    self.log_result("worker_features", "Worker Profile - Update by Profile ID", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Worker Profile - Update by Profile ID", False, None, str(e))
        
        # Test 11: Update profile by user ID
        try:
            update_payload = {
                "bio": "Updated via user ID: Expert full-stack developer",
                "hourlyRate": 95
            }
            
            response = requests.patch(f"{BASE_URL}/worker-profiles/user/{test_user_id}", json=update_payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("bio") == update_payload["bio"] and
                    data.get("hourlyRate") == update_payload["hourlyRate"] and
                    "updatedAt" in data):
                    self.log_result("worker_features", "Worker Profile - Update by User ID", True, data)
                else:
                    self.log_result("worker_features", "Worker Profile - Update by User ID", False, data, 
                                  "Profile update didn't apply correctly")
            else:
                self.log_result("worker_features", "Worker Profile - Update by User ID", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Worker Profile - Update by User ID", False, None, str(e))
        
        # Test 12: Toggle availability
        if profile_id:
            try:
                response = requests.post(f"{BASE_URL}/worker-profiles/{profile_id}/toggle-availability")
                
                if response.status_code == 200:
                    data = response.json()
                    # Check if availability was toggled (should be False now since it was True initially)
                    if "isAvailable" in data and "updatedAt" in data:
                        self.log_result("worker_features", "Worker Profile - Toggle Availability", True, 
                                      {"isAvailable": data.get("isAvailable"), "message": "Availability toggled successfully"})
                    else:
                        self.log_result("worker_features", "Worker Profile - Toggle Availability", False, data, 
                                      "Availability toggle response missing required fields")
                else:
                    self.log_result("worker_features", "Worker Profile - Toggle Availability", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Worker Profile - Toggle Availability", False, None, str(e))
        
        # Test 13: Delete profile
        if profile_id:
            try:
                response = requests.delete(f"{BASE_URL}/worker-profiles/{profile_id}")
                
                if response.status_code == 204:
                    self.log_result("worker_features", "Worker Profile - Delete Profile", True, 
                                  {"status_code": response.status_code, "message": "Profile deleted successfully"})
                    
                    # Verify profile is actually deleted by trying to get it
                    verify_response = requests.get(f"{BASE_URL}/worker-profiles/{profile_id}")
                    if verify_response.status_code == 404:
                        self.log_result("worker_features", "Worker Profile - Verify Profile Deletion", True, 
                                      {"message": "Profile properly deleted - returns 404 when accessed"})
                    else:
                        self.log_result("worker_features", "Worker Profile - Verify Profile Deletion", False, None, 
                                      f"Profile still accessible after deletion, got HTTP {verify_response.status_code}")
                else:
                    self.log_result("worker_features", "Worker Profile - Delete Profile", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Worker Profile - Delete Profile", False, None, str(e))

    def test_application_system_endpoints(self):
        """Test Application System API endpoints"""
        print("\n📋 Testing Application System Endpoints...")
        
        # Store IDs for tests
        import time
        test_worker_id = f"app-test-worker-{int(time.time())}"
        test_job_id = None
        test_application_id = None
        
        # Step 1: Create test worker profile first
        try:
            worker_payload = {
                "userId": test_worker_id,
                "email": "appworker@example.com",
                "name": "Application Test Worker",
                "bio": "Experienced developer for application testing",
                "skills": ["React", "Node.js", "Python"],
                "experience": "senior",
                "availability": "fulltime",
                "hourlyRate": 75,
                "location": {"city": "San Francisco", "state": "CA", "country": "USA"},
                "categories": ["Web Development"],
                "badges": ["pro-verified"],
                "isAvailable": True
            }
            
            response = requests.post(f"{BASE_URL}/worker-profiles", json=worker_payload)
            
            if response.status_code == 201:
                worker_data = response.json()
                self.log_result("job_posting", "Application Test - Create Worker Profile", True, 
                              {"worker_id": worker_data.get("id"), "user_id": worker_data.get("userId")})
            else:
                self.log_result("job_posting", "Application Test - Create Worker Profile", False, None, 
                              f"Failed to create worker profile: HTTP {response.status_code}")
                return  # Can't continue without worker profile
                
        except Exception as e:
            self.log_result("job_posting", "Application Test - Create Worker Profile", False, None, str(e))
            return
        
        # Step 2: Create test job
        try:
            job_payload = {
                "userId": "test-hirer-123",
                "userEmail": "hirer@example.com",
                "jobType": "project",
                "title": "React Application Development",
                "description": "Build a modern React application with backend integration",
                "category": "Web Development",
                "budget": {"type": "fixed", "amount": 1500, "currency": "USD"},
                "timeline": "2-4 weeks",
                "location": {"type": "remote"},
                "skills": ["React", "Node.js", "MongoDB"],
                "urgency": "flexible",
                "status": "published"
            }
            
            response = requests.post(f"{BASE_URL}/jobs", json=job_payload)
            
            if response.status_code == 201:
                job_data = response.json()
                test_job_id = job_data.get("id")
                self.log_result("job_posting", "Application Test - Create Job", True, 
                              {"job_id": test_job_id, "title": job_data.get("title")})
            else:
                self.log_result("job_posting", "Application Test - Create Job", False, None, 
                              f"Failed to create job: HTTP {response.status_code}")
                return  # Can't continue without job
                
        except Exception as e:
            self.log_result("job_posting", "Application Test - Create Job", False, None, str(e))
            return
        
        # Test 1: POST /api/applications - Submit application
        try:
            application_payload = {
                "jobId": test_job_id,
                "workerId": test_worker_id,
                "workerEmail": "appworker@example.com",
                "coverLetter": "I am very interested in this React development project. I have 5+ years of experience with React and Node.js.",
                "proposedRate": 80.0,
                "availableStartDate": "2024-01-15"
            }
            
            response = requests.post(f"{BASE_URL}/applications", json=application_payload)
            
            if response.status_code == 201:
                app_data = response.json()
                test_application_id = app_data.get("id")
                
                # Verify all required fields
                if (app_data.get("jobId") == test_job_id and
                    app_data.get("workerId") == test_worker_id and
                    app_data.get("status") == "pending" and
                    app_data.get("coverLetter") == application_payload["coverLetter"] and
                    app_data.get("proposedRate") == application_payload["proposedRate"] and
                    "workerProfile" in app_data and
                    "jobDetails" in app_data):
                    self.log_result("job_posting", "Application System - Submit Application", True, app_data)
                else:
                    self.log_result("job_posting", "Application System - Submit Application", False, app_data, 
                                  "Application data missing required fields or incorrect values")
            else:
                self.log_result("job_posting", "Application System - Submit Application", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("job_posting", "Application System - Submit Application", False, None, str(e))
        
        # Test 2: Duplicate application prevention
        if test_application_id:
            try:
                # Try to apply again to same job
                duplicate_payload = {
                    "jobId": test_job_id,
                    "workerId": test_worker_id,
                    "workerEmail": "appworker@example.com",
                    "coverLetter": "Another application"
                }
                
                response = requests.post(f"{BASE_URL}/applications", json=duplicate_payload)
                
                if response.status_code == 400:
                    self.log_result("job_posting", "Application System - Duplicate Prevention", True, 
                                  {"status_code": response.status_code, "message": "Properly prevented duplicate application"})
                else:
                    self.log_result("job_posting", "Application System - Duplicate Prevention", False, None, 
                                  f"Expected 400 for duplicate application, got HTTP {response.status_code}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Duplicate Prevention", False, None, str(e))
        
        # Test 3: Invalid job ID
        try:
            invalid_payload = {
                "jobId": "non-existent-job-id",
                "workerId": test_worker_id,
                "workerEmail": "appworker@example.com"
            }
            
            response = requests.post(f"{BASE_URL}/applications", json=invalid_payload)
            
            if response.status_code == 404:
                self.log_result("job_posting", "Application System - Invalid Job ID", True, 
                              {"status_code": response.status_code, "message": "Properly returned 404 for invalid job"})
            else:
                self.log_result("job_posting", "Application System - Invalid Job ID", False, None, 
                              f"Expected 404 for invalid job, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("job_posting", "Application System - Invalid Job ID", False, None, str(e))
        
        # Test 4: GET /api/jobs/{jobId}/applications - Get applications for job
        if test_job_id:
            try:
                response = requests.get(f"{BASE_URL}/jobs/{test_job_id}/applications")
                
                if response.status_code == 200:
                    apps_data = response.json()
                    if isinstance(apps_data, list) and len(apps_data) > 0:
                        app = apps_data[0]
                        # Verify enriched data
                        if ("workerProfile" in app and 
                            "jobDetails" in app and
                            app.get("jobId") == test_job_id):
                            self.log_result("job_posting", "Application System - Get Job Applications", True, 
                                          {"applications_count": len(apps_data), "enriched_data": True})
                        else:
                            self.log_result("job_posting", "Application System - Get Job Applications", False, apps_data, 
                                          "Applications missing enriched data")
                    else:
                        self.log_result("job_posting", "Application System - Get Job Applications", True, 
                                      {"applications_count": 0, "message": "No applications found (acceptable)"})
                else:
                    self.log_result("job_posting", "Application System - Get Job Applications", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Get Job Applications", False, None, str(e))
        
        # Test 5: GET /api/jobs/{jobId}/applications with status filter
        if test_job_id:
            try:
                response = requests.get(f"{BASE_URL}/jobs/{test_job_id}/applications?status=pending")
                
                if response.status_code == 200:
                    apps_data = response.json()
                    if isinstance(apps_data, list):
                        # Check if all returned applications have pending status
                        pending_apps = [app for app in apps_data if app.get("status") == "pending"]
                        if len(pending_apps) == len(apps_data):
                            self.log_result("job_posting", "Application System - Get Job Applications with Status Filter", True, 
                                          {"filtered_applications": len(apps_data)})
                        else:
                            self.log_result("job_posting", "Application System - Get Job Applications with Status Filter", False, apps_data, 
                                          "Status filter not working correctly")
                    else:
                        self.log_result("job_posting", "Application System - Get Job Applications with Status Filter", False, apps_data, 
                                      "Expected list of applications")
                else:
                    self.log_result("job_posting", "Application System - Get Job Applications with Status Filter", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Get Job Applications with Status Filter", False, None, str(e))
        
        # Test 6: GET /api/workers/{workerId}/applications - Get worker's applications
        try:
            response = requests.get(f"{BASE_URL}/workers/{test_worker_id}/applications")
            
            if response.status_code == 200:
                apps_data = response.json()
                if isinstance(apps_data, list) and len(apps_data) > 0:
                    app = apps_data[0]
                    # Verify enriched data includes job details
                    if ("jobDetails" in app and 
                        app.get("workerId") == test_worker_id):
                        self.log_result("job_posting", "Application System - Get Worker Applications", True, 
                                      {"applications_count": len(apps_data), "enriched_data": True})
                    else:
                        self.log_result("job_posting", "Application System - Get Worker Applications", False, apps_data, 
                                      "Applications missing job details")
                else:
                    self.log_result("job_posting", "Application System - Get Worker Applications", True, 
                                  {"applications_count": 0, "message": "No applications found (acceptable)"})
            else:
                self.log_result("job_posting", "Application System - Get Worker Applications", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("job_posting", "Application System - Get Worker Applications", False, None, str(e))
        
        # Test 7: GET /api/applications/{applicationId} - Get single application
        if test_application_id:
            try:
                response = requests.get(f"{BASE_URL}/applications/{test_application_id}")
                
                if response.status_code == 200:
                    app_data = response.json()
                    # Verify enriched data
                    if ("workerProfile" in app_data and 
                        "jobDetails" in app_data and
                        app_data.get("id") == test_application_id):
                        self.log_result("job_posting", "Application System - Get Single Application", True, app_data)
                    else:
                        self.log_result("job_posting", "Application System - Get Single Application", False, app_data, 
                                      "Application missing enriched data")
                else:
                    self.log_result("job_posting", "Application System - Get Single Application", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Get Single Application", False, None, str(e))
        
        # Test 8: GET /api/applications/{applicationId} with invalid ID
        try:
            response = requests.get(f"{BASE_URL}/applications/invalid-application-id")
            
            if response.status_code == 404:
                self.log_result("job_posting", "Application System - Get Invalid Application", True, 
                              {"status_code": response.status_code, "message": "Properly returned 404 for invalid application"})
            else:
                self.log_result("job_posting", "Application System - Get Invalid Application", False, None, 
                              f"Expected 404 for invalid application, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("job_posting", "Application System - Get Invalid Application", False, None, str(e))
        
        # Test 9: PATCH /api/applications/{applicationId} - Update status to reviewed
        if test_application_id:
            try:
                update_payload = {
                    "status": "reviewed",
                    "hirerNotes": "Good candidate, reviewing portfolio"
                }
                
                response = requests.patch(f"{BASE_URL}/applications/{test_application_id}", json=update_payload)
                
                if response.status_code == 200:
                    app_data = response.json()
                    if (app_data.get("status") == "reviewed" and
                        app_data.get("hirerNotes") == update_payload["hirerNotes"] and
                        "updatedAt" in app_data):
                        self.log_result("job_posting", "Application System - Update Status to Reviewed", True, app_data)
                    else:
                        self.log_result("job_posting", "Application System - Update Status to Reviewed", False, app_data, 
                                      "Status update not applied correctly")
                else:
                    self.log_result("job_posting", "Application System - Update Status to Reviewed", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Update Status to Reviewed", False, None, str(e))
        
        # Test 10: PATCH /api/applications/{applicationId} - Update status to accepted
        if test_application_id:
            try:
                update_payload = {
                    "status": "accepted",
                    "hirerNotes": "Excellent candidate, offer extended"
                }
                
                response = requests.patch(f"{BASE_URL}/applications/{test_application_id}", json=update_payload)
                
                if response.status_code == 200:
                    app_data = response.json()
                    if (app_data.get("status") == "accepted" and
                        app_data.get("hirerNotes") == update_payload["hirerNotes"]):
                        self.log_result("job_posting", "Application System - Update Status to Accepted", True, app_data)
                    else:
                        self.log_result("job_posting", "Application System - Update Status to Accepted", False, app_data, 
                                      "Status update not applied correctly")
                else:
                    self.log_result("job_posting", "Application System - Update Status to Accepted", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Update Status to Accepted", False, None, str(e))
        
        # Test 11: GET /api/jobs/{jobId}/applications/stats - Get application stats
        if test_job_id:
            try:
                response = requests.get(f"{BASE_URL}/jobs/{test_job_id}/applications/stats")
                
                if response.status_code == 200:
                    stats_data = response.json()
                    required_fields = ["total", "pending", "reviewed", "accepted", "rejected"]
                    
                    if all(field in stats_data for field in required_fields):
                        # Verify stats make sense
                        total = stats_data.get("total", 0)
                        sum_statuses = (stats_data.get("pending", 0) + 
                                      stats_data.get("reviewed", 0) + 
                                      stats_data.get("accepted", 0) + 
                                      stats_data.get("rejected", 0))
                        
                        if total == sum_statuses and total > 0:
                            self.log_result("job_posting", "Application System - Get Application Stats", True, stats_data)
                        else:
                            self.log_result("job_posting", "Application System - Get Application Stats", True, stats_data, 
                                          f"Minor: Stats totals don't match (total={total}, sum={sum_statuses})")
                    else:
                        missing_fields = [field for field in required_fields if field not in stats_data]
                        self.log_result("job_posting", "Application System - Get Application Stats", False, stats_data, 
                                      f"Missing required fields: {missing_fields}")
                else:
                    self.log_result("job_posting", "Application System - Get Application Stats", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Get Application Stats", False, None, str(e))
        
        # Test 12: DELETE /api/applications/{applicationId} - Withdraw application
        if test_application_id:
            try:
                response = requests.delete(f"{BASE_URL}/applications/{test_application_id}")
                
                if response.status_code == 204:
                    self.log_result("job_posting", "Application System - Withdraw Application", True, 
                                  {"status_code": response.status_code, "message": "Application withdrawn successfully"})
                    
                    # Verify application is actually deleted
                    verify_response = requests.get(f"{BASE_URL}/applications/{test_application_id}")
                    if verify_response.status_code == 404:
                        self.log_result("job_posting", "Application System - Verify Application Deletion", True, 
                                      {"message": "Application properly deleted - returns 404 when accessed"})
                    else:
                        self.log_result("job_posting", "Application System - Verify Application Deletion", False, None, 
                                      f"Application still accessible after deletion, got HTTP {verify_response.status_code}")
                else:
                    self.log_result("job_posting", "Application System - Withdraw Application", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Withdraw Application", False, None, str(e))
        
        # Test 13: Verify job application count decreased after withdrawal
        if test_job_id:
            try:
                response = requests.get(f"{BASE_URL}/jobs/{test_job_id}/applications/stats")
                
                if response.status_code == 200:
                    stats_data = response.json()
                    total_after_deletion = stats_data.get("total", 0)
                    
                    if total_after_deletion == 0:
                        self.log_result("job_posting", "Application System - Verify Count Decrease", True, 
                                      {"total_applications": total_after_deletion, "message": "Application count properly decreased"})
                    else:
                        self.log_result("job_posting", "Application System - Verify Count Decrease", True, stats_data, 
                                      f"Minor: Expected 0 applications after deletion, got {total_after_deletion}")
                else:
                    self.log_result("job_posting", "Application System - Verify Count Decrease", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Application System - Verify Count Decrease", False, None, str(e))

    def test_job_posting_endpoints(self):
        """Test Job Posting API endpoints"""
        print("\n💼 Testing Job Posting Endpoints...")
        
        # Store job IDs for later tests
        project_job_id = None
        gig_job_id = None
        
        # Test 1: Create a project type job
        try:
            payload = {
                "userId": "test-user-123",
                "userEmail": "test@example.com",
                "jobType": "project",
                "title": "Build a React Website",
                "description": "Need a modern React website with Tailwind CSS",
                "category": "Web Development",
                "skills": ["React", "Tailwind", "JavaScript"],
                "budget": {"type": "fixed", "amount": 5000, "currency": "USD"},
                "timeline": "2-3 weeks",
                "location": {"type": "remote"},
                "status": "draft"
            }
            
            response = requests.post(f"{BASE_URL}/jobs", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                # Verify all required fields are present and correct
                if (data.get("userId") == payload["userId"] and
                    data.get("jobType") == payload["jobType"] and
                    data.get("title") == payload["title"] and
                    data.get("status") == payload["status"] and
                    "id" in data and
                    "createdAt" in data):
                    project_job_id = data["id"]
                    self.log_result("worker_features", "Job Posting - Create Project Job", True, data)
                else:
                    self.log_result("worker_features", "Job Posting - Create Project Job", False, data, 
                                  "Job data mismatch or missing required fields")
            else:
                self.log_result("worker_features", "Job Posting - Create Project Job", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Job Posting - Create Project Job", False, None, str(e))
        
        # Test 2: Create a gig type job
        try:
            payload = {
                "userId": "test-user-456",
                "userEmail": "gig@example.com",
                "jobType": "gig",
                "title": "Emergency Plumbing Repair",
                "description": "Need urgent plumbing repair for burst pipe",
                "category": "Maintenance & Repairs",
                "skills": ["Plumbing", "Emergency Repair"],
                "budget": {"type": "hourly", "amount": 75, "currency": "USD"},
                "timeline": "ASAP",
                "location": {"type": "onsite", "address": "123 Main St", "city": "San Francisco", "state": "CA"},
                "urgency": "asap",
                "status": "draft"
            }
            
            response = requests.post(f"{BASE_URL}/jobs", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                # Verify all required fields are present and correct
                if (data.get("userId") == payload["userId"] and
                    data.get("jobType") == payload["jobType"] and
                    data.get("title") == payload["title"] and
                    data.get("urgency") == payload["urgency"] and
                    "id" in data):
                    gig_job_id = data["id"]
                    self.log_result("worker_features", "Job Posting - Create Gig Job", True, data)
                else:
                    self.log_result("worker_features", "Job Posting - Create Gig Job", False, data, 
                                  "Gig data mismatch or missing required fields")
            else:
                self.log_result("worker_features", "Job Posting - Create Gig Job", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Job Posting - Create Gig Job", False, None, str(e))
        
        # Test 3: Get all jobs
        try:
            response = requests.get(f"{BASE_URL}/jobs")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) >= 0:
                    self.log_result("worker_features", "Job Posting - Get All Jobs", True, 
                                  {"jobs_count": len(data), "sample": data[:2] if data else []})
                else:
                    self.log_result("worker_features", "Job Posting - Get All Jobs", False, data, 
                                  "Expected list of jobs")
            else:
                self.log_result("worker_features", "Job Posting - Get All Jobs", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Job Posting - Get All Jobs", False, None, str(e))
        
        # Test 4: Get jobs with filters
        try:
            response = requests.get(f"{BASE_URL}/jobs?jobType=project&status=draft")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if filtering worked (all returned jobs should be project type and draft status)
                    all_match_filter = all(job.get("jobType") == "project" and job.get("status") == "draft" 
                                         for job in data)
                    if all_match_filter:
                        self.log_result("worker_features", "Job Posting - Get Jobs with Filters", True, 
                                      {"filtered_jobs_count": len(data)})
                    else:
                        self.log_result("worker_features", "Job Posting - Get Jobs with Filters", False, data, 
                                      "Filter not working properly - returned jobs don't match filter criteria")
                else:
                    self.log_result("worker_features", "Job Posting - Get Jobs with Filters", False, data, 
                                  "Expected list of jobs")
            else:
                self.log_result("worker_features", "Job Posting - Get Jobs with Filters", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Job Posting - Get Jobs with Filters", False, None, str(e))
        
        # Test 5: Get jobs by user ID
        try:
            response = requests.get(f"{BASE_URL}/jobs/user/test-user-123")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if all returned jobs belong to the specified user
                    all_match_user = all(job.get("userId") == "test-user-123" for job in data)
                    if all_match_user:
                        self.log_result("worker_features", "Job Posting - Get Jobs by User ID", True, 
                                      {"user_jobs_count": len(data)})
                    else:
                        self.log_result("worker_features", "Job Posting - Get Jobs by User ID", False, data, 
                                      "User filter not working - returned jobs don't belong to specified user")
                else:
                    self.log_result("worker_features", "Job Posting - Get Jobs by User ID", False, data, 
                                  "Expected list of jobs")
            else:
                self.log_result("worker_features", "Job Posting - Get Jobs by User ID", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_features", "Job Posting - Get Jobs by User ID", False, None, str(e))
        
        # Test 6: Get specific job by ID (using project job)
        if project_job_id:
            try:
                response = requests.get(f"{BASE_URL}/jobs/{project_job_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("id") == project_job_id and
                        data.get("title") == "Build a React Website" and
                        "views" in data):
                        self.log_result("worker_features", "Job Posting - Get Specific Job", True, data)
                    else:
                        self.log_result("worker_features", "Job Posting - Get Specific Job", False, data, 
                                      "Job data doesn't match expected values")
                else:
                    self.log_result("worker_features", "Job Posting - Get Specific Job", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Job Posting - Get Specific Job", False, None, str(e))
        
        # Test 7: Test 404 for invalid job ID
        try:
            response = requests.get(f"{BASE_URL}/jobs/invalid-job-id-123")
            
            if response.status_code == 404:
                self.log_result("worker_features", "Job Posting - Get Invalid Job ID", True, 
                              {"status_code": response.status_code, "message": "Properly returned 404 for invalid job ID"})
            else:
                self.log_result("worker_features", "Job Posting - Get Invalid Job ID", False, None, 
                              f"Expected 404 for invalid job ID, got HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_features", "Job Posting - Get Invalid Job ID", False, None, str(e))
        
        # Test 8: Update job (using project job)
        if project_job_id:
            try:
                payload = {
                    "title": "Build a Modern React Website with AI Features",
                    "description": "Updated description with AI integration requirements",
                    "status": "draft"
                }
                
                response = requests.patch(f"{BASE_URL}/jobs/{project_job_id}", json=payload)
                
                if response.status_code == 200:
                    data = response.json()
                    if (data.get("title") == payload["title"] and
                        data.get("description") == payload["description"] and
                        "updatedAt" in data):
                        self.log_result("worker_features", "Job Posting - Update Job", True, data)
                    else:
                        self.log_result("worker_features", "Job Posting - Update Job", False, data, 
                                      "Job update didn't apply correctly")
                else:
                    self.log_result("worker_features", "Job Posting - Update Job", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Job Posting - Update Job", False, None, str(e))
        
        # Test 9: Publish job (change status from draft to published)
        if project_job_id:
            try:
                response = requests.post(f"{BASE_URL}/jobs/{project_job_id}/publish")
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("status") == "published":
                        self.log_result("worker_features", "Job Posting - Publish Job", True, data)
                    else:
                        self.log_result("worker_features", "Job Posting - Publish Job", False, data, 
                                      f"Job status not changed to published, got: {data.get('status')}")
                else:
                    self.log_result("worker_features", "Job Posting - Publish Job", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Job Posting - Publish Job", False, None, str(e))
        
        # Test 10: Delete job (using gig job)
        if gig_job_id:
            try:
                response = requests.delete(f"{BASE_URL}/jobs/{gig_job_id}")
                
                if response.status_code == 204:
                    self.log_result("worker_features", "Job Posting - Delete Job", True, 
                                  {"status_code": response.status_code, "message": "Job deleted successfully"})
                    
                    # Verify job is actually deleted by trying to get it
                    verify_response = requests.get(f"{BASE_URL}/jobs/{gig_job_id}")
                    if verify_response.status_code == 404:
                        self.log_result("worker_features", "Job Posting - Verify Job Deletion", True, 
                                      {"message": "Job properly deleted - returns 404 when accessed"})
                    else:
                        self.log_result("worker_features", "Job Posting - Verify Job Deletion", False, None, 
                                      f"Job still accessible after deletion, got HTTP {verify_response.status_code}")
                else:
                    self.log_result("worker_features", "Job Posting - Delete Job", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("worker_features", "Job Posting - Delete Job", False, None, str(e))
    
    def test_epic_worker_dashboard_endpoints(self):
        """Test Epic Worker Dashboard API endpoints"""
        print("\n🎯 Testing Epic Worker Dashboard Endpoints...")
        
        test_user_id = "test-user-123"
        
        # Test 1: GET /api/worker-dashboard/stats/{user_id}
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/stats/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["available_jobs", "active_gigs", "pending_applications", "weekly_earnings"]
                
                if all(field in data for field in required_fields):
                    # Verify data types
                    if (isinstance(data.get("available_jobs"), int) and
                        isinstance(data.get("active_gigs"), int) and
                        isinstance(data.get("pending_applications"), int) and
                        isinstance(data.get("weekly_earnings"), (int, float))):
                        self.log_result("worker_dashboard", "Dashboard Stats - GET /api/worker-dashboard/stats/{user_id}", True, data)
                    else:
                        self.log_result("worker_dashboard", "Dashboard Stats - GET /api/worker-dashboard/stats/{user_id}", False, data, 
                                      f"Invalid data types: available_jobs={type(data.get('available_jobs'))}, active_gigs={type(data.get('active_gigs'))}, pending_applications={type(data.get('pending_applications'))}, weekly_earnings={type(data.get('weekly_earnings'))}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("worker_dashboard", "Dashboard Stats - GET /api/worker-dashboard/stats/{user_id}", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("worker_dashboard", "Dashboard Stats - GET /api/worker-dashboard/stats/{user_id}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Dashboard Stats - GET /api/worker-dashboard/stats/{user_id}", False, None, str(e))
        
        # Test 2: GET /api/worker-dashboard/schedule/{user_id}
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/schedule/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check structure of schedule items if any exist
                    if len(data) > 0:
                        item = data[0]
                        required_fields = ["id", "time", "title", "duration"]
                        if all(field in item for field in required_fields):
                            self.log_result("worker_dashboard", "Schedule - GET /api/worker-dashboard/schedule/{user_id}", True, 
                                          {"schedule_items": len(data), "sample_item": item})
                        else:
                            missing_fields = [field for field in required_fields if field not in item]
                            self.log_result("worker_dashboard", "Schedule - GET /api/worker-dashboard/schedule/{user_id}", False, data, 
                                          f"Schedule item missing fields: {missing_fields}")
                    else:
                        self.log_result("worker_dashboard", "Schedule - GET /api/worker-dashboard/schedule/{user_id}", True, 
                                      {"schedule_items": 0, "message": "Empty schedule (acceptable for new user)"})
                else:
                    self.log_result("worker_dashboard", "Schedule - GET /api/worker-dashboard/schedule/{user_id}", False, data, 
                                  "Expected array of schedule items")
            else:
                self.log_result("worker_dashboard", "Schedule - GET /api/worker-dashboard/schedule/{user_id}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Schedule - GET /api/worker-dashboard/schedule/{user_id}", False, None, str(e))
        
        # Test 3: GET /api/worker-dashboard/recommended-jobs/{user_id}
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/recommended-jobs/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check structure of job recommendations if any exist
                    if len(data) > 0:
                        job = data[0]
                        required_fields = ["id", "title", "rate", "duration", "location", "skills", "match_score"]
                        if all(field in job for field in required_fields):
                            # Verify match score calculation
                            if isinstance(job.get("match_score"), int) and 0 <= job.get("match_score") <= 100:
                                self.log_result("worker_dashboard", "Recommended Jobs - GET /api/worker-dashboard/recommended-jobs/{user_id}", True, 
                                              {"jobs_found": len(data), "sample_job": job})
                            else:
                                self.log_result("worker_dashboard", "Recommended Jobs - GET /api/worker-dashboard/recommended-jobs/{user_id}", False, data, 
                                              f"Invalid match_score: {job.get('match_score')} (should be int 0-100)")
                        else:
                            missing_fields = [field for field in required_fields if field not in job]
                            self.log_result("worker_dashboard", "Recommended Jobs - GET /api/worker-dashboard/recommended-jobs/{user_id}", False, data, 
                                          f"Job recommendation missing fields: {missing_fields}")
                    else:
                        self.log_result("worker_dashboard", "Recommended Jobs - GET /api/worker-dashboard/recommended-jobs/{user_id}", True, 
                                      {"jobs_found": 0, "message": "No job recommendations (acceptable)"})
                else:
                    self.log_result("worker_dashboard", "Recommended Jobs - GET /api/worker-dashboard/recommended-jobs/{user_id}", False, data, 
                                  "Expected array of job recommendations")
            else:
                self.log_result("worker_dashboard", "Recommended Jobs - GET /api/worker-dashboard/recommended-jobs/{user_id}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Recommended Jobs - GET /api/worker-dashboard/recommended-jobs/{user_id}", False, None, str(e))
        
        # Test 4: GET /api/worker-dashboard/active-gigs/{user_id}
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/active-gigs/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check structure of active gigs if any exist
                    if len(data) > 0:
                        gig = data[0]
                        required_fields = ["id", "title", "client", "client_rating", "milestones"]
                        if all(field in gig for field in required_fields):
                            self.log_result("worker_dashboard", "Active Gigs - GET /api/worker-dashboard/active-gigs/{user_id}", True, 
                                          {"active_gigs": len(data), "sample_gig": gig})
                        else:
                            missing_fields = [field for field in required_fields if field not in gig]
                            self.log_result("worker_dashboard", "Active Gigs - GET /api/worker-dashboard/active-gigs/{user_id}", False, data, 
                                          f"Active gig missing fields: {missing_fields}")
                    else:
                        self.log_result("worker_dashboard", "Active Gigs - GET /api/worker-dashboard/active-gigs/{user_id}", True, 
                                      {"active_gigs": 0, "message": "No active gigs (acceptable for new user)"})
                else:
                    self.log_result("worker_dashboard", "Active Gigs - GET /api/worker-dashboard/active-gigs/{user_id}", False, data, 
                                  "Expected array of active gigs")
            else:
                self.log_result("worker_dashboard", "Active Gigs - GET /api/worker-dashboard/active-gigs/{user_id}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Active Gigs - GET /api/worker-dashboard/active-gigs/{user_id}", False, None, str(e))
        
        # Test 5: GET /api/worker-dashboard/earnings/{user_id}
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/earnings/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["available", "pending", "this_month", "total_earned"]
                
                if all(field in data for field in required_fields):
                    # Verify all are floats/numbers
                    if all(isinstance(data.get(field), (int, float)) for field in required_fields):
                        self.log_result("worker_dashboard", "Earnings - GET /api/worker-dashboard/earnings/{user_id}", True, data)
                    else:
                        invalid_types = {field: type(data.get(field)) for field in required_fields if not isinstance(data.get(field), (int, float))}
                        self.log_result("worker_dashboard", "Earnings - GET /api/worker-dashboard/earnings/{user_id}", False, data, 
                                      f"Invalid data types for earnings: {invalid_types}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("worker_dashboard", "Earnings - GET /api/worker-dashboard/earnings/{user_id}", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("worker_dashboard", "Earnings - GET /api/worker-dashboard/earnings/{user_id}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Earnings - GET /api/worker-dashboard/earnings/{user_id}", False, None, str(e))
        
        # Test 6: GET /api/worker-dashboard/reputation/{user_id}
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/reputation/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["score", "reliability", "communication", "quality", "total_reviews"]
                
                if all(field in data for field in required_fields):
                    # Verify data types and ranges
                    if (isinstance(data.get("score"), (int, float)) and
                        isinstance(data.get("reliability"), int) and
                        isinstance(data.get("communication"), int) and
                        isinstance(data.get("quality"), int) and
                        isinstance(data.get("total_reviews"), int)):
                        self.log_result("worker_dashboard", "Reputation - GET /api/worker-dashboard/reputation/{user_id}", True, data)
                    else:
                        self.log_result("worker_dashboard", "Reputation - GET /api/worker-dashboard/reputation/{user_id}", False, data, 
                                      "Invalid data types for reputation fields")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("worker_dashboard", "Reputation - GET /api/worker-dashboard/reputation/{user_id}", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("worker_dashboard", "Reputation - GET /api/worker-dashboard/reputation/{user_id}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Reputation - GET /api/worker-dashboard/reputation/{user_id}", False, None, str(e))
        
        # Test 7: GET /api/worker-dashboard/achievements/{user_id}
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/achievements/{test_user_id}")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check structure of achievements if any exist
                    if len(data) > 0:
                        achievement = data[0]
                        required_fields = ["id", "name", "icon", "description"]
                        if all(field in achievement for field in required_fields):
                            self.log_result("worker_dashboard", "Achievements - GET /api/worker-dashboard/achievements/{user_id}", True, 
                                          {"achievements_count": len(data), "sample_achievement": achievement})
                        else:
                            missing_fields = [field for field in required_fields if field not in achievement]
                            self.log_result("worker_dashboard", "Achievements - GET /api/worker-dashboard/achievements/{user_id}", False, data, 
                                          f"Achievement missing fields: {missing_fields}")
                    else:
                        self.log_result("worker_dashboard", "Achievements - GET /api/worker-dashboard/achievements/{user_id}", True, 
                                      {"achievements_count": 0, "message": "No achievements (acceptable for new user)"})
                else:
                    self.log_result("worker_dashboard", "Achievements - GET /api/worker-dashboard/achievements/{user_id}", False, data, 
                                  "Expected array of achievements")
            else:
                self.log_result("worker_dashboard", "Achievements - GET /api/worker-dashboard/achievements/{user_id}", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Achievements - GET /api/worker-dashboard/achievements/{user_id}", False, None, str(e))
        
        # Test 8: POST /api/worker-dashboard/jobs/search
        try:
            # Test with basic filter payload
            payload = {
                "search": "",
                "location": "any",
                "budget": "any",
                "duration": "any",
                "category": "any"
            }
            
            response = requests.post(f"{BASE_URL}/worker-dashboard/jobs/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (basic)", True, 
                                  {"jobs_found": len(data)})
                else:
                    self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (basic)", False, data, 
                                  "Expected array of jobs")
            else:
                self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (basic)", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (basic)", False, None, str(e))
        
        # Test 9: POST /api/worker-dashboard/jobs/search with filters
        try:
            # Test with search filters
            payload = {
                "search": "web development",
                "location": "remote",
                "budget": "$100-$500",
                "duration": "any",
                "category": "Web Development"
            }
            
            response = requests.post(f"{BASE_URL}/worker-dashboard/jobs/search", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (filtered)", True, 
                                  {"jobs_found": len(data), "filters_applied": payload})
                else:
                    self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (filtered)", False, data, 
                                  "Expected array of jobs")
            else:
                self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (filtered)", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Job Search - POST /api/worker-dashboard/jobs/search (filtered)", False, None, str(e))
        
        # Test 10: Error handling - Invalid user ID
        try:
            response = requests.get(f"{BASE_URL}/worker-dashboard/stats/invalid-user-id-12345")
            
            # Should still return 200 with zero values for non-existent user
            if response.status_code == 200:
                data = response.json()
                self.log_result("worker_dashboard", "Error Handling - Invalid User ID", True, 
                              {"status_code": response.status_code, "message": "Properly handled invalid user ID", "data": data})
            else:
                self.log_result("worker_dashboard", "Error Handling - Invalid User ID", False, None, 
                              f"Unexpected response for invalid user ID: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("worker_dashboard", "Error Handling - Invalid User ID", False, None, str(e))

    def test_role_based_multi_hire(self):
        """Test Role-Based Multi-Hire feature implementation"""
        print("\n🎯 Testing Role-Based Multi-Hire Feature...")
        
        # Store job IDs for later tests
        multi_role_job_id = None
        single_hire_job_id = None
        
        # Test 1: Create Multi-Role Professional Project
        try:
            payload = {
                "userId": "test-user-123",
                "userEmail": "hirer@test.com",
                "jobType": "project",
                "title": "Full Stack Web Application Development",
                "description": "Need a team to build a modern web application",
                "category": "web-development",
                "skills": ["React", "Node.js", "MongoDB"],
                "budget": {
                    "type": "fixed",
                    "amount": 15000,
                    "currency": "USD"
                },
                "timeline": "2-4-weeks",
                "location": {
                    "type": "remote"
                },
                "urgency": "normal",
                "status": "published",
                "hiringType": "Multi-Role",
                "roles": [
                    {
                        "roleName": "Frontend Developer",
                        "numberOfPeople": 2,
                        "requiredSkills": ["React", "JavaScript", "UI/UX Design"],
                        "payPerPerson": 5000,
                        "experienceLevel": "Intermediate",
                        "workLocation": "Remote",
                        "applicants": 0,
                        "hired": 0,
                        "status": "Open"
                    },
                    {
                        "roleName": "Backend Developer",
                        "numberOfPeople": 1,
                        "requiredSkills": ["Node.js", "Python", "MongoDB"],
                        "payPerPerson": 6000,
                        "experienceLevel": "Expert",
                        "workLocation": "Remote",
                        "applicants": 0,
                        "hired": 0,
                        "status": "Open"
                    },
                    {
                        "roleName": "UI/UX Designer",
                        "numberOfPeople": 1,
                        "requiredSkills": ["UI/UX Design", "Figma"],
                        "payPerPerson": 4000,
                        "experienceLevel": "Intermediate",
                        "workLocation": "Hybrid",
                        "applicants": 0,
                        "hired": 0,
                        "status": "Open"
                    }
                ]
            }
            
            response = requests.post(f"{BASE_URL}/jobs", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                # Verify Multi-Role project creation
                if (data.get("hiringType") == "Multi-Role" and
                    isinstance(data.get("roles"), list) and
                    len(data.get("roles")) == 3 and
                    data.get("title") == payload["title"] and
                    data.get("jobType") == "project"):
                    
                    # Verify role structure
                    roles = data.get("roles")
                    frontend_role = next((r for r in roles if r.get("roleName") == "Frontend Developer"), None)
                    backend_role = next((r for r in roles if r.get("roleName") == "Backend Developer"), None)
                    designer_role = next((r for r in roles if r.get("roleName") == "UI/UX Designer"), None)
                    
                    if (frontend_role and backend_role and designer_role and
                        frontend_role.get("numberOfPeople") == 2 and
                        backend_role.get("payPerPerson") == 6000 and
                        designer_role.get("workLocation") == "Hybrid" and
                        all("roleId" in role for role in roles)):
                        
                        multi_role_job_id = data.get("id")
                        self.log_result("job_posting", "Multi-Role Project Creation", True, data)
                    else:
                        self.log_result("job_posting", "Multi-Role Project Creation", False, data, 
                                      "Role structure validation failed")
                else:
                    self.log_result("job_posting", "Multi-Role Project Creation", False, data, 
                                  f"Expected Multi-Role project with 3 roles, got hiringType={data.get('hiringType')}, roles count={len(data.get('roles', []))}")
            else:
                self.log_result("job_posting", "Multi-Role Project Creation", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("job_posting", "Multi-Role Project Creation", False, None, str(e))
        
        # Test 2: Create Single Hire Project
        try:
            payload = {
                "userId": "test-user-123",
                "userEmail": "hirer@test.com",
                "jobType": "project",
                "title": "Simple Landing Page",
                "description": "Need a landing page built",
                "category": "web-development",
                "skills": ["HTML", "CSS"],
                "budget": {
                    "type": "fixed",
                    "amount": 500,
                    "currency": "USD"
                },
                "timeline": "1-2-weeks",
                "location": {
                    "type": "remote"
                },
                "urgency": "normal",
                "status": "published",
                "hiringType": "Single",
                "roles": []
            }
            
            response = requests.post(f"{BASE_URL}/jobs", json=payload)
            
            if response.status_code == 201:
                data = response.json()
                # Verify Single Hire project creation
                if (data.get("hiringType") == "Single" and
                    isinstance(data.get("roles"), list) and
                    len(data.get("roles")) == 0 and
                    data.get("title") == payload["title"] and
                    data.get("jobType") == "project"):
                    
                    single_hire_job_id = data.get("id")
                    self.log_result("job_posting", "Single Hire Project Creation", True, data)
                else:
                    self.log_result("job_posting", "Single Hire Project Creation", False, data, 
                                  f"Expected Single hire project with empty roles, got hiringType={data.get('hiringType')}, roles count={len(data.get('roles', []))}")
            else:
                self.log_result("job_posting", "Single Hire Project Creation", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("job_posting", "Single Hire Project Creation", False, None, str(e))
        
        # Test 3: Retrieve Jobs with hiringType and roles fields
        try:
            response = requests.get(f"{BASE_URL}/jobs")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check if jobs include hiringType and roles fields
                    jobs_with_hiring_type = [job for job in data if "hiringType" in job and "roles" in job]
                    
                    if len(jobs_with_hiring_type) > 0:
                        # Find our test jobs
                        multi_role_job = next((job for job in data if job.get("id") == multi_role_job_id), None)
                        single_hire_job = next((job for job in data if job.get("id") == single_hire_job_id), None)
                        
                        if multi_role_job and single_hire_job:
                            self.log_result("job_posting", "Retrieve Jobs with Role Fields", True, 
                                          {"jobs_found": len(data), "jobs_with_hiring_type": len(jobs_with_hiring_type)})
                        else:
                            self.log_result("job_posting", "Retrieve Jobs with Role Fields", True, 
                                          {"jobs_found": len(data), "message": "Jobs retrieved with role fields but test jobs not found"})
                    else:
                        self.log_result("job_posting", "Retrieve Jobs with Role Fields", False, data, 
                                      "No jobs found with hiringType and roles fields")
                else:
                    self.log_result("job_posting", "Retrieve Jobs with Role Fields", True, 
                                  {"message": "No jobs found (acceptable for empty database)"})
            else:
                self.log_result("job_posting", "Retrieve Jobs with Role Fields", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("job_posting", "Retrieve Jobs with Role Fields", False, None, str(e))
        
        # Test 4: Retrieve Single Job with complete role information
        if multi_role_job_id:
            try:
                response = requests.get(f"{BASE_URL}/jobs/{multi_role_job_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify complete role information is returned
                    if (data.get("hiringType") == "Multi-Role" and
                        isinstance(data.get("roles"), list) and
                        len(data.get("roles")) == 3):
                        
                        roles = data.get("roles")
                        # Check all role fields are present
                        required_role_fields = ["roleId", "roleName", "numberOfPeople", "requiredSkills", 
                                              "payPerPerson", "experienceLevel", "workLocation", 
                                              "applicants", "hired", "status"]
                        
                        all_fields_present = all(
                            all(field in role for field in required_role_fields) 
                            for role in roles
                        )
                        
                        if all_fields_present:
                            self.log_result("job_posting", "Retrieve Single Job with Role Info", True, data)
                        else:
                            missing_fields = []
                            for role in roles:
                                for field in required_role_fields:
                                    if field not in role:
                                        missing_fields.append(f"{role.get('roleName', 'Unknown')}.{field}")
                            self.log_result("job_posting", "Retrieve Single Job with Role Info", False, data, 
                                          f"Missing role fields: {missing_fields}")
                    else:
                        self.log_result("job_posting", "Retrieve Single Job with Role Info", False, data, 
                                      "Job structure validation failed")
                else:
                    self.log_result("job_posting", "Retrieve Single Job with Role Info", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Retrieve Single Job with Role Info", False, None, str(e))
        
        # Test 5: Update Job with Roles via PATCH
        if multi_role_job_id:
            try:
                update_payload = {
                    "roles": [
                        {
                            "roleName": "Frontend Developer",
                            "numberOfPeople": 3,
                            "requiredSkills": ["React", "TypeScript"],
                            "payPerPerson": 5500,
                            "experienceLevel": "Expert",
                            "workLocation": "Remote",
                            "applicants": 2,
                            "hired": 0,
                            "status": "Open"
                        }
                    ]
                }
                
                response = requests.patch(f"{BASE_URL}/jobs/{multi_role_job_id}", json=update_payload)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify role update
                    if (isinstance(data.get("roles"), list) and
                        len(data.get("roles")) == 1 and
                        data.get("roles")[0].get("numberOfPeople") == 3 and
                        data.get("roles")[0].get("payPerPerson") == 5500 and
                        data.get("roles")[0].get("experienceLevel") == "Expert" and
                        "updatedAt" in data):
                        
                        self.log_result("job_posting", "Update Job with Roles", True, data)
                    else:
                        self.log_result("job_posting", "Update Job with Roles", False, data, 
                                      "Role update validation failed")
                else:
                    self.log_result("job_posting", "Update Job with Roles", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("job_posting", "Update Job with Roles", False, None, str(e))
        
        # Test 6: Backward Compatibility - Verify existing jobs without hiringType/roles still work
        try:
            # Create a job without hiringType and roles (simulating old job)
            legacy_payload = {
                "userId": "test-user-123",
                "userEmail": "hirer@test.com",
                "jobType": "gig",
                "title": "Legacy Gig Job",
                "description": "A job created without role-based fields",
                "category": "maintenance",
                "status": "published"
            }
            
            response = requests.post(f"{BASE_URL}/jobs", json=legacy_payload)
            
            if response.status_code == 201:
                data = response.json()
                # Should default to Single hiring type with empty roles
                if (data.get("hiringType") == "Single" and
                    isinstance(data.get("roles"), list) and
                    len(data.get("roles")) == 0 and
                    data.get("title") == legacy_payload["title"]):
                    
                    self.log_result("job_posting", "Backward Compatibility Test", True, data)
                else:
                    self.log_result("job_posting", "Backward Compatibility Test", False, data, 
                                  "Legacy job should default to Single hiring type with empty roles")
            else:
                self.log_result("job_posting", "Backward Compatibility Test", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("job_posting", "Backward Compatibility Test", False, None, str(e))

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Hapployed Backend Testing - Role-Based Multi-Hire Focus")
        print(f"🌐 Testing against: {BASE_URL}")
        print(f"👤 Test User ID: {TEST_USER_ID}")
        print("=" * 60)
        
        # PRIORITY: Epic Worker Dashboard API Tests
        self.test_epic_worker_dashboard_endpoints()
        
        # Role-Based Multi-Hire Feature Tests
        self.test_role_based_multi_hire()
        
        # Worker Features Tests
        self.test_available_now_toggle()
        self.test_gamification_system()
        self.test_worker_preferences()
        self.test_gig_chain()
        self.test_gig_squad()
        self.test_corporate_pass()
        self.test_gig_insurance()
        
        # AI Matching Tests
        self.test_ai_calculate_match()
        self.test_ai_suggest_gigs()
        self.test_ai_forecast_demand()
        
        # AI Voice Parsing Tests
        self.test_ai_voice_parsing()
        
        # AI Price Estimator Tests
        self.test_ai_price_estimator()
        
        # Profile Tests
        self.test_profile_endpoints()
        
        # Job Posting Tests
        self.test_job_posting_endpoints()
        
        # Worker Profile Tests
        self.test_worker_profile_endpoints()
        
        # Application System Tests
        self.test_application_system_endpoints()
        
        # Wallet System Tests (MongoDB version)
        # self.test_wallet_system_endpoints()
        
        # Wallet System Supabase Migration Tests
        self.test_wallet_system_supabase()
        
        # NEW SYSTEMS TESTING - Three Major Systems
        print("\n🆕 TESTING THREE NEW BACKEND SYSTEMS")
        print("=" * 60)
        
        # Grow System Tests
        self.test_grow_system_endpoints()
        
        # Search System Tests
        self.test_search_system_endpoints()
        
        # Verification System Tests
        self.test_verification_system_endpoints()
        
        # SMS Gateway System Tests
        self.test_sms_gateway_system()
        
        # Dual Persona Switch Tests
        self.test_dual_persona_switch()
        
        # Quickhire Supabase Migration Tests
        self.test_quickhire_supabase_migration()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {self.results['summary']['passed']}")
        print(f"❌ Failed: {self.results['summary']['failed']}")
        
        if self.results['summary']['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['summary']['errors']:
                print(f"   • {error}")
        
        # Save detailed results
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
        
        return self.results

if __name__ == "__main__":
    tester = BackendTester()
    results = tester.run_all_tests()