"""
Authentication Routes - Updated for Supabase
Handles user registration, login, and JWT token management
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import os
import uuid

# Import Supabase client
from supabase_client import supabase, get_supabase_client, get_supabase_admin

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Environment variables
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
USE_MOCK_AUTH = os.environ.get('USE_MOCK_AUTH', 'false').lower() == 'true'

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str
    role: str = Field(..., pattern="^(worker|employer)$")
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RefreshTokenRequest(BaseModel):
    refresh_token: str

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to get current authenticated user from JWT token"""
    if USE_MOCK_AUTH:
        # Mock mode for local dev
        return {
            "id": "mock-user-id",
            "email": "mock@test.com",
            "roles": ["worker", "employer"],
            "currentMode": "worker",
            "name": "Mock User"
        }
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Get user from Supabase using admin client
        supabase_admin = get_supabase_admin()
        response = supabase_admin.table('users').select('*').eq('id', user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=401, detail="User not found")
        
        user = response.data[0]
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

# Routes

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register a new user
    Creates user account with hashed password and initial profile
    """
    try:
        # Use admin client to bypass RLS for registration
        supabase_admin = get_supabase_admin()
        
        # Check if user already exists
        existing_user = supabase_admin.table('users').select('id').eq('email', user_data.email).execute()
        
        if existing_user.data and len(existing_user.data) > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_data.password)
        
        # Determine roles array based on role
        roles = [user_data.role]
        
        new_user = {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "password_hash": hashed_password,
            "roles": roles,
            "current_mode": user_data.role,
            "is_verified": False,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Insert user into database
        result = supabase_admin.table('users').insert(new_user).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
        
        created_user = result.data[0]
        
        # Create worker profile if role is worker
        if user_data.role == "worker":
            worker_profile = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "name": user_data.name,
                "email": user_data.email,
                "skills": [],
                "hourly_rate": 0.0,
                "experience_level": "Entry",
                "rating": 0.0,
                "completed_jobs": 0,
                "is_available": True,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            supabase_admin.table('worker_profiles').insert(worker_profile).execute()
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user_id})
        refresh_token = create_refresh_token(data={"sub": user_id})
        
        # Prepare user response (exclude password_hash)
        user_response = {
            "id": created_user["id"],
            "email": created_user["email"],
            "name": created_user["name"],
            "roles": created_user["roles"],
            "currentMode": created_user["current_mode"],
            "isVerified": created_user.get("is_verified", False)
        }
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Authenticate user and return JWT tokens
    """
    try:
        # Use admin client to bypass RLS for login
        supabase_admin = get_supabase_admin()
        
        # Get user by email
        response = supabase_admin.table('users').select('*').eq('email', credentials.email).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        user = response.data[0]
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account has been deactivated"
            )
        
        # Update last login (if column exists, otherwise skip)
        try:
            supabase_admin.table('users').update({
                "last_login": datetime.utcnow().isoformat()
            }).eq('id', user["id"]).execute()
        except Exception as e:
            # Column might not exist yet, skip silently
            print(f"Note: Could not update last_login: {e}")
        
        # Generate tokens
        access_token = create_access_token(data={"sub": user["id"]})
        refresh_token = create_refresh_token(data={"sub": user["id"]})
        
        # Prepare user response (exclude password_hash)
        user_response = {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "roles": user["roles"],
            "currentMode": user["current_mode"],
            "isVerified": user.get("is_verified", False),
            "phone": user.get("phone"),
            "avatarUrl": user.get("avatar_url")
        }
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    """
    try:
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        
        # Get user from database using admin client
        supabase_admin = get_supabase_admin()
        response = supabase_admin.table('users').select('*').eq('id', user_id).execute()
        
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=401, detail="User not found")
        
        user = response.data[0]
        
        # Generate new tokens
        new_access_token = create_access_token(data={"sub": user_id})
        new_refresh_token = create_refresh_token(data={"sub": user_id})
        
        # Prepare user response
        user_response = {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "roles": user["roles"],
            "currentMode": user["current_mode"],
            "isVerified": user.get("is_verified", False)
        }
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            user=user_response
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token refresh failed: {str(e)}")

@router.get("/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "name": current_user["name"],
        "roles": current_user["roles"],
        "currentMode": current_user["current_mode"],
        "isVerified": current_user.get("is_verified", False),
        "phone": current_user.get("phone"),
        "avatarUrl": current_user.get("avatar_url")
    }

@router.post("/logout")
async def logout():
    """
    Logout user (client should remove tokens)
    """
    return {"message": "Successfully logged out"}

@router.delete("/cleanup-incomplete/{email}")
async def cleanup_incomplete_registration(email: str):
    """
    Delete incomplete registration to allow re-registration
    Use this if a user's registration was interrupted
    """
    try:
        supabase_admin = get_supabase_admin()
        
        # Find user by email
        user_response = supabase_admin.table('users').select('id').eq('email', email).execute()
        
        if not user_response.data or len(user_response.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        user_id = user_response.data[0]['id']
        
        # Delete worker profile first (foreign key constraint)
        supabase_admin.table('worker_profiles').delete().eq('user_id', user_id).execute()
        
        # Delete user
        supabase_admin.table('users').delete().eq('id', user_id).execute()
        
        return {"message": f"User {email} deleted successfully. Can now re-register."}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cleanup failed: {str(e)}"
        )
