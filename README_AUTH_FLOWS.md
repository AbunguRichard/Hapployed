# Hapployed - Navigation & Auth Flows Implementation

## Phase 1 (MVP) - Complete Implementation Guide

This document explains the navigation + auth flows system for the three primary CTAs: **Find Work**, **Hire Talent**, and **Post a Project**.

---

## 🏗️ Architecture Overview

### Backend (FastAPI + MongoDB)
- **Real JWT Authentication** with access & refresh tokens
- **Dual-role user model** (worker + employer profiles)
- **Analytics tracking** for guest funnel and conversion metrics
- **Role-based guards** for protected endpoints

### Frontend (React)
- **Intent preservation** via localStorage
- **AuthModal** with Sign In / Sign Up / Guest tabs
- **RoleGuard** component for protected routes
- **Smart redirects** based on user role + intent
- **Analytics integration** for event tracking

---

## 🚀 How to Run

### Backend
```bash
cd /app/backend
# Environment is already configured in .env
# JWT_SECRET_KEY, USE_MOCK_AUTH=false, DB_NAME=test_database
sudo supervisorctl restart backend
```

### Frontend
```bash
cd /app/frontend
# Backend URL is configured in .env
# REACT_APP_BACKEND_URL=https://supabase-migration-9.preview.emergentagent.com
sudo supervisorctl restart frontend
```

### Check Status
```bash
sudo supervisorctl status
# All services should show RUNNING
```

---

## 🔐 Authentication System

### JWT Endpoints
- `POST /api/auth/register` - Create new user with role
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and clear cookies
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/add-role` - Add secondary role (worker ↔ employer)
- `PATCH /api/auth/profile/{profile_type}` - Update profile

### User Model
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "roles": ["worker", "employer"],
  "worker_profile": {
    "skills": [],
    "location": null,
    "hourlyRate": null,
    "availability": "available",
    "rating": 0.0,
    "profileComplete": false
  },
  "employer_profile": {
    "companyName": null,
    "verified": false,
    "billingStatus": "active",
    "profileComplete": false
  }
}
```

### Environment Flags
- `USE_MOCK_AUTH=false` - Real JWT (production/staging)
- `USE_MOCK_AUTH=true` - Mock auth (local storybook/tests only)

---

## 🎯 Three Primary CTAs

### 1. Find Work
**Homepage Button:** "Find Opportunities"

**Flow for New Users:**
1. Click "Find Work" → AuthModal opens with `intent: 'find_work'`
2. Sign Up tab auto-selects `role: 'worker'`
3. After signup → redirected to `/dashboard-worker`

**Flow for Existing Users:**
- **Worker:** → `/dashboard-worker` (Gigs Near Me, Projects by Skill, Recommended)
- **Employer:** → RoleSwitchPrompt to add worker profile → `/dashboard-worker`

**Guest Mode:**
- Can browse read-only listings
- "Apply" button triggers AuthModal

---

### 2. Hire Talent
**Homepage Button:** "Hire Talent"

**Flow for New Users:**
1. Click "Hire Talent" → AuthModal opens with `intent: 'hire_talent'`
2. Sign Up tab auto-selects `role: 'employer'`
3. After signup → redirected to `/dashboard-employer`

**Flow for Existing Users:**
- **Employer:** → `/dashboard-employer` (Post Job, Applicants, Messages)
- **Worker:** → RoleSwitchPrompt to add employer profile → `/dashboard-employer`

**Guest Mode:**
- Can browse sample talent profiles
- "Message/Hire" button triggers AuthModal

---

### 3. Post a Project
**Homepage Button:** "Post a Project" (Prominent purple gradient)

**Flow for New Users:**
1. Click "Post a Project" → AuthModal opens with `intent: 'post_project'`
2. Sign Up tab auto-selects `role: 'employer'`
3. After signup → redirected to `/post-project` wizard

**Flow for Existing Users:**
- **Employer:** → `/post-project` wizard directly
- **Worker:** → RoleSwitchPrompt to add employer profile → `/post-project`

**Post Project Wizard (4 Steps):**
1. **Step 1:** Title, category, description, skills, location
2. **Step 2:** 
   - Hiring Type: Single or Multi-Role
   - Budget & Timeline
   - If QuickHire: urgency, radius, start time
3. **Step 3:** Skills required
4. **Step 4:** Review & Publish

---

## 📊 Analytics & Event Tracking

### Event Tracking Endpoints
- `POST /api/analytics/events` - Track event
- `POST /api/analytics/alias` - Alias anonymous → user
- `GET /api/analytics/stats` - Get statistics
- `GET /api/analytics/funnel` - Conversion funnel

### Tracked Events
```javascript
// Homepage CTA clicks
'cta_find_work_clicked'
'cta_hire_talent_clicked'
'cta_post_project_clicked'

// Guest actions
'guest_view_listings'
'guest_click_apply'
'guest_open_auth_modal'
'guest_post_project_preview'
'guest_attempt_message'
'guest_continue_clicked'

// Auth flow
'user_signup_complete'
'user_signin_complete'

// Intent tracking
lastIntent: 'find_work' | 'hire_talent' | 'post_project'
```

### Anonymous ID Tracking
- Generated on first visit: `anon_${random}_${timestamp}`
- Stored in localStorage
- Aliased to user ID upon signup
- Enables full funnel tracking from guest → conversion

---

## 🛡️ Protected Routes & Guards

### RoleGuard Component
```jsx
<RoleGuard requiredRole="employer" requireProfileComplete={false}>
  <PostProjectPage />
</RoleGuard>
```

**Features:**
- Checks authentication
- Verifies required role
- Shows RoleSwitchPrompt if role missing
- Optionally requires profile completion
- Preserves intended destination

### Usage Examples
```jsx
// Employer-only route
<Route path="/post-project" element={
  <RoleGuard requiredRole="employer">
    <PostProjectPage />
  </RoleGuard>
} />

// Worker-only route with profile check
<Route path="/dashboard-worker" element={
  <RoleGuard requiredRole="worker" requireProfileComplete={true}>
    <WorkerDashboard />
  </RoleGuard>
} />
```

---

## 🔄 Role Switching

### RoleSwitchPrompt Component
Appears when a user tries to access a page requiring a role they don't have.

**Example Scenarios:**
- Worker clicks "Post Project" → Prompt to add employer profile
- Employer clicks "Find Work" → Prompt to add worker profile

**Features:**
- Non-destructive (keeps existing role)
- Shows benefits of adding role
- Links current user info
- Auto-continues after role added

---

## 🎨 Frontend Components

### Created Components
1. **AuthModal** (`/app/frontend/src/components/AuthModal.jsx`)
   - 3 tabs: Sign In, Sign Up, Guest
   - Intent-aware role selection
   - Analytics integration

2. **RoleSwitchPrompt** (`/app/frontend/src/components/RoleSwitchPrompt.jsx`)
   - Add secondary role UI
   - Benefits display
   - Seamless integration

3. **RoleGuard** (`/app/frontend/src/components/RoleGuard.jsx`)
   - Route protection
   - Role verification
   - Profile completion checks

### Updated Components
1. **AuthContext** (`/app/frontend/src/context/AuthContext.jsx`)
   - Real JWT integration
   - Token management
   - Role helpers: `hasRole()`, `isProfileComplete()`

2. **UnifiedHeroSection** (`/app/frontend/src/components/UnifiedHeroSection.jsx`)
   - Three primary CTAs
   - Intent tracking
   - Auth modal integration

---

## 📁 Backend Files

### Created Routes
1. **auth_routes.py** - Complete JWT authentication system
2. **analytics_routes.py** - Event tracking and analytics

### Environment Variables (.env)
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
JWT_SECRET_KEY="hapployed-jwt-secret-key-change-in-production-2025"
USE_MOCK_AUTH="false"
ENVIRONMENT="development"
```

---

## 🧪 Testing

### Test Backend Endpoints
```bash
# Register new user
curl -X POST ${REACT_APP_BACKEND_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User","role":"worker"}'

# Login
curl -X POST ${REACT_APP_BACKEND_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get current user (use token from login)
curl -X GET ${REACT_APP_BACKEND_URL}/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Track analytics event
curl -X POST ${REACT_APP_BACKEND_URL}/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{"eventName":"guest_click_apply","anonymousId":"anon_123","lastIntent":"find_work"}'
```

---

## 🎯 Intent Preservation

### How It Works
1. User clicks CTA (Find Work, Hire Talent, Post Project)
2. Intent saved to localStorage: `user_intent: 'find_work'`
3. If not authenticated → AuthModal opens
4. After signup/signin → User redirected based on intent
5. Intent cleared after successful navigation

### localStorage Keys
- `user_intent` - Current user intent
- `anonymous_id` - Anonymous tracking ID
- `is_guest` - Guest mode flag
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token
- `redirect_after_auth` - Preserved destination URL

---

## 🔒 Security

### Token Management
- **Access tokens:** 30 minutes expiry
- **Refresh tokens:** 7 days expiry
- **HTTP-only cookies:** Refresh token stored securely
- **Auto-refresh:** Transparent token rotation
- **Protected endpoints:** 401/403 responses without valid token

### Password Security
- bcrypt hashing
- Minimum 6 characters
- No plain text storage

---

## 📈 Next Steps (Phase 2)

1. **Worker Dashboard Implementation**
   - AI matches
   - Gigs Near Me
   - Apply functionality

2. **Profile Completion Wizard**
   - Worker: skills, location, video
   - Employer: company info, verification

3. **Guest Read-Only Views**
   - Blurred job listings
   - Sample talent profiles
   - Upgrade prompts

4. **Messaging & Notifications**
   - In-app messaging
   - Email notifications
   - Push notifications

---

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check backend logs
tail -f /var/log/supervisor/backend.*.log

# Restart backend
sudo supervisorctl restart backend
```

### Frontend Issues
```bash
# Check frontend logs
tail -f /var/log/supervisor/frontend.*.log

# Restart frontend
sudo supervisorctl restart frontend

# Check if backend URL is correct
cat /app/frontend/.env | grep BACKEND_URL
```

### Database Issues
```bash
# Check MongoDB connection
mongo ${MONGO_URL}

# List users
use test_database
db.users.find().pretty()
```

---

## 📞 Support

For issues or questions:
1. Check logs in `/var/log/supervisor/`
2. Verify environment variables in `.env` files
3. Ensure all services are running: `sudo supervisorctl status`
4. Test backend endpoints with curl
5. Check browser console for frontend errors

---

**Status:** Phase 1 (MVP) Complete ✅
**Last Updated:** 2025
**Version:** 1.0
