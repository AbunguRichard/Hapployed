"""
Wallet Routes - Supabase PostgreSQL Version
Comprehensive wallet management system with transactions, cashouts, savings, and credit
"""

from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timedelta, timezone
import uuid
import json

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])

# ============================================================================
# MODELS
# ============================================================================

class TransactionMetadata(BaseModel):
    bank_name: Optional[str] = None
    account_last4: Optional[str] = None
    paypal_email: Optional[str] = None
    card_brand: Optional[str] = None
    crypto_wallet: Optional[str] = None
    instant: bool = False

class TransactionFee(BaseModel):
    amount: float = 0.0
    type: Literal["percentage", "fixed"] = "percentage"
    rate: float = 0.0

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["deposit", "withdrawal", "transfer", "payment", "cashout", "fee", "interest", "refund"]
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    status: Literal["pending", "completed", "failed", "cancelled"] = "pending"
    method: Literal["bank_transfer", "paypal", "credit_card", "debit_card", "crypto", "wallet_balance", "savings", "credit"]
    fee: TransactionFee = TransactionFee()
    net_amount: Optional[float] = None
    metadata: TransactionMetadata = TransactionMetadata()
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

class PaymentMethodDetails(BaseModel):
    bank_name: Optional[str] = None
    account_last4: Optional[str] = None
    paypal_email: Optional[str] = None
    card_brand: Optional[str] = None
    card_last4: Optional[str] = None
    crypto_address: Optional[str] = None

class PaymentMethod(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["bank", "paypal", "card", "crypto"]
    is_default: bool = False
    verified: bool = False
    details: PaymentMethodDetails = PaymentMethodDetails()
    added_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Balance(BaseModel):
    available: float = 0.0
    pending: float = 0.0
    reserved: float = 0.0

class TaxSettings(BaseModel):
    tax_id: Optional[str] = None
    country: Optional[str] = None

class WalletSettings(BaseModel):
    auto_cashout: bool = False
    cashout_threshold: float = 100.0
    preferred_method: Optional[str] = None
    tax_settings: TaxSettings = TaxSettings()

class WalletLimits(BaseModel):
    daily_cashout: float = 5000.0
    monthly_cashout: float = 20000.0
    instant_cashout_fee: float = 1.5

class SavingsProduct(BaseModel):
    enabled: bool = False
    balance: float = 0.0
    interest_rate: float = 2.5

class CreditProduct(BaseModel):
    available: float = 0.0
    used: float = 0.0
    interest_rate: float = 12.5

class FinancialProducts(BaseModel):
    savings: SavingsProduct = SavingsProduct()
    credit: CreditProduct = CreditProduct()

class WalletStats(BaseModel):
    total_earned: float = 0.0
    total_withdrawn: float = 0.0
    total_fees: float = 0.0
    last_cashout: Optional[datetime] = None

# Request Models
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
        """Get wallet or create if doesn't exist"""
        supabase = get_supabase_admin()
        
        # Try to get existing wallet
        result = supabase.table('wallets').select('*').eq('user_id', user_id).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        
        # Create new wallet
        wallet_id = str(uuid.uuid4())
        wallet_data = {
            "id": wallet_id,
            "user_id": user_id,
            "balance": json.dumps(Balance().dict()),
            "currency": "USD",
            "transactions": json.dumps([]),
            "payment_methods": json.dumps([]),
            "settings": json.dumps(WalletSettings().dict()),
            "limits": json.dumps(WalletLimits().dict()),
            "financial_products": json.dumps(FinancialProducts().dict()),
            "stats": json.dumps(WalletStats().dict()),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        insert_result = supabase.table('wallets').insert(wallet_data).execute()
        
        if insert_result.data and len(insert_result.data) > 0:
            return insert_result.data[0]
        
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
    """Get wallet overview"""
    try:
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        # Parse JSON fields
        if isinstance(wallet.get('balance'), str):
            wallet['balance'] = json.loads(wallet['balance'])
        if isinstance(wallet.get('transactions'), str):
            wallet['transactions'] = json.loads(wallet['transactions'])
        if isinstance(wallet.get('payment_methods'), str):
            wallet['payment_methods'] = json.loads(wallet['payment_methods'])
        if isinstance(wallet.get('settings'), str):
            wallet['settings'] = json.loads(wallet['settings'])
        if isinstance(wallet.get('limits'), str):
            wallet['limits'] = json.loads(wallet['limits'])
        if isinstance(wallet.get('financial_products'), str):
            wallet['financial_products'] = json.loads(wallet['financial_products'])
        if isinstance(wallet.get('stats'), str):
            wallet['stats'] = json.loads(wallet['stats'])
        
        return {
            "success": True,
            "data": wallet
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
        
        # Parse JSON fields
        balance = json.loads(wallet['balance']) if isinstance(wallet['balance'], str) else wallet['balance']
        transactions = json.loads(wallet['transactions']) if isinstance(wallet['transactions'], str) else wallet['transactions']
        stats = json.loads(wallet['stats']) if isinstance(wallet['stats'], str) else wallet['stats']
        limits = json.loads(wallet['limits']) if isinstance(wallet['limits'], str) else wallet['limits']
        
        # Check balance
        if balance['available'] < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Check daily limit
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_cashouts = sum(
            t['amount'] for t in transactions
            if t['type'] == 'cashout' and 
            datetime.fromisoformat(t['created_at'].replace("Z", "+00:00")) >= today and
            t['status'] == 'completed'
        )
        
        if today_cashouts + request.amount > limits['daily_cashout']:
            raise HTTPException(status_code=400, detail="Daily cashout limit exceeded")
        
        # Calculate fees
        fee_calc = wallet_service.calculate_cashout_fee(request.amount, request.method, True)
        
        # Create transaction
        transaction = Transaction(
            type="cashout",
            amount=request.amount,
            method=request.method,
            fee=TransactionFee(
                amount=fee_calc["fee_amount"],
                type="percentage",
                rate=fee_calc["rate"]
            ),
            net_amount=fee_calc["net_amount"],
            status="completed",
            metadata=TransactionMetadata(**request.method_details.dict(), instant=True),
            description=f"Instant cashout to {request.method}",
            completed_at=datetime.now(timezone.utc)
        )
        
        # Update wallet
        balance['available'] -= request.amount
        transactions.append(transaction.dict())
        stats['total_withdrawn'] += request.amount
        stats['total_fees'] += fee_calc["fee_amount"]
        stats['last_cashout'] = datetime.now(timezone.utc).isoformat()
        
        supabase.table('wallets').update({
            "balance": json.dumps(balance),
            "transactions": json.dumps(transactions),
            "stats": json.dumps(stats)
        }).eq('user_id', user_id).execute()
        
        return {
            "success": True,
            "message": "Instant cashout processed successfully",
            "data": {
                "transaction": transaction.dict(),
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
        
        # Parse JSON fields
        balance = json.loads(wallet['balance']) if isinstance(wallet['balance'], str) else wallet['balance']
        transactions = json.loads(wallet['transactions']) if isinstance(wallet['transactions'], str) else wallet['transactions']
        
        if balance['available'] < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Calculate fees
        is_pro_user = False
        fee_calc = {"fee_amount": 0, "net_amount": request.amount, "rate": 0, "type": "standard"} if is_pro_user else wallet_service.calculate_cashout_fee(request.amount, request.method, False)
        
        # Create transaction
        transaction = Transaction(
            type="cashout",
            amount=request.amount,
            method=request.method,
            fee=TransactionFee(
                amount=fee_calc["fee_amount"],
                type="percentage",
                rate=fee_calc["rate"]
            ),
            net_amount=fee_calc["net_amount"],
            status="pending",
            metadata=TransactionMetadata(**request.method_details.dict(), instant=False),
            description=f"Standard cashout to {request.method}"
        )
        
        # Move amount to reserved
        balance['available'] -= request.amount
        balance['reserved'] += request.amount
        transactions.append(transaction.dict())
        
        supabase.table('wallets').update({
            "balance": json.dumps(balance),
            "transactions": json.dumps(transactions)
        }).eq('user_id', user_id).execute()
        
        estimated_arrival = datetime.now(timezone.utc) + timedelta(days=3)
        
        return {
            "success": True,
            "message": "Standard cashout initiated",
            "data": {
                "transaction": transaction.dict(),
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
        
        # Parse JSON fields
        balance = json.loads(wallet['balance']) if isinstance(wallet['balance'], str) else wallet['balance']
        financial_products = json.loads(wallet['financial_products']) if isinstance(wallet['financial_products'], str) else wallet['financial_products']
        transactions = json.loads(wallet['transactions']) if isinstance(wallet['transactions'], str) else wallet['transactions']
        
        if request.initial_amount > 0 and balance['available'] < request.initial_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        financial_products['savings']['enabled'] = True
        
        if request.initial_amount > 0:
            balance['available'] -= request.initial_amount
            financial_products['savings']['balance'] += request.initial_amount
            
            # Record transaction
            transaction = Transaction(
                type="transfer",
                amount=request.initial_amount,
                method="wallet_balance",
                description="Transfer to savings account",
                status="completed",
                completed_at=datetime.now(timezone.utc)
            )
            transactions.append(transaction.dict())
        
        supabase.table('wallets').update({
            "balance": json.dumps(balance),
            "financial_products": json.dumps(financial_products),
            "transactions": json.dumps(transactions)
        }).eq('user_id', user_id).execute()
        
        return {
            "success": True,
            "message": "Savings account setup successfully",
            "data": {
                "savings_balance": financial_products['savings']['balance'],
                "interest_rate": financial_products['savings']['interest_rate']
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
        
        # Parse JSON fields
        balance = json.loads(wallet['balance']) if isinstance(wallet['balance'], str) else wallet['balance']
        financial_products = json.loads(wallet['financial_products']) if isinstance(wallet['financial_products'], str) else wallet['financial_products']
        transactions = json.loads(wallet['transactions']) if isinstance(wallet['transactions'], str) else wallet['transactions']
        stats = json.loads(wallet['stats']) if isinstance(wallet['stats'], str) else wallet['stats']
        
        # Simple credit score calculation
        credit_score = 650  # Base score
        if len(transactions) > 10:
            credit_score += 50
        if stats['total_earned'] > 1000:
            credit_score += 30
        
        max_credit = credit_score * 100
        current_used = financial_products['credit']['used']
        
        if request.amount > (max_credit - current_used):
            raise HTTPException(status_code=400, detail="Credit limit exceeded")
        
        financial_products['credit']['used'] += request.amount
        balance['available'] += request.amount
        
        transaction = Transaction(
            type="deposit",
            amount=request.amount,
            method="credit",
            description=f"Credit advance for: {request.purpose}",
            status="completed",
            completed_at=datetime.now(timezone.utc)
        )
        transactions.append(transaction.dict())
        
        supabase.table('wallets').update({
            "balance": json.dumps(balance),
            "financial_products": json.dumps(financial_products),
            "transactions": json.dumps(transactions)
        }).eq('user_id', user_id).execute()
        
        repayment_date = datetime.now(timezone.utc) + timedelta(days=30)
        
        return {
            "success": True,
            "message": "Credit request processed",
            "data": {
                "credit_used": financial_products['credit']['used'],
                "available_credit": max_credit - financial_products['credit']['used'],
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
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        # Parse JSON fields
        payment_methods = json.loads(wallet['payment_methods']) if isinstance(wallet['payment_methods'], str) else wallet['payment_methods']
        
        payment_method = PaymentMethod(
            type=request.type,
            details=request.details,
            verified=False
        )
        
        # If first method, set as default
        if len(payment_methods) == 0:
            payment_method.is_default = True
        
        payment_methods.append(payment_method.dict())
        
        supabase.table('wallets').update({
            "payment_methods": json.dumps(payment_methods)
        }).eq('user_id', user_id).execute()
        
        return {
            "success": True,
            "message": "Payment method added successfully",
            "data": payment_method.dict()
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/transactions")
async def get_transactions(page: int = 1, limit: int = 20, type: Optional[str] = None, user_id: str = Depends(get_current_user_id)):
    """Get transaction history"""
    try:
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        # Parse transactions
        transactions = json.loads(wallet['transactions']) if isinstance(wallet['transactions'], str) else wallet['transactions']
        
        # Filter by type if provided
        if type:
            transactions = [t for t in transactions if t.get('type') == type]
        
        # Sort by date (newest first)
        transactions.sort(key=lambda t: t.get('created_at', ''), reverse=True)
        
        # Paginate
        start_index = (page - 1) * limit
        end_index = page * limit
        paginated_transactions = transactions[start_index:end_index]
        
        return {
            "success": True,
            "data": {
                "transactions": paginated_transactions,
                "pagination": {
                    "current": page,
                    "total": (len(transactions) + limit - 1) // limit,
                    "total_transactions": len(transactions)
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
