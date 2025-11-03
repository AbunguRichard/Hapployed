#!/usr/bin/env python3
"""
AI Price Estimator Test Suite - Testing the new /api/estimate-price endpoint
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://talentswitch.preview.emergentagent.com/api"

class PriceEstimatorTester:
    def __init__(self):
        self.results = {
            "price_estimator": {},
            "summary": {"passed": 0, "failed": 0, "errors": []}
        }
        
    def log_result(self, test_name, success, response=None, error=None):
        """Log test result"""
        self.results["price_estimator"][test_name] = {
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
                        self.log_result("Web Development Project", True, data)
                        print(f"   Price Range: ${data.get('minPrice')} - ${data.get('maxPrice')}")
                        print(f"   Suggested: ${data.get('suggestedPrice')}")
                        print(f"   Explanation: {data.get('explanation')[:100]}...")
                    else:
                        self.log_result("Web Development Project", False, data, 
                                      f"Invalid price data: minPrice={data.get('minPrice')}, maxPrice={data.get('maxPrice')}, suggestedPrice={data.get('suggestedPrice')}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("Web Development Project", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("Web Development Project", False, None, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Web Development Project", False, None, str(e))
        
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
                        self.log_result("Urgent Local Gig", True, data)
                        print(f"   Price Range: ${data.get('minPrice')} - ${data.get('maxPrice')}")
                        print(f"   Suggested: ${data.get('suggestedPrice')}")
                        print(f"   Explanation: {data.get('explanation')[:100]}...")
                        print(f"   Factors: {data.get('factors')}")
                    else:
                        self.log_result("Urgent Local Gig", False, data, 
                                      f"Invalid price data: minPrice={data.get('minPrice')}, maxPrice={data.get('maxPrice')}, suggestedPrice={data.get('suggestedPrice')}")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("Urgent Local Gig", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("Urgent Local Gig", False, None, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Urgent Local Gig", False, None, str(e))
        
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
                        self.log_result("Other Category", True, data)
                        print(f"   Price Range: ${data.get('minPrice')} - ${data.get('maxPrice')}")
                        print(f"   Suggested: ${data.get('suggestedPrice')}")
                    else:
                        self.log_result("Other Category", False, data, 
                                      "Invalid price values for Other category")
                else:
                    missing_fields = [field for field in required_fields if field not in data]
                    self.log_result("Other Category", False, data, 
                                  f"Missing required fields: {missing_fields}")
            else:
                self.log_result("Other Category", False, None, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Other Category", False, None, str(e))
        
        # Test 4: Error handling - Missing workType
        try:
            payload = {
                "category": "Web Development",
                "description": "Build a website"
            }
            
            response = requests.post(f"{BASE_URL}/estimate-price", json=payload)
            
            # Should return validation error for missing workType
            if response.status_code in [400, 422]:
                self.log_result("Missing WorkType Validation", True, 
                              {"status_code": response.status_code, "message": "Properly validated missing workType"})
            else:
                self.log_result("Missing WorkType Validation", False, None, 
                              f"Expected validation error (400/422), got HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("Missing WorkType Validation", False, None, str(e))
    
    def run_tests(self):
        """Run AI Price Estimator tests"""
        print("🚀 Starting AI Price Estimator Tests")
        print(f"🌐 Testing against: {BASE_URL}")
        print("=" * 60)
        
        self.test_ai_price_estimator()
        
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
        with open('/app/price_estimator_test_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/price_estimator_test_results.json")
        
        return self.results

if __name__ == "__main__":
    tester = PriceEstimatorTester()
    results = tester.run_tests()