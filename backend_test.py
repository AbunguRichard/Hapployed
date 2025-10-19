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
BASE_URL = "https://voice-job-app.preview.emergentagent.com/api"
TEST_USER_ID = "worker-john-smith-123"
TEST_GIG_ID = "plumbing-emergency-456"
TEST_COMPANY_ID = "acme-corp-789"

class BackendTester:
    def __init__(self):
        self.results = {
            "worker_features": {},
            "ai_matching": {},
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
                "active": True
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
                "claim_window_hours": 24
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
            payload = {
                "worker_id": TEST_USER_ID,
                "worker_profile": {
                    "skills": ["Plumbing", "HVAC", "Emergency Repair"],
                    "experience": "5 years",
                    "preferred_areas": ["San Francisco", "Oakland"],
                    "rating": 4.8,
                    "completed_gigs": 127,
                    "available_now": True
                },
                "available_gigs": [
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
            }
            
            response = requests.post(f"{BASE_URL}/ai-matching/suggest-gigs", json=payload)
            
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
            payload = {
                "location": "San Francisco, CA",
                "category": "Plumbing",
                "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
            }
            
            response = requests.post(f"{BASE_URL}/ai-matching/forecast-demand", json=payload)
            
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
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Hapployed Worker Dashboard Backend Tests")
        print(f"🌐 Testing against: {BASE_URL}")
        print(f"👤 Test User ID: {TEST_USER_ID}")
        print("=" * 60)
        
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