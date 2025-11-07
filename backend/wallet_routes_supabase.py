"""
Wallet Routes - Supabase PostgreSQL Version (Normalized Schema)
Comprehensive wallet management system adapted for normalized Supabase tables
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timedelta, timezone
import uuid

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/wallet", tags=["Wallet"])

# ============================================================================
# MODELS
# ============================================================================

class PaymentMethodDetails(BaseModel):
    bank_name: Optional[str] = None
    account_last4: Optional[str] = None
    paypal_email: Optional[str] = None
    card_brand: Optional[str] = None
    card_last4: Optional[str] = None
    crypto_address: Optional[str] = None

class CashoutRequest(BaseModel):
    amount: float
    method: Literal["bank_transfer", "paypal", "credit_card", "debit_card"]
    method_details: PaymentMethodDetails

class FeeCalculationRequest(BaseModel):
    amount: float
    method: Literal["bank_transfer", "paypal", "credit_card", "debit_card"]
    instant: bool = False

class SavingsSetupRequest(BaseModel):
    initial_amount: float = 0.0

class CreditRequest(BaseModel):
    amount: float
    purpose: str

class AddPaymentMethodRequest(BaseModel):
    type: Literal["bank", "paypal", "card", "crypto"]
    details: PaymentMethodDetails

# ============================================================================
# WALLET SERVICE
# ============================================================================

class WalletService:
    
    @staticmethod
    def calculate_cashout_fee(amount: float, method: str, instant: bool = False) -> Dict:
        """Calculate cashout fees based on method and type"""
        base_fees = {
            "standard": {
                "bank_transfer": {"fixed": 0.25, "percentage": 0},
                "paypal": {"fixed": 0, "percentage": 2.5},
                "credit_card": {"fixed": 0.30, "percentage": 0},
                "debit_card": {"fixed": 0.30, "percentage": 0}
            },
            "instant": {
                "bank_transfer": {"fixed": 0, "percentage": 1.5},
                "paypal": {"fixed": 0, "percentage": 3.5},
                "credit_card": {"fixed": 0, "percentage": 2.0},
                "debit_card": {"fixed": 0, "percentage": 2.0}
            }
        }
        
        fee_type = "instant" if instant else "standard"
        fee_config = base_fees[fee_type].get(method, base_fees[fee_type]["bank_transfer"])
        
        fee_amount = fee_config["fixed"] + (amount * (fee_config["percentage"] / 100))
        net_amount = amount - fee_amount
        
        return {
            "fee_amount": round(fee_amount, 2),
            "net_amount": round(net_amount, 2),
            "rate": fee_config["percentage"],
            "type": fee_type
        }
    
    @staticmethod
    async def get_or_create_wallet(user_id: str) -> Dict:
        """Get wallet or create if doesn't exist - works with normalized schema"""
        supabase = get_supabase_admin()
        
        # Try to get existing wallet
        result = supabase.table('wallets').select('*').eq('user_id', user_id).execute()
        
        if result.data and len(result.data) > 0:
            wallet = result.data[0]
            
            # Get transactions
            trans_result = supabase.table('transactions').select('*').eq('wallet_id', wallet['id']).order('created_at', desc=True).limit(100).execute()
            wallet['transactions'] = trans_result.data if trans_result.data else []
            
            # Get payment methods
            pm_result = supabase.table('payment_methods').select('*').eq('user_id', user_id).execute()
            wallet['payment_methods'] = pm_result.data if pm_result.data else []
            
            return wallet
        
        # Create new wallet
        wallet_id = str(uuid.uuid4())
        wallet_data = {
            "id": wallet_id,
            "user_id": user_id,
            "balance": 0.0,
            "available_balance": 0.0,
            "pending_balance": 0.0,
            "total_earned": 0.0,
            "credit_limit": 65000.0,
            "credit_used": 0.0,
            "savings_enabled": False,
            "savings_balance": 0.0,
            "savings_interest_rate": 2.5,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        insert_result = supabase.table('wallets').insert(wallet_data).execute()
        
        if insert_result.data and len(insert_result.data) > 0:
            wallet = insert_result.data[0]
            wallet['transactions'] = []
            wallet['payment_methods'] = []
            return wallet
        
        raise HTTPException(status_code=500, detail="Failed to create wallet")

wallet_service = WalletService()

# ============================================================================
# ROUTES
# ============================================================================

def get_current_user_id():
    """Mock function - replace with actual JWT auth"""
    return "demo-user-123"

@router.get("/")
async def get_wallet(user_id: str = Depends(get_current_user_id)):
    """Get wallet overview with transactions and payment methods"""
    try:
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        # Format response to match MongoDB structure for frontend compatibility
        return {
            "success": True,
            "data": {
                **wallet,
                "balance": {
                    "available": float(wallet.get('available_balance', 0)),
                    "pending": float(wallet.get('pending_balance', 0)),
                    "reserved": 0.0
                },
                "currency": "USD",
                "settings": {
                    "auto_cashout": False,
                    "cashout_threshold": 100.0,
                    "preferred_method": None,
                    "tax_settings": {}
                },
                "limits": {
                    "daily_cashout": 5000.0,
                    "monthly_cashout": 20000.0,
                    "instant_cashout_fee": 1.5
                },
                "financial_products": {
                    "savings": {
                        "enabled": wallet.get('savings_enabled', False),
                        "balance": float(wallet.get('savings_balance', 0)),
                        "interest_rate": float(wallet.get('savings_interest_rate', 2.5))
                    },
                    "credit": {
                        "available": float(wallet.get('credit_limit', 65000)) - float(wallet.get('credit_used', 0)),
                        "used": float(wallet.get('credit_used', 0)),
                        "interest_rate": 12.5
                    }
                },
                "stats": {
                    "total_earned": float(wallet.get('total_earned', 0)),
                    "total_withdrawn": 0.0,
                    "total_fees": 0.0,
                    "last_cashout": None
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calculate-fees")
async def calculate_fees(request: FeeCalculationRequest):
    """Calculate cashout fees"""
    try:
        fees = wallet_service.calculate_cashout_fee(
            request.amount,
            request.method,
            request.instant
        )
        return {
            "success": True,
            "data": fees
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cashout/instant")
async def instant_cashout(request: CashoutRequest, user_id: str = Depends(get_current_user_id)):
    """Process instant cashout"""
    try:
        supabase = get_supabase_admin()
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        available_balance = float(wallet.get('available_balance', 0))
        
        # Check balance
        if available_balance < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Check daily limit
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_cashouts = sum(
            float(t.get('amount', 0)) for t in wallet.get('transactions', [])
            if t.get('transaction_type') == 'cashout' and 
            datetime.fromisoformat(t.get('created_at', '').replace("Z", "+00:00") if t.get('created_at') else datetime.now(timezone.utc).isoformat()) >= today and
            t.get('status') == 'completed'
        )
        
        if today_cashouts + request.amount > 5000:
            raise HTTPException(status_code=400, detail="Daily cashout limit exceeded")
        
        # Calculate fees
        fee_calc = wallet_service.calculate_cashout_fee(request.amount, request.method, True)
        
        # Create transaction
        trans_id = str(uuid.uuid4())
        transaction_data = {
            "id": trans_id,
            "wallet_id": wallet['id'],
            "transaction_type": "cashout",
            "amount": request.amount,
            "description": f"Instant cashout to {request.method}",
            "status": "completed",
            "payment_method": request.method,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table('transactions').insert(transaction_data).execute()
        
        # Update wallet balance
        new_balance = available_balance - request.amount
        supabase.table('wallets').update({
            "available_balance": new_balance,
            "balance": new_balance,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq('id', wallet['id']).execute()
        
        return {
            "success": True,
            "message": "Instant cashout processed successfully",
            "data": {
                "transaction": transaction_data,
                "fee": fee_calc["fee_amount"],
                "net_amount": fee_calc["net_amount"]
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cashout/standard")
async def standard_cashout(request: CashoutRequest, user_id: str = Depends(get_current_user_id)):
    """Process standard cashout (2-3 business days)"""
    try:
        supabase = get_supabase_admin()
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        available_balance = float(wallet.get('available_balance', 0))
        
        if available_balance < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Calculate fees
        is_pro_user = False
        fee_calc = {"fee_amount": 0, "net_amount": request.amount, "rate": 0, "type": "standard"} if is_pro_user else wallet_service.calculate_cashout_fee(request.amount, request.method, False)
        
        # Create transaction
        trans_id = str(uuid.uuid4())
        transaction_data = {
            "id": trans_id,
            "wallet_id": wallet['id'],
            "transaction_type": "cashout",
            "amount": request.amount,
            "description": f"Standard cashout to {request.method}",
            "status": "pending",
            "payment_method": request.method,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        supabase.table('transactions').insert(transaction_data).execute()
        
        # Move amount to pending
        new_available = available_balance - request.amount
        new_pending = float(wallet.get('pending_balance', 0)) + request.amount
        
        supabase.table('wallets').update({
            "available_balance": new_available,
            "pending_balance": new_pending,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq('id', wallet['id']).execute()
        
        estimated_arrival = datetime.now(timezone.utc) + timedelta(days=3)
        
        return {
            "success": True,
            "message": "Standard cashout initiated",
            "data": {
                "transaction": transaction_data,
                "fee": fee_calc["fee_amount"],
                "net_amount": fee_calc["net_amount"],
                "estimated_arrival": estimated_arrival.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/savings/setup")
async def setup_savings(request: SavingsSetupRequest, user_id: str = Depends(get_current_user_id)):
    """Setup savings account"""
    try:
        supabase = get_supabase_admin()
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        available_balance = float(wallet.get('available_balance', 0))
        
        if request.initial_amount > 0 and available_balance < request.initial_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        update_data = {"savings_enabled": True}
        
        if request.initial_amount > 0:
            # Transfer to savings
            new_available = available_balance - request.initial_amount
            new_savings = float(wallet.get('savings_balance', 0)) + request.initial_amount
            
            update_data["available_balance"] = new_available
            update_data["balance"] = new_available
            update_data["savings_balance"] = new_savings
            
            # Record transaction
            trans_id = str(uuid.uuid4())
            transaction_data = {
                "id": trans_id,
                "wallet_id": wallet['id'],
                "transaction_type": "transfer",
                "amount": request.initial_amount,
                "description": "Transfer to savings account",
                "status": "completed",
                "payment_method": "wallet_balance",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            supabase.table('transactions').insert(transaction_data).execute()
        
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        result = supabase.table('wallets').update(update_data).eq('id', wallet['id']).execute()
        
        return {
            "success": True,
            "message": "Savings account setup successfully",
            "data": {
                "savings_balance": float(update_data.get('savings_balance', wallet.get('savings_balance', 0))),
                "interest_rate": float(wallet.get('savings_interest_rate', 2.5))
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/credit/request")
async def request_credit(request: CreditRequest, user_id: str = Depends(get_current_user_id)):
    """Request credit advance"""
    try:
        supabase = get_supabase_admin()
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        # Simple credit score calculation
        credit_score = 650  # Base score
        transactions_count = len(wallet.get('transactions', []))
        if transactions_count > 10:
            credit_score += 50
        total_earned = float(wallet.get('total_earned', 0))
        if total_earned > 1000:
            credit_score += 30
        
        max_credit = credit_score * 100
        current_used = float(wallet.get('credit_used', 0))
        
        if request.amount > (max_credit - current_used):
            raise HTTPException(status_code=400, detail="Credit limit exceeded")
        
        # Update wallet
        new_credit_used = current_used + request.amount
        new_available = float(wallet.get('available_balance', 0)) + request.amount
        
        supabase.table('wallets').update({
            "credit_used": new_credit_used,
            "available_balance": new_available,
            "balance": new_available,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq('id', wallet['id']).execute()
        
        # Create transaction
        trans_id = str(uuid.uuid4())
        transaction_data = {
            "id": trans_id,
            "wallet_id": wallet['id'],
            "transaction_type": "deposit",
            "amount": request.amount,
            "description": f"Credit advance for: {request.purpose}",
            "status": "completed",
            "payment_method": "credit",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        supabase.table('transactions').insert(transaction_data).execute()
        
        repayment_date = datetime.now(timezone.utc) + timedelta(days=30)
        
        return {
            "success": True,
            "message": "Credit request processed",
            "data": {
                "credit_used": new_credit_used,
                "available_credit": max_credit - new_credit_used,
                "repayment_date": repayment_date.isoformat()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/payment-methods")
async def add_payment_method(request: AddPaymentMethodRequest, user_id: str = Depends(get_current_user_id)):
    """Add payment method"""
    try:
        supabase = get_supabase_admin()
        
        # Get existing payment methods
        existing = supabase.table('payment_methods').select('*').eq('user_id', user_id).execute()
        is_first = not existing.data or len(existing.data) == 0
        
        # Create payment method
        pm_id = str(uuid.uuid4())
        payment_method_data = {
            "id": pm_id,
            "user_id": user_id,
            "method_type": request.type,
            "provider": request.details.bank_name or request.details.card_brand or "Unknown",
            "account_number": request.details.paypal_email or request.details.crypto_address or "",
            "last_four": request.details.account_last4 or request.details.card_last4 or "",
            "is_default": is_first,  # First method is default
            "is_verified": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        result = supabase.table('payment_methods').insert(payment_method_data).execute()
        
        return {
            "success": True,
            "message": "Payment method added successfully",
            "data": result.data[0] if result.data else payment_method_data
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transactions")
async def get_transactions(page: int = 1, limit: int = 20, type: Optional[str] = None, user_id: str = Depends(get_current_user_id)):
    """Get transaction history"""
    try:
        supabase = get_supabase_admin()
        
        # Get wallet
        wallet_result = supabase.table('wallets').select('id').eq('user_id', user_id).execute()
        
        if not wallet_result.data or len(wallet_result.data) == 0:
            return {
                "success": True,
                "data": {
                    "transactions": [],
                    "pagination": {
                        "current": page,
                        "total": 0,
                        "total_transactions": 0
                    }
                }
            }
        
        wallet_id = wallet_result.data[0]['id']
        
        # Build query
        query = supabase.table('transactions').select('*', count='exact').eq('wallet_id', wallet_id)
        
        # Filter by type if provided
        if type:
            query = query.eq('transaction_type', type)
        
        # Get count
        count_result = query.execute()
        total_count = count_result.count if hasattr(count_result, 'count') else 0
        
        # Get paginated results
        offset = (page - 1) * limit
        query = supabase.table('transactions').select('*').eq('wallet_id', wallet_id)
        if type:
            query = query.eq('transaction_type', type)
        
        result = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
        
        transactions = result.data if result.data else []
        
        return {
            "success": True,
            "data": {
                "transactions": transactions,
                "pagination": {
                    "current": page,
                    "total": (total_count + limit - 1) // limit if total_count > 0 else 0,
                    "total_transactions": total_count
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
