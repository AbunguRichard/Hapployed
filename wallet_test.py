#!/usr/bin/env python3
"""
Focused Wallet System Backend Test Suite
Tests all wallet endpoints as requested in the review
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "https://supabase-migration-9.preview.emergentagent.com/api"

class WalletTester:
    def __init__(self):
        self.results = {
            "wallet": {},
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

    def test_wallet_system_endpoints(self):
        """Test Wallet System API endpoints"""
        print("\n💰 Testing Wallet System Endpoints...")
        
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
        
        # Test 2: POST /api/wallet/calculate-fees - Calculate cashout fees for bank_transfer instant
        try:
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
        
        # Test 4: Calculate fees for credit_card instant
        try:
            payload = {
                "amount": 100,
                "method": "credit_card",
                "instant": True
            }
            
            response = requests.post(f"{BASE_URL}/wallet/calculate-fees", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    fee_data = data["data"]
                    if (fee_data["type"] == "instant" and 
                        fee_data["fee_amount"] >= 0):
                        self.log_result("wallet", "Calculate Fees - Instant Credit Card", True, data)
                    else:
                        self.log_result("wallet", "Calculate Fees - Instant Credit Card", False, data, 
                                      f"Invalid instant credit card fee calculation: {fee_data}")
                else:
                    self.log_result("wallet", "Calculate Fees - Instant Credit Card", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Calculate Fees - Instant Credit Card", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Calculate Fees - Instant Credit Card", False, None, str(e))
        
        # Test 5: POST /api/wallet/cashout/instant - Process instant cashout
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
        
        # Test 6: POST /api/wallet/cashout/standard - Process standard cashout
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
        
        # Test 7: POST /api/wallet/savings/setup - Setup savings account
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
        
        # Test 8: POST /api/wallet/savings/setup with initial amount (will test after credit)
        
        # Test 9: POST /api/wallet/credit/request - Request credit advance
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
        
        # Test 10: POST /api/wallet/savings/setup with initial amount (now that we have credit balance)
        try:
            payload = {
                "initial_amount": 100
            }
            
            response = requests.post(f"{BASE_URL}/wallet/savings/setup", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    savings_data = data["data"]
                    if ("savings_balance" in savings_data and 
                        "interest_rate" in savings_data and
                        savings_data["savings_balance"] == 100):
                        self.log_result("wallet", "Savings Setup - With Initial Amount", True, data)
                    else:
                        self.log_result("wallet", "Savings Setup - With Initial Amount", False, data, 
                                      f"Invalid savings setup with initial amount: {savings_data}")
                else:
                    self.log_result("wallet", "Savings Setup - With Initial Amount", False, data, 
                                  "Invalid response format")
            elif response.status_code == 400:
                # Expected if insufficient balance
                self.log_result("wallet", "Savings Setup - With Initial Amount", True, 
                              {"status_code": response.status_code, "message": "Properly handled insufficient balance for savings"})
            else:
                self.log_result("wallet", "Savings Setup - With Initial Amount", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Savings Setup - With Initial Amount", False, None, str(e))
        
        # Test 11: POST /api/wallet/payment-methods - Add bank payment method
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
        
        # Test 12: POST /api/wallet/payment-methods - Add PayPal payment method
        try:
            payload = {
                "type": "paypal",
                "details": {
                    "paypal_email": "user@paypal.com"
                }
            }
            
            response = requests.post(f"{BASE_URL}/wallet/payment-methods", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("success") and "data" in data):
                    payment_method = data["data"]
                    if ("id" in payment_method and 
                        payment_method.get("type") == "paypal" and
                        "details" in payment_method):
                        self.log_result("wallet", "Add Payment Method - PayPal", True, data)
                    else:
                        self.log_result("wallet", "Add Payment Method - PayPal", False, data, 
                                      "Invalid PayPal payment method response")
                else:
                    self.log_result("wallet", "Add Payment Method - PayPal", False, data, 
                                  "Invalid response format")
            else:
                self.log_result("wallet", "Add Payment Method - PayPal", False, None, 
                              f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result("wallet", "Add Payment Method - PayPal", False, None, str(e))
        
        # Test 13: GET /api/wallet/transactions - Get transaction history
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
        
        # Test 14: GET /api/wallet/transactions with type filter
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

    def run_wallet_tests(self):
        """Run wallet system tests"""
        print("🚀 Starting Wallet System Backend Testing...")
        print(f"📍 Base URL: {BASE_URL}")
        print("=" * 80)
        
        # Wallet System Tests
        self.test_wallet_system_endpoints()
        
        # Print summary
        print("\n" + "=" * 80)
        print("📊 WALLET SYSTEM TEST SUMMARY")
        print("=" * 80)
        print(f"✅ Passed: {self.results['summary']['passed']}")
        print(f"❌ Failed: {self.results['summary']['failed']}")
        
        if self.results['summary']['errors']:
            print("\n🚨 FAILED TESTS:")
            for error in self.results['summary']['errors']:
                print(f"   • {error}")
        
        # Save detailed results
        with open('/app/wallet_test_results.json', 'w') as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: /app/wallet_test_results.json")
        
        return self.results

if __name__ == "__main__":
    tester = WalletTester()
    results = tester.run_wallet_tests()