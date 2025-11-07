from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/settings", tags=["Settings"])

# ============================================================================
# MODELS
# ============================================================================

# 1. My Info Models
class UserInfo(BaseModel):
    user_id: str
    full_name: str
    email: EmailStr
    phone: str = None
    bio: str = None
    profile_photo_url: str = None
    location: str = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

class UserInfoUpdate(BaseModel):
    full_name: str = None
    email: EmailStr = None
    phone: str = None
    bio: str = None
    location: str = None

# 2. Billing Models
class PaymentMethod(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # 'card', 'bank_account', 'paypal'
    last_four: str
    is_default: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now())

class Invoice(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    status: str  # 'paid', 'pending', 'failed'
    date: datetime = Field(default_factory=lambda: datetime.now())
    invoice_url: str = None

# 3. Security Models
class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class TwoFactorAuth(BaseModel):
    user_id: str
    enabled: bool
    method: str = 'sms'  # 'sms', 'email', 'app'
    phone_number: str = None

# 4. Teams Models
class TeamMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    team_id: str
    user_id: str
    name: str
    email: EmailStr
    role: str  # 'owner', 'admin', 'member', 'viewer'
    invited_at: datetime = Field(default_factory=lambda: datetime.now())
    status: str = 'active'  # 'active', 'pending', 'inactive'

class TeamInvite(BaseModel):
    email: EmailStr
    role: str
    team_id: str

# 5. Membership Models
class Membership(BaseModel):
    user_id: str
    plan: str  # 'free', 'basic', 'pro', 'enterprise'
    status: str  # 'active', 'cancelled', 'expired'
    start_date: datetime = Field(default_factory=lambda: datetime.now())
    end_date: datetime = None
    auto_renew: bool = True

# 6. Notification Settings Models
class NotificationSettings(BaseModel):
    user_id: str
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    new_gigs: bool = True
    messages: bool = True
    job_updates: bool = True
    marketing: bool = False
    weekly_digest: bool = True

# 7. Tax Information Models
class TaxInfo(BaseModel):
    user_id: str
    tax_id: str = None  # SSN or EIN
    tax_classification: str = None  # 'individual', 'sole_proprietor', 'llc', 'corporation'
    w9_submitted: bool = False
    w9_document_url: str = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now())

# 8. Connected Services Models
class ConnectedService(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    service_name: str  # 'google', 'facebook', 'linkedin', 'github'
    connected_at: datetime = Field(default_factory=lambda: datetime.now())
    status: str = 'connected'  # 'connected', 'disconnected'

# 9. Appeals Models
class Appeal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    type: str  # 'account_suspension', 'payment_dispute', 'service_quality', 'other'
    subject: str
    description: str
    status: str = 'pending'  # 'pending', 'under_review', 'resolved', 'rejected'
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    resolved_at: datetime = None
    resolution: str = None

# ============================================================================
# MOCK DATABASE (In production, use MongoDB)
# ============================================================================

mock_user_info = {}
mock_payment_methods = {}
mock_invoices = {}
mock_team_members = {}
mock_memberships = {}
mock_notification_settings = {}
mock_tax_info = {}
mock_connected_services = {}
mock_appeals = {}

# ============================================================================
# 1. MY INFO ENDPOINTS
# ============================================================================

@router.get("/my-info/{user_id}")
async def get_user_info(user_id: str):
    """Get user information"""
    if user_id not in mock_user_info:
        return {
            "user_id": user_id,
            "full_name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890",
            "bio": "Professional software developer",
            "profile_photo_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
            "location": "New York, NY"
        }
    return mock_user_info[user_id]

@router.put("/my-info/{user_id}")
async def update_user_info(user_id: str, data: UserInfoUpdate):
    """Update user information"""
    current_info = mock_user_info.get(user_id, {})
    updated_data = {**current_info, **data.dict(exclude_none=True)}
    updated_data['user_id'] = user_id
    updated_data['updated_at'] = datetime.now().isoformat()
    mock_user_info[user_id] = updated_data
    return {"message": "Profile updated successfully", "data": updated_data}

# ============================================================================
# 2. BILLING & PAYMENTS ENDPOINTS
# ============================================================================

@router.get("/billing/{user_id}/payment-methods")
async def get_payment_methods(user_id: str):
    """Get all payment methods"""
    methods = [m for m in mock_payment_methods.values() if m.get('user_id') == user_id]
    if not methods:
        return [
            {
                "id": str(uuid.uuid4()),
                "type": "card",
                "last_four": "4242",
                "is_default": True,
                "created_at": datetime.now().isoformat()
            }
        ]
    return methods

@router.post("/billing/{user_id}/payment-methods")
async def add_payment_method(user_id: str, method: PaymentMethod):
    """Add a new payment method"""
    method.user_id = user_id
    method_dict = method.dict()
    method_dict['created_at'] = method_dict['created_at'].isoformat()
    mock_payment_methods[method.id] = method_dict
    return {"message": "Payment method added successfully", "data": method_dict}

@router.delete("/billing/payment-methods/{method_id}")
async def delete_payment_method(method_id: str):
    """Delete a payment method"""
    if method_id in mock_payment_methods:
        del mock_payment_methods[method_id]
    return {"message": "Payment method deleted successfully"}

@router.get("/billing/{user_id}/invoices")
async def get_invoices(user_id: str):
    """Get all invoices"""
    invoices = [i for i in mock_invoices.values() if i.get('user_id') == user_id]
    if not invoices:
        return [
            {
                "id": str(uuid.uuid4()),
                "amount": 49.99,
                "status": "paid",
                "date": datetime.now().isoformat(),
                "invoice_url": "#"
            }
        ]
    return invoices

# ============================================================================
# 3. PASSWORD & SECURITY ENDPOINTS
# ============================================================================

@router.post("/security/{user_id}/change-password")
async def change_password(user_id: str, data: PasswordChange):
    """Change user password"""
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    # In production, hash password and update in database
    return {"message": "Password changed successfully"}

@router.get("/security/{user_id}/2fa")
async def get_2fa_status(user_id: str):
    """Get 2FA status"""
    return {
        "enabled": False,
        "method": "sms",
        "phone_number": None
    }

@router.post("/security/{user_id}/2fa/enable")
async def enable_2fa(user_id: str, data: TwoFactorAuth):
    """Enable 2FA"""
    return {"message": "2FA enabled successfully", "data": data.dict()}

@router.post("/security/{user_id}/2fa/disable")
async def disable_2fa(user_id: str):
    """Disable 2FA"""
    return {"message": "2FA disabled successfully"}

# ============================================================================
# 4. TEAMS & MEMBERS ENDPOINTS
# ============================================================================

@router.get("/teams/{team_id}/members")
async def get_team_members(team_id: str):
    """Get all team members"""
    members = [m for m in mock_team_members.values() if m.get('team_id') == team_id]
    if not members:
        return [
            {
                "id": str(uuid.uuid4()),
                "name": "John Doe",
                "email": "john@example.com",
                "role": "owner",
                "status": "active",
                "invited_at": datetime.now().isoformat()
            }
        ]
    return members

@router.post("/teams/{team_id}/invite")
async def invite_team_member(team_id: str, invite: TeamInvite):
    """Invite a new team member"""
    member = TeamMember(
        team_id=team_id,
        user_id=str(uuid.uuid4()),
        name="",
        email=invite.email,
        role=invite.role,
        status='pending'
    )
    member_dict = member.dict()
    member_dict['invited_at'] = member_dict['invited_at'].isoformat()
    mock_team_members[member.id] = member_dict
    return {"message": "Invitation sent successfully", "data": member_dict}

@router.delete("/teams/members/{member_id}")
async def remove_team_member(member_id: str):
    """Remove a team member"""
    if member_id in mock_team_members:
        del mock_team_members[member_id]
    return {"message": "Team member removed successfully"}

# ============================================================================
# 5. MEMBERSHIP ENDPOINTS
# ============================================================================

@router.get("/membership/{user_id}")
async def get_membership(user_id: str):
    """Get membership details"""
    if user_id not in mock_memberships:
        return {
            "plan": "free",
            "status": "active",
            "start_date": datetime.now().isoformat(),
            "auto_renew": False
        }
    return mock_memberships[user_id]

@router.post("/membership/{user_id}/upgrade")
async def upgrade_membership(user_id: str, plan: str):
    """Upgrade membership plan"""
    membership = Membership(
        user_id=user_id,
        plan=plan,
        status='active'
    )
    membership_dict = membership.dict()
    membership_dict['start_date'] = membership_dict['start_date'].isoformat()
    if membership_dict['end_date']:
        membership_dict['end_date'] = membership_dict['end_date'].isoformat()
    mock_memberships[user_id] = membership_dict
    return {"message": f"Upgraded to {plan} plan successfully", "data": membership_dict}

@router.post("/membership/{user_id}/cancel")
async def cancel_membership(user_id: str):
    """Cancel membership"""
    if user_id in mock_memberships:
        mock_memberships[user_id]['status'] = 'cancelled'
    return {"message": "Membership cancelled successfully"}

# ============================================================================
# 6. NOTIFICATION SETTINGS ENDPOINTS
# ============================================================================

@router.get("/notifications/{user_id}")
async def get_notification_settings(user_id: str):
    """Get notification settings"""
    if user_id not in mock_notification_settings:
        return NotificationSettings(user_id=user_id).dict()
    return mock_notification_settings[user_id]

@router.put("/notifications/{user_id}")
async def update_notification_settings(user_id: str, settings: NotificationSettings):
    """Update notification settings"""
    mock_notification_settings[user_id] = settings.dict()
    return {"message": "Notification settings updated successfully", "data": settings.dict()}

# ============================================================================
# 7. TAX INFORMATION ENDPOINTS
# ============================================================================

@router.get("/tax-info/{user_id}")
async def get_tax_info(user_id: str):
    """Get tax information"""
    if user_id not in mock_tax_info:
        return {
            "user_id": user_id,
            "tax_id": None,
            "tax_classification": None,
            "w9_submitted": False,
            "w9_document_url": None
        }
    return mock_tax_info[user_id]

@router.put("/tax-info/{user_id}")
async def update_tax_info(user_id: str, data: TaxInfo):
    """Update tax information"""
    tax_dict = data.dict()
    tax_dict['updated_at'] = tax_dict['updated_at'].isoformat()
    mock_tax_info[user_id] = tax_dict
    return {"message": "Tax information updated successfully", "data": tax_dict}

# ============================================================================
# 8. CONNECTED SERVICES ENDPOINTS
# ============================================================================

@router.get("/connected-services/{user_id}")
async def get_connected_services(user_id: str):
    """Get all connected services"""
    services = [s for s in mock_connected_services.values() if s.get('user_id') == user_id]
    if not services:
        return []
    return services

@router.post("/connected-services/{user_id}/connect")
async def connect_service(user_id: str, service_name: str):
    """Connect a new service"""
    service = ConnectedService(
        user_id=user_id,
        service_name=service_name
    )
    service_dict = service.dict()
    service_dict['connected_at'] = service_dict['connected_at'].isoformat()
    mock_connected_services[service.id] = service_dict
    return {"message": f"{service_name} connected successfully", "data": service_dict}

@router.delete("/connected-services/{service_id}")
async def disconnect_service(service_id: str):
    """Disconnect a service"""
    if service_id in mock_connected_services:
        del mock_connected_services[service_id]
    return {"message": "Service disconnected successfully"}

# ============================================================================
# 9. APPEALS TRACKER ENDPOINTS
# ============================================================================

@router.get("/appeals/{user_id}")
async def get_appeals(user_id: str):
    """Get all appeals"""
    appeals = [a for a in mock_appeals.values() if a.get('user_id') == user_id]
    return appeals

@router.post("/appeals/{user_id}")
async def create_appeal(user_id: str, appeal: Appeal):
    """Create a new appeal"""
    appeal.user_id = user_id
    appeal_dict = appeal.dict()
    appeal_dict['created_at'] = appeal_dict['created_at'].isoformat()
    if appeal_dict['resolved_at']:
        appeal_dict['resolved_at'] = appeal_dict['resolved_at'].isoformat()
    mock_appeals[appeal.id] = appeal_dict
    return {"message": "Appeal submitted successfully", "data": appeal_dict}

@router.get("/appeals/detail/{appeal_id}")
async def get_appeal_detail(appeal_id: str):
    """Get appeal details"""
    if appeal_id not in mock_appeals:
        raise HTTPException(status_code=404, detail="Appeal not found")
    return mock_appeals[appeal_id]
