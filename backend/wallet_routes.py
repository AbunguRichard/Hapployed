from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timedelta, timezone
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database(os.getenv('DB_NAME', 'test_database'))

# Collections
wallets_collection = db.wallets

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

class Wallet(BaseModel):
    user_id: str
    balance: Balance = Balance()
    currency: str = "USD"
    transactions: List[Transaction] = []
    payment_methods: List[PaymentMethod] = []
    settings: WalletSettings = WalletSettings()
    limits: WalletLimits = WalletLimits()
    financial_products: FinancialProducts = FinancialProducts()
    stats: WalletStats = WalletStats()
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
        wallet_data = await wallets_collection.find_one({"user_id": user_id})
        
        if not wallet_data:
            # Create new wallet
            new_wallet = Wallet(user_id=user_id)
            wallet_dict = new_wallet.dict()
            wallet_dict["_id"] = user_id  # Use user_id as _id for easy lookup
            await wallets_collection.insert_one(wallet_dict)
            return wallet_dict
        
        return wallet_data
    
    @staticmethod
    async def process_instant_cashout(user_id: str, amount: float, method: str, method_details: Dict) -> Dict:
        """Process instant cashout with fees"""
        wallet = await WalletService.get_or_create_wallet(user_id)
        
        # Check balance
        if wallet["balance"]["available"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Check daily limit
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_cashouts = sum(
            t["amount"] for t in wallet["transactions"]
            if t["type"] == "cashout" and 
            datetime.fromisoformat(t["created_at"].replace("Z", "+00:00")) >= today and
            t["status"] == "completed"
        )
        
        if today_cashouts + amount > wallet["limits"]["daily_cashout"]:
            raise HTTPException(status_code=400, detail="Daily cashout limit exceeded")
        
        # Calculate fees
        fee_calc = WalletService.calculate_cashout_fee(amount, method, True)
        
        # Create transaction
        transaction = Transaction(
            type="cashout",
            amount=amount,
            method=method,
            fee=TransactionFee(
                amount=fee_calc["fee_amount"],
                type="percentage",
                rate=fee_calc["rate"]
            ),
            net_amount=fee_calc["net_amount"],
            status="completed",
            metadata=TransactionMetadata(**method_details, instant=True),
            description=f"Instant cashout to {method}",
            completed_at=datetime.now(timezone.utc)
        )
        
        # Update wallet
        wallet["balance"]["available"] -= amount
        wallet["transactions"].append(transaction.dict())
        wallet["stats"]["total_withdrawn"] += amount
        wallet["stats"]["total_fees"] += fee_calc["fee_amount"]
        wallet["stats"]["last_cashout"] = datetime.now(timezone.utc).isoformat()
        
        await wallets_collection.update_one(
            {"user_id": user_id},
            {"$set": wallet}
        )
        
        return {
            "success": True,
            "transaction": transaction.dict(),
            "fee": fee_calc["fee_amount"],
            "net_amount": fee_calc["net_amount"]
        }
    
    @staticmethod
    async def process_standard_cashout(user_id: str, amount: float, method: str, method_details: Dict, is_pro_user: bool = False) -> Dict:
        """Process standard cashout (2-3 business days)"""
        wallet = await WalletService.get_or_create_wallet(user_id)
        
        if wallet["balance"]["available"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Pro users get free cashouts
        fee_calc = {"fee_amount": 0, "net_amount": amount, "rate": 0, "type": "standard"} if is_pro_user else WalletService.calculate_cashout_fee(amount, method, False)
        
        transaction = Transaction(
            type="cashout",
            amount=amount,
            method=method,
            fee=TransactionFee(
                amount=fee_calc["fee_amount"],
                type="percentage",
                rate=fee_calc["rate"]
            ),
            net_amount=fee_calc["net_amount"],
            status="pending",
            metadata=TransactionMetadata(**method_details, instant=False),
            description=f"Standard cashout to {method}"
        )
        
        # Move amount to reserved
        wallet["balance"]["available"] -= amount
        wallet["balance"]["reserved"] += amount
        wallet["transactions"].append(transaction.dict())
        
        await wallets_collection.update_one(
            {"user_id": user_id},
            {"$set": wallet}
        )
        
        estimated_arrival = datetime.now(timezone.utc) + timedelta(days=3)
        
        return {
            "success": True,
            "transaction": transaction.dict(),
            "fee": fee_calc["fee_amount"],
            "net_amount": fee_calc["net_amount"],
            "estimated_arrival": estimated_arrival.isoformat()
        }
    
    @staticmethod
    async def setup_savings(user_id: str, initial_amount: float = 0.0) -> Dict:
        """Setup savings account"""
        wallet = await WalletService.get_or_create_wallet(user_id)
        
        if initial_amount > 0 and wallet["balance"]["available"] < initial_amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        wallet["financial_products"]["savings"]["enabled"] = True
        
        if initial_amount > 0:
            wallet["balance"]["available"] -= initial_amount
            wallet["financial_products"]["savings"]["balance"] += initial_amount
            
            # Record transaction
            transaction = Transaction(
                type="transfer",
                amount=initial_amount,
                method="wallet_balance",
                description="Transfer to savings account",
                status="completed",
                completed_at=datetime.now(timezone.utc)
            )
            wallet["transactions"].append(transaction.dict())
        
        await wallets_collection.update_one(
            {"user_id": user_id},
            {"$set": wallet}
        )
        
        return {
            "success": True,
            "savings_balance": wallet["financial_products"]["savings"]["balance"],
            "interest_rate": wallet["financial_products"]["savings"]["interest_rate"]
        }
    
    @staticmethod
    async def request_credit(user_id: str, amount: float, purpose: str) -> Dict:
        """Request credit advance"""
        wallet = await WalletService.get_or_create_wallet(user_id)
        
        # Simple credit score calculation
        credit_score = 650  # Base score
        if len(wallet["transactions"]) > 10:
            credit_score += 50
        if wallet["stats"]["total_earned"] > 1000:
            credit_score += 30
        
        max_credit = credit_score * 100
        current_used = wallet["financial_products"]["credit"]["used"]
        
        if amount > (max_credit - current_used):
            raise HTTPException(status_code=400, detail="Credit limit exceeded")
        
        wallet["financial_products"]["credit"]["used"] += amount
        wallet["balance"]["available"] += amount
        
        transaction = Transaction(
            type="deposit",
            amount=amount,
            method="credit",
            description=f"Credit advance for: {purpose}",
            status="completed",
            completed_at=datetime.now(timezone.utc)
        )
        wallet["transactions"].append(transaction.dict())
        
        await wallets_collection.update_one(
            {"user_id": user_id},
            {"$set": wallet}
        )
        
        repayment_date = datetime.now(timezone.utc) + timedelta(days=30)
        
        return {
            "success": True,
            "credit_used": wallet["financial_products"]["credit"]["used"],
            "available_credit": max_credit - wallet["financial_products"]["credit"]["used"],
            "repayment_date": repayment_date.isoformat()
        }

wallet_service = WalletService()

# ============================================================================
# ROUTES
# ============================================================================

def get_current_user_id():
    """Mock function - replace with actual JWT auth"""
    # This should extract user_id from JWT token
    return "demo-user-123"

@router.get("/")
async def get_wallet(user_id: str = Depends(get_current_user_id)):
    """Get wallet overview"""
    try:
        wallet = await wallet_service.get_or_create_wallet(user_id)
        return {
            "success": True,
            "data": wallet
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cashout/instant")
async def instant_cashout(request: CashoutRequest, user_id: str = Depends(get_current_user_id)):
    """Process instant cashout"""
    try:
        result = await wallet_service.process_instant_cashout(
            user_id,
            request.amount,
            request.method,
            request.method_details.dict()
        )
        return {
            "success": True,
            "message": "Instant cashout processed successfully",
            "data": result
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cashout/standard")
async def standard_cashout(request: CashoutRequest, user_id: str = Depends(get_current_user_id)):
    """Process standard cashout"""
    try:
        # Check if user is pro (implement your own logic)
        is_pro_user = False
        
        result = await wallet_service.process_standard_cashout(
            user_id,
            request.amount,
            request.method,
            request.method_details.dict(),
            is_pro_user
        )
        return {
            "success": True,
            "message": "Standard cashout initiated",
            "data": result
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

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

@router.post("/savings/setup")
async def setup_savings(request: SavingsSetupRequest, user_id: str = Depends(get_current_user_id)):
    """Setup savings account"""
    try:
        result = await wallet_service.setup_savings(user_id, request.initial_amount)
        return {
            "success": True,
            "message": "Savings account setup successfully",
            "data": result
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/credit/request")
async def request_credit(request: CreditRequest, user_id: str = Depends(get_current_user_id)):
    """Request credit advance"""
    try:
        result = await wallet_service.request_credit(user_id, request.amount, request.purpose)
        return {
            "success": True,
            "message": "Credit request processed",
            "data": result
        }
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/payment-methods")
async def add_payment_method(request: AddPaymentMethodRequest, user_id: str = Depends(get_current_user_id)):
    """Add payment method"""
    try:
        wallet = await wallet_service.get_or_create_wallet(user_id)
        
        payment_method = PaymentMethod(
            type=request.type,
            details=request.details,
            verified=False
        )
        
        # If first method, set as default
        if len(wallet["payment_methods"]) == 0:
            payment_method.is_default = True
        
        wallet["payment_methods"].append(payment_method.dict())
        
        await wallets_collection.update_one(
            {"user_id": user_id},
            {"$set": wallet}
        )
        
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
        
        transactions = wallet["transactions"]
        
        # Filter by type if provided
        if type:
            transactions = [t for t in transactions if t["type"] == type]
        
        # Sort by date (newest first)
        transactions.sort(key=lambda t: t["created_at"], reverse=True)
        
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
