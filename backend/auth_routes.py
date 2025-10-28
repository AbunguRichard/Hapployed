from fastapi import APIRouter, HTTPException, status, Depends, Response, Request, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/auth")
security = HTTPBearer()

# Environment variables
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
USE_MOCK_AUTH = os.environ.get('USE_MOCK_AUTH', 'false').lower() == 'true'

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client[os.environ.get('DB_NAME', 'test_database')]
users_collection = db['users']

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic Models
class WorkerProfile(BaseModel):
    skills: List[str] = []
    location: Optional[str] = None
    hourlyRate: Optional[float] = None
    availability: str = "available"
    rating: float = 0.0
    completedJobs: int = 0
    videoUrl: Optional[str] = None
    bio: Optional[str] = None
    resume: Optional[str] = None

class EmployerProfile(BaseModel):
    companyName: Optional[str] = None
    companySize: Optional[str] = None
    verified: bool = False
    billingStatus: str = "active"
    industry: Optional[str] = None

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
            "name": "Mock User"
        }
    
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    # Fetch user from database
    user = await users_collection.find_one({"_id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Convert MongoDB document to dict and remove password
    user['id'] = user.pop('_id')
    user.pop('password_hash', None)
    
    return user

def require_role(required_roles: List[str]):
    """Dependency to check if user has required role"""
    async def role_checker(user: dict = Depends(get_current_user)):
        user_roles = user.get("roles", [])
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"User does not have required role. Required: {required_roles}"
            )
        return user
    return role_checker

# Routes
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user with specified role (worker or employer)"""
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_id = str(uuid.uuid4())
    user_doc = {
        "_id": user_id,
        "email": user_data.email,
        "password_hash": get_password_hash(user_data.password),
        "name": user_data.name,
        "roles": [user_data.role],
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # Initialize role-specific profile
    if user_data.role == "worker":
        user_doc["worker_profile"] = WorkerProfile().dict()
        user_doc["worker_profile"]["profileComplete"] = False
    elif user_data.role == "employer":
        user_doc["employer_profile"] = EmployerProfile().dict()
        user_doc["employer_profile"]["profileComplete"] = False
    
    # Insert user
    await users_collection.insert_one(user_doc)
    
    # Create tokens
    access_token = create_access_token(data={"sub": user_id})
    refresh_token = create_refresh_token(data={"sub": user_id})
    
    # Prepare user response (without password)
    user_response = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "roles": [user_data.role]
    }
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response):
    """Login user and return JWT tokens"""
    # Find user
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create tokens
    user_id = user["_id"]
    access_token = create_access_token(data={"sub": user_id})
    refresh_token = create_refresh_token(data={"sub": user_id})
    
    # Set HTTP-only cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=os.environ.get('ENVIRONMENT', 'development') == 'production',
        samesite="lax",
        max_age=60 * 60 * 24 * 7  # 7 days
    )
    
    # Prepare user response
    user_response = {
        "id": user_id,
        "email": user["email"],
        "name": user.get("name", ""),
        "roles": user.get("roles", []),
        "worker_profile": user.get("worker_profile"),
        "employer_profile": user.get("employer_profile")
    }
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: Request, token_data: Optional[RefreshTokenRequest] = None):
    """Refresh access token using refresh token"""
    # Get refresh token from cookie or body
    refresh_token = None
    if token_data and token_data.refresh_token:
        refresh_token = token_data.refresh_token
    else:
        refresh_token = request.cookies.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided"
        )
    
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate refresh token"
        )
    
    # Fetch user
    user = await users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new tokens
    new_access_token = create_access_token(data={"sub": user_id})
    new_refresh_token = create_refresh_token(data={"sub": user_id})
    
    # Prepare user response
    user_response = {
        "id": user_id,
        "email": user["email"],
        "name": user.get("name", ""),
        "roles": user.get("roles", []),
        "worker_profile": user.get("worker_profile"),
        "employer_profile": user.get("employer_profile")
    }
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/logout")
async def logout(response: Response):
    """Logout user by clearing refresh token cookie"""
    response.delete_cookie(key="refresh_token")
    return {"message": "Successfully logged out"}

@router.get("/me")
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current authenticated user information with mode and profile status"""
    user_id = user["id"]
    
    # Fetch latest user data to ensure we have currentMode
    user_doc = await users_collection.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare response with all necessary fields
    response = {
        "id": user_id,
        "email": user_doc.get("email"),
        "name": user_doc.get("name"),
        "roles": user_doc.get("roles", []),
        "currentMode": user_doc.get("currentMode", user_doc.get("roles", ["worker"])[0] if user_doc.get("roles") else "worker"),
        "worker_profile": user_doc.get("worker_profile"),
        "employer_profile": user_doc.get("employer_profile"),
        "profileComplete": {
            "worker": user_doc.get("worker_profile", {}).get("profileComplete", False) if "worker" in user_doc.get("roles", []) else None,
            "employer": user_doc.get("employer_profile", {}).get("profileComplete", False) if "employer" in user_doc.get("roles", []) else None
        }
    }
    
    return response

@router.post("/add-role")
async def add_secondary_role(
    role: str = Body(..., pattern="^(worker|employer)$", embed=True),
    user: dict = Depends(get_current_user)
):
    """Add secondary role to user (worker can become employer, vice versa)"""
    user_id = user["id"]
    current_roles = user.get("roles", [])
    
    if role in current_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User already has {role} role"
        )
    
    # Add new role
    update_doc = {
        "roles": current_roles + [role],
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    # Initialize profile for new role
    if role == "worker" and "worker_profile" not in user:
        update_doc["worker_profile"] = WorkerProfile().dict()
        update_doc["worker_profile"]["profileComplete"] = False
    elif role == "employer" and "employer_profile" not in user:
        update_doc["employer_profile"] = EmployerProfile().dict()
        update_doc["employer_profile"]["profileComplete"] = False
    
    await users_collection.update_one(
        {"_id": user_id},
        {"$set": update_doc}
    )
    
    return {"message": f"Successfully added {role} role", "roles": update_doc["roles"]}

@router.patch("/profile/{profile_type}")
async def update_profile(
    profile_type: str,
    profile_data: dict,
    user: dict = Depends(get_current_user)
):
    """Update worker or employer profile"""
    if profile_type not in ["worker", "employer"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile type must be 'worker' or 'employer'"
        )
    
    # Check if user has this role
    if profile_type not in user.get("roles", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User does not have {profile_type} role"
        )
    
    profile_key = f"{profile_type}_profile"
    update_doc = {
        profile_key: {**user.get(profile_key, {}), **profile_data},
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    await users_collection.update_one(
        {"_id": user["id"]},
        {"$set": update_doc}
    )
    
    return {"message": f"Successfully updated {profile_type} profile"}
