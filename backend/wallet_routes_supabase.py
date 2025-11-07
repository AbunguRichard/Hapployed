"""
Wallet Routes - Supabase PostgreSQL Version
Handles wallet management, balances, and transactions
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

from supabase_client import get_supabase_admin

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])

class WalletCreate(BaseModel):
    user_id: str

class TransactionCreate(BaseModel):
    wallet_id: str
    transaction_type: str  # 'credit', 'debit', 'withdrawal', 'deposit'
    amount: float
    description: Optional[str] = None
    reference_id: Optional[str] = None

@router.post("/create")
async def create_wallet(wallet: WalletCreate):
    """Create a new wallet for user"""
    try:
        supabase = get_supabase_admin()
        
        # Check if wallet exists
        existing = supabase.table('wallets').select('id').eq('user_id', wallet.user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            return {"success": True, "wallet": existing.data[0], "message": "Wallet already exists"}
        
        wallet_id = str(uuid.uuid4())
        wallet_data = {
            "id": wallet_id,
            "user_id": wallet.user_id,
            "balance": 0.0,
            "available_balance": 0.0,
            "pending_balance": 0.0,
            "total_earned": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table('wallets').insert(wallet_data).execute()
        
        return {"success": True, "wallet": result.data[0]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create wallet: {str(e)}")

@router.get("/{user_id}")
async def get_wallet(user_id: str):
    """Get wallet by user ID"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('wallets').select('*').eq('user_id', user_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        return {"success": True, "wallet": result.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get wallet: {str(e)}")

@router.post("/transaction")
async def create_transaction(transaction: TransactionCreate):
    """Create a new transaction"""
    try:
        supabase = get_supabase_admin()
        
        trans_id = str(uuid.uuid4())
        trans_data = {
            "id": trans_id,
            "wallet_id": transaction.wallet_id,
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "description": transaction.description,
            "status": "completed",
            "reference_id": transaction.reference_id,
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = supabase.table('transactions').insert(trans_data).execute()
        
        # Update wallet balance
        wallet = supabase.table('wallets').select('*').eq('id', transaction.wallet_id).execute()
        
        if wallet.data and len(wallet.data) > 0:
            current_balance = wallet.data[0]['balance']
            
            if transaction.transaction_type in ['credit', 'deposit']:
                new_balance = current_balance + transaction.amount
            else:
                new_balance = current_balance - transaction.amount
            
            supabase.table('wallets').update({
                "balance": new_balance,
                "available_balance": new_balance,
                "updated_at": datetime.utcnow().isoformat()
            }).eq('id', transaction.wallet_id).execute()
        
        return {"success": True, "transaction": result.data[0]}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create transaction: {str(e)}")

@router.get("/transactions/{wallet_id}")
async def get_transactions(wallet_id: str, limit: int = 50):
    """Get wallet transactions"""
    try:
        supabase = get_supabase_admin()
        
        result = supabase.table('transactions').select('*').eq('wallet_id', wallet_id).order('created_at', desc=True).limit(limit).execute()
        
        return {"success": True, "transactions": result.data if result.data else []}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get transactions: {str(e)}")
