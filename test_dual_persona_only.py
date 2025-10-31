#!/usr/bin/env python3
"""
Test only the Dual Persona Switch functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://dual-persona-4.preview.emergentagent.com/api"

class DualPersonaTester:
    def __init__(self):
        self.results = {"passed": 0, "failed": 0, "errors": []}
        
    def log_result(self, test_name, success, response=None, error=None):
        """Log test result"""
        if success:
            self.results["passed"] += 1
            print(f"✅ {test_name}")
            if response:
                print(f"   Response: {json.dumps(response, indent=2)}")
        else:
            self.results["failed"] += 1
            self.results["errors"].append(f"{test_name}: {error}")
            print(f"❌ {test_name}: {error}")
            if response:
                print(f"   Response: {json.dumps(response, indent=2)}")
    
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
                        self.log_result("Register Worker User", True, 
                                      {"user_id": user_id, "roles": user_data["roles"]})
                    else:
                        self.log_result("Register Worker User", False, data, 
                                      "User does not have worker role")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("Register Worker User", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("Register Worker User", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Register Worker User", False, None, str(e))
        
        # Test 2: Get user info and verify currentMode
        if access_token:
            try:
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify currentMode field is present and set to "worker"
                    if "currentMode" in data and data["currentMode"] == "worker":
                        self.log_result("Get User Info - Verify CurrentMode", True, 
                                      {"currentMode": data["currentMode"], "roles": data.get("roles", [])})
                    else:
                        self.log_result("Get User Info - Verify CurrentMode", False, data, 
                                      f"Expected currentMode='worker', got: {data.get('currentMode')}")
                else:
                    self.log_result("Get User Info - Verify CurrentMode", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("Get User Info - Verify CurrentMode", False, None, str(e))
        
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
                        self.log_result("Add Secondary Role - Employer", True, 
                                      {"roles": data["roles"]})
                    else:
                        self.log_result("Add Secondary Role - Employer", False, data, 
                                      f"Expected both worker and employer roles, got: {data.get('roles')}")
                else:
                    self.log_result("Add Secondary Role - Employer", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("Add Secondary Role - Employer", False, None, str(e))
        
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
                        self.log_result("Switch Mode - Worker to Employer", True, data)
                    else:
                        self.log_result("Switch Mode - Worker to Employer", False, data, 
                                      "Mode switch response invalid")
                else:
                    self.log_result("Switch Mode - Worker to Employer", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("Switch Mode - Worker to Employer", False, None, str(e))
        
        # Test 4b: Verify mode switch via /me endpoint
        if access_token:
            try:
                headers = {"Authorization": f"Bearer {access_token}"}
                response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # Verify currentMode is now "employer"
                    if "currentMode" in data and data["currentMode"] == "employer":
                        self.log_result("Verify Mode Switch - Employer", True, 
                                      {"currentMode": data["currentMode"]})
                    else:
                        self.log_result("Verify Mode Switch - Employer", False, data, 
                                      f"Expected currentMode='employer', got: {data.get('currentMode')}")
                else:
                    self.log_result("Verify Mode Switch - Employer", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("Verify Mode Switch - Employer", False, None, str(e))
        
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
                        self.log_result("Switch Mode - Employer to Worker", True, data)
                    else:
                        self.log_result("Switch Mode - Employer to Worker", False, data, 
                                      "Mode switch response invalid")
                else:
                    self.log_result("Switch Mode - Employer to Worker", False, None, 
                                  f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result("Switch Mode - Employer to Worker", False, None, str(e))
        
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
                    self.log_result("Switch to Unauthorized Role - 403 Error", True, 
                                  {"status_code": response.status_code, "message": "Properly blocked unauthorized role switch"})
                else:
                    self.log_result("Switch to Unauthorized Role - 403 Error", False, None, 
                                  f"Expected 403 Forbidden, got HTTP {response.status_code}")
            else:
                self.log_result("Switch to Unauthorized Role - 403 Error", False, None, 
                              f"Failed to create single role user: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_result("Switch to Unauthorized Role - 403 Error", False, None, str(e))

if __name__ == "__main__":
    tester = DualPersonaTester()
    tester.test_dual_persona_switch()
    
    print("\n" + "=" * 60)
    print("📊 DUAL PERSONA TEST SUMMARY")
    print("=" * 60)
    print(f"✅ Passed: {tester.results['passed']}")
    print(f"❌ Failed: {tester.results['failed']}")
    
    if tester.results['errors']:
        print("\n🚨 FAILED TESTS:")
        for error in tester.results['errors']:
            print(f"   • {error}")