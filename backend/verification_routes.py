from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Literal
from datetime import datetime, timedelta, timezone
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

router = APIRouter(prefix="/api/verification", tags=["Verification"])

# Helper function to convert MongoDB ObjectId to string
def convert_objectid(doc):
    """Recursively convert ObjectId to string in document"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [convert_objectid(item) for item in doc]
    if isinstance(doc, dict):
        return {key: str(value) if isinstance(value, ObjectId) else convert_objectid(value) 
                for key, value in doc.items()}
    return doc

# MongoDB connection
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database(os.getenv('DB_NAME', 'test_database'))

# Collections
verifications_collection = db.verifications
users_collection = db.users
assessments_collection = db.skill_assessments

# ============================================================================
# MODELS
# ============================================================================

class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["id", "address", "portfolio", "certificate", "education", "work_reference"]
    file_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: Literal["pending", "approved", "rejected"] = "pending"
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None

class IdentityVerification(BaseModel):
    verified: bool = False
    verified_at: Optional[datetime] = None
    method: Optional[str] = None
    score: Optional[float] = None

class EmailVerification(BaseModel):
    verified: bool = False
    verified_at: Optional[datetime] = None

class PhoneVerification(BaseModel):
    verified: bool = False
    verified_at: Optional[datetime] = None

class SkillBadge(BaseModel):
    name: str
    icon: str
    level: str

class SkillVerificationItem(BaseModel):
    skill: str
    verified: bool = False
    verified_at: Optional[datetime] = None
    method: Optional[str] = None
    score: Optional[float] = None
    badge: Optional[SkillBadge] = None

class WorkReference(BaseModel):
    name: str
    email: str
    company: str
    position: str
    verified: bool = False

class WorkHistoryVerification(BaseModel):
    verified: bool = False
    verified_at: Optional[datetime] = None
    references: List[WorkReference] = []

class EducationInstitution(BaseModel):
    name: str
    degree: str
    year: int
    verified: bool = False

class EducationVerification(BaseModel):
    verified: bool = False
    verified_at: Optional[datetime] = None
    institutions: List[EducationInstitution] = []

class Verifications(BaseModel):
    identity: IdentityVerification = IdentityVerification()
    email: EmailVerification = EmailVerification()
    phone: PhoneVerification = PhoneVerification()
    skills: List[SkillVerificationItem] = []
    work_history: WorkHistoryVerification = WorkHistoryVerification()
    education: EducationVerification = EducationVerification()

class TrustScore(BaseModel):
    overall: float = 0.0
    identity: float = 0.0
    skills: float = 0.0
    experience: float = 0.0
    reputation: float = 0.0
    last_calculated: Optional[datetime] = None

class Badge(BaseModel):
    type: Literal["identity", "skill", "experience", "premium"]
    name: str
    icon: str
    description: str
    earned_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class ReviewHistoryItem(BaseModel):
    reviewer_id: str
    action: str
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Verification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    level: Literal["basic", "verified", "premium", "expert"] = "basic"
    status: Literal["not_started", "in_progress", "pending_review", "approved", "rejected", "suspended"] = "not_started"
    documents: List[Document] = []
    verifications: Verifications = Verifications()
    trust_score: TrustScore = TrustScore()
    badges: List[Badge] = []
    review_history: List[ReviewHistoryItem] = []
    submitted_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    next_review_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Request Models
class StartVerificationRequest(BaseModel):
    level: Literal["basic", "verified", "premium", "expert"] = "verified"

class UploadDocumentRequest(BaseModel):
    type: Literal["id", "address", "portfolio", "certificate", "education", "work_reference"]
    file_url: str
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None

class VerifyIdentityRequest(BaseModel):
    document_id: str

class VerifySkillRequest(BaseModel):
    skill: str
    method: Literal["assessment", "portfolio", "certification"] = "assessment"

class AddWorkReferenceRequest(BaseModel):
    name: str
    email: str
    company: str
    position: str

class ReviewVerificationRequest(BaseModel):
    action: Literal["approve", "reject", "request_changes"]
    notes: Optional[str] = None

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_verification_requirements(level: str) -> Dict:
    """Get verification requirements for each level"""
    requirements = {
        "basic": {
            "identity": False,
            "email": True,
            "skills": 0
        },
        "verified": {
            "identity": True,
            "email": True,
            "phone": True,
            "skills": 2,
            "trust_score": 70
        },
        "premium": {
            "identity": True,
            "email": True,
            "phone": True,
            "skills": 5,
            "work_history": True,
            "trust_score": 85
        },
        "expert": {
            "identity": True,
            "email": True,
            "phone": True,
            "skills": 8,
            "work_history": True,
            "education": True,
            "trust_score": 95
        }
    }
    return requirements.get(level, requirements["basic"])

def check_requirements(verification: Dict, requirements: Dict) -> bool:
    """Check if verification meets requirements"""
    verifs = verification.get("verifications", {})
    
    if requirements.get("identity") and not verifs.get("identity", {}).get("verified", False):
        return False
    
    if requirements.get("email") and not verifs.get("email", {}).get("verified", False):
        return False
    
    if requirements.get("phone") and not verifs.get("phone", {}).get("verified", False):
        return False
    
    if requirements.get("skills", 0) > 0:
        verified_skills = sum(1 for s in verifs.get("skills", []) if s.get("verified", False))
        if verified_skills < requirements["skills"]:
            return False
    
    if requirements.get("trust_score", 0) > verification.get("trust_score", {}).get("overall", 0):
        return False
    
    return True

def calculate_progress(verification: Dict, requirements: Dict) -> int:
    """Calculate verification progress percentage"""
    completed = 0
    total = len(requirements)
    
    verifs = verification.get("verifications", {})
    
    if requirements.get("identity") and verifs.get("identity", {}).get("verified", False):
        completed += 1
    if requirements.get("email") and verifs.get("email", {}).get("verified", False):
        completed += 1
    if requirements.get("phone") and verifs.get("phone", {}).get("verified", False):
        completed += 1
    
    if requirements.get("skills", 0) > 0:
        verified_skills = sum(1 for s in verifs.get("skills", []) if s.get("verified", False))
        if verified_skills >= requirements["skills"]:
            completed += 1
    
    if requirements.get("trust_score", 0) > 0:
        if verification.get("trust_score", {}).get("overall", 0) >= requirements["trust_score"]:
            completed += 1
    
    return round((completed / total) * 100) if total > 0 else 0

def get_next_steps(verification: Dict, requirements: Dict) -> List[str]:
    """Get next steps for verification"""
    next_steps = []
    verifs = verification.get("verifications", {})
    
    if requirements.get("identity") and not verifs.get("identity", {}).get("verified", False):
        next_steps.append("Verify your identity with government ID")
    
    if requirements.get("email") and not verifs.get("email", {}).get("verified", False):
        next_steps.append("Verify your email address")
    
    if requirements.get("phone") and not verifs.get("phone", {}).get("verified", False):
        next_steps.append("Verify your phone number")
    
    if requirements.get("skills", 0) > 0:
        verified_skills = sum(1 for s in verifs.get("skills", []) if s.get("verified", False))
        needed = requirements["skills"] - verified_skills
        if needed > 0:
            next_steps.append(f"Verify {needed} more skill{'s' if needed > 1 else ''}")
    
    if requirements.get("trust_score", 0) > 0:
        if verification.get("trust_score", {}).get("overall", 0) < requirements["trust_score"]:
            next_steps.append("Improve your trust score")
    
    return next_steps

async def calculate_trust_score(verification_id: str):
    """Calculate and update trust score"""
    verification = await verifications_collection.find_one({"id": verification_id})
    if not verification:
        return
    
    scores = {
        "identity": 0.0,
        "skills": 0.0,
        "experience": 0.0,
        "reputation": 0.0
    }
    
    verifs = verification.get("verifications", {})
    
    # Identity score (25%)
    if verifs.get("identity", {}).get("verified", False):
        scores["identity"] = 25.0
    
    # Skills score (35%)
    skill_count = sum(1 for s in verifs.get("skills", []) if s.get("verified", False))
    scores["skills"] = min(35.0, (skill_count / 10) * 35)
    
    # Experience score (25%)
    if verifs.get("work_history", {}).get("verified", False):
        scores["experience"] = 25.0
    
    # Reputation score (15%)
    user = await users_collection.find_one({"id": verification["user_id"]})
    if user:
        rating = user.get("profile", {}).get("rating", 0)
        if rating >= 4.5:
            scores["reputation"] = 15.0
        elif rating >= 4.0:
            scores["reputation"] = 12.0
        elif rating >= 3.5:
            scores["reputation"] = 8.0
        else:
            scores["reputation"] = 5.0
    
    trust_score = {
        "overall": sum(scores.values()),
        **scores,
        "last_calculated": datetime.now(timezone.utc)
    }
    
    await verifications_collection.update_one(
        {"id": verification_id},
        {"$set": {"trust_score": trust_score}}
    )

async def award_badge(user_id: str, badge_type: str, name: str):
    """Award a badge to user"""
    verification = await verifications_collection.find_one({"user_id": user_id})
    if not verification:
        return
    
    badge_configs = {
        "identity": {"icon": "🆔", "description": "Identity verified"},
        "skill": {"icon": "🎯", "description": "Skill verified"},
        "experience": {"icon": "💼", "description": "Experience verified"},
        "premium": {"icon": "⭐", "description": "Premium verified professional"}
    }
    
    config = badge_configs.get(badge_type, {})
    if not config:
        return
    
    # Remove existing badge of same type
    badges = [b for b in verification.get("badges", []) if b.get("type") != badge_type]
    
    new_badge = Badge(
        type=badge_type,
        name=name,
        icon=config["icon"],
        description=config["description"]
    )
    
    badges.append(new_badge.dict())
    
    await verifications_collection.update_one(
        {"user_id": user_id},
        {"$set": {"badges": badges}}
    )

async def perform_identity_check(document: Dict) -> Dict:
    """Simulate identity verification (would use real service in production)"""
    import random
    import asyncio
    
    await asyncio.sleep(1)  # Simulate processing
    
    # 80% success rate for demo
    success = random.random() > 0.2
    score = random.randint(60, 100) if success else random.randint(30, 60)
    
    return {
        "success": success,
        "score": score,
        "reason": "Document quality insufficient" if not success else None
    }

# ============================================================================
# VERIFICATION ROUTES
# ============================================================================

@router.post("/start")
async def start_verification(request: StartVerificationRequest, user_id: str = Query(...)):
    """Start verification process"""
    try:
        # Check if verification already exists
        existing = await verifications_collection.find_one({"user_id": user_id})
        if existing:
            raise HTTPException(status_code=400, detail="Verification already in progress")
        
        verification = Verification(
            user_id=user_id,
            level=request.level,
            status="in_progress"
        )
        
        await verifications_collection.insert_one(verification.dict())
        
        return {
            "success": True,
            "message": "Verification process started",
            "data": verification.dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/documents")
async def upload_document(request: UploadDocumentRequest, user_id: str = Query(...)):
    """Upload verification document"""
    try:
        verification = await verifications_collection.find_one({"user_id": user_id})
        if not verification:
            raise HTTPException(status_code=404, detail="No verification process started")
        
        document = Document(
            type=request.type,
            file_url=request.file_url,
            file_name=request.file_name,
            file_size=request.file_size,
            mime_type=request.mime_type
        )
        
        documents = verification.get("documents", []) + [document.dict()]
        
        await verifications_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "documents": documents,
                "status": "pending_review",
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        verification = await verifications_collection.find_one({"user_id": user_id})
        
        return {
            "success": True,
            "message": "Document uploaded successfully",
            "data": convert_objectid(verification)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/identity/verify")
async def verify_identity(request: VerifyIdentityRequest, user_id: str = Query(...)):
    """Verify identity with uploaded document"""
    try:
        verification = await verifications_collection.find_one({"user_id": user_id})
        if not verification:
            raise HTTPException(status_code=404, detail="No verification process started")
        
        # Find document
        document = None
        documents = verification.get("documents", [])
        for idx, doc in enumerate(documents):
            if doc.get("id") == request.document_id:
                document = doc
                doc_index = idx
                break
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Perform identity check
        check_result = await perform_identity_check(document)
        
        if check_result["success"]:
            documents[doc_index]["status"] = "approved"
            
            identity_verif = {
                "verified": True,
                "verified_at": datetime.now(timezone.utc),
                "method": "automated",
                "score": check_result["score"]
            }
            
            await verifications_collection.update_one(
                {"user_id": user_id},
                {"$set": {
                    "documents": documents,
                    "verifications.identity": identity_verif,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            # Calculate trust score and award badge
            await calculate_trust_score(verification["id"])
            await award_badge(user_id, "identity", "Verified Identity")
        else:
            documents[doc_index]["status"] = "rejected"
            documents[doc_index]["rejection_reason"] = check_result["reason"]
            
            await verifications_collection.update_one(
                {"user_id": user_id},
                {"$set": {
                    "documents": documents,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
        
        verification = await verifications_collection.find_one({"user_id": user_id})
        
        return {
            "success": True,
            "message": "Identity verified successfully" if check_result["success"] else "Identity verification failed",
            "data": convert_objectid(verification)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/skills/verify")
async def verify_skill(request: VerifySkillRequest, user_id: str = Query(...)):
    """Verify a skill"""
    try:
        verification = await verifications_collection.find_one({"user_id": user_id})
        if not verification:
            raise HTTPException(status_code=404, detail="No verification process started")
        
        verified = False
        score = 0.0
        badge = None
        
        if request.method == "assessment":
            # Check if user has passed assessment
            assessment = await assessments_collection.find_one({
                "user_id": user_id,
                "skill": {"$regex": request.skill, "$options": "i"},
                "passed": True
            })
            
            if assessment:
                verified = True
                score = assessment.get("score", 0)
                badge_data = assessment.get("badge")
                if badge_data:
                    badge = SkillBadge(**badge_data)
        
        elif request.method == "portfolio":
            # Simple portfolio check
            user = await users_collection.find_one({"id": user_id})
            has_portfolio = bool(user.get("profile", {}).get("portfolio"))
            
            if has_portfolio:
                verified = True
                score = 85.0
                badge = SkillBadge(
                    name=f"{request.skill} Portfolio Verified",
                    icon="🎨",
                    level="verified"
                )
        
        if verified:
            skills = verification.get("verifications", {}).get("skills", [])
            # Remove existing skill verification
            skills = [s for s in skills if s.get("skill") != request.skill]
            
            skill_verif = SkillVerificationItem(
                skill=request.skill,
                verified=True,
                verified_at=datetime.now(timezone.utc),
                method=request.method,
                score=score,
                badge=badge
            )
            
            skills.append(skill_verif.dict())
            
            await verifications_collection.update_one(
                {"user_id": user_id},
                {"$set": {
                    "verifications.skills": skills,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            
            # Calculate trust score and award badge
            await calculate_trust_score(verification["id"])
            await award_badge(user_id, "skill", f"{request.skill} Verified")
        
        verification = await verifications_collection.find_one({"user_id": user_id})
        
        return {
            "success": True,
            "message": "Skill verification completed",
            "data": convert_objectid(verification)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/complete")
async def complete_verification(user_id: str = Query(...)):
    """Complete verification process"""
    try:
        verification = await verifications_collection.find_one({"user_id": user_id})
        if not verification:
            raise HTTPException(status_code=404, detail="No verification process started")
        
        requirements = get_verification_requirements(verification["level"])
        completed = check_requirements(verification, requirements)
        
        if not completed:
            raise HTTPException(status_code=400, detail="Verification requirements not met")
        
        await verifications_collection.update_one(
            {"user_id": user_id},
            {"$set": {
                "status": "approved",
                "approved_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # Update user profile
        await users_collection.update_one(
            {"id": user_id},
            {"$set": {
                "profile.is_verified": True,
                "profile.verification_level": verification["level"],
                "profile.trust_score": verification.get("trust_score", {}).get("overall", 0)
            }}
        )
        
        # Award final badge
        await award_badge(user_id, "premium", "Verified Professional")
        
        verification = await verifications_collection.find_one({"user_id": user_id})
        
        return {
            "success": True,
            "message": "Verification completed successfully",
            "data": verification
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def get_verification_status(user_id: str = Query(...)):
    """Get user's verification status"""
    try:
        verification = await verifications_collection.find_one({"user_id": user_id})
        
        if not verification:
            return {
                "success": True,
                "data": {
                    "status": "not_started",
                    "progress": 0,
                    "next_steps": ["Start basic verification"]
                }
            }
        
        requirements = get_verification_requirements(verification["level"])
        progress = calculate_progress(verification, requirements)
        next_steps = get_next_steps(verification, requirements)
        
        return {
            "success": True,
            "data": {
                **verification,
                "progress": progress,
                "requirements": requirements,
                "next_steps": next_steps
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ADMIN ROUTES
# ============================================================================

@router.get("/admin/stats")
async def get_verification_stats():
    """Get verification statistics (admin only)"""
    try:
        total = await verifications_collection.count_documents({})
        pending = await verifications_collection.count_documents({"status": "pending_review"})
        approved = await verifications_collection.count_documents({"status": "approved"})
        
        # Aggregate by level
        pipeline = [
            {
                "$group": {
                    "_id": "$level",
                    "count": {"$sum": 1},
                    "avg_trust_score": {"$avg": "$trust_score.overall"}
                }
            }
        ]
        by_level = await verifications_collection.aggregate(pipeline).to_list(None)
        
        return {
            "success": True,
            "data": {
                "total": total,
                "pending": pending,
                "by_level": by_level,
                "approval_rate": (approved / total * 100) if total > 0 else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/review/{verification_id}")
async def review_verification(
    verification_id: str,
    request: ReviewVerificationRequest,
    reviewer_id: str = Query(...)
):
    """Review verification (admin only)"""
    try:
        verification = await verifications_collection.find_one({"id": verification_id})
        if not verification:
            raise HTTPException(status_code=404, detail="Verification not found")
        
        review_item = ReviewHistoryItem(
            reviewer_id=reviewer_id,
            action=request.action,
            notes=request.notes
        )
        
        review_history = verification.get("review_history", []) + [review_item.dict()]
        
        update_data = {
            "review_history": review_history,
            "updated_at": datetime.now(timezone.utc)
        }
        
        if request.action == "approve":
            update_data["status"] = "approved"
            update_data["approved_at"] = datetime.now(timezone.utc)
        elif request.action == "reject":
            update_data["status"] = "rejected"
            update_data["rejected_at"] = datetime.now(timezone.utc)
        
        await verifications_collection.update_one(
            {"id": verification_id},
            {"$set": update_data}
        )
        
        verification = await verifications_collection.find_one({"id": verification_id})
        
        return {
            "success": True,
            "message": f"Verification {request.action}d successfully",
            "data": verification
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
