# Hapployed - Dual-Role Job Marketplace Platform

Hapployed is a comprehensive dual-role (Worker/Client) platform for job discovery, posting, and quick hiring. It features AI-enhanced job posting, real-time matching, QuickHire (Uber-like gig system), and a complete application management system.

## 🚀 Features

### Core Features
- **Dual-Role System**: Users can be both Workers and Hirers
- **Job Posting & Discovery**: Post professional projects or quick local gigs
- **Application System**: Complete CRUD for job applications with status tracking
- **QuickHire**: Uber-like system for instant local help (plumbers, cleaners, etc.)
- **Worker Profiles**: Comprehensive profile system with skills, ratings, and portfolios
- **Messaging System**: Real-time communication between hirers and workers
- **Smart Matching**: AI-powered job-worker matching

### Advanced Features
- **Voice Input**: Voice-to-text for job posting and profile creation
- **AI Price Estimation**: Automatic pricing suggestions based on job details
- **Live Tracking**: Real-time worker location tracking for QuickHire gigs (mocked)
- **Skills Management**: Visual skills selection with voice capture
- **Badge System**: Verified worker badges and trust indicators
- **Responsive Design**: Mobile-first design with Tailwind CSS

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (Browser)                         │
│                    React Frontend (Port 3000)                │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 FastAPI Backend (Port 8001)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Route Modules:                                      │   │
│  │  - Job Posting Routes                                │   │
│  │  - Worker Profile Routes                             │   │
│  │  - Application Routes                                │   │
│  │  - Messaging Routes                                  │   │
│  │  - QuickHire Routes                                  │   │
│  │  - AI Matching & Voice Routes                        │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│              MongoDB Database (Port 27017)                   │
│  Collections:                                                │
│  - jobs, worker_profiles, applications, messages            │
│  - quickhire_gigs, quickhire_assignments, ratings           │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: FastAPI (Python 3.8+)
- **Database**: MongoDB with Motor (async driver)
- **Data Validation**: Pydantic
- **Authentication**: JWT-based (via AuthContext)
- **API Design**: RESTful with automatic OpenAPI documentation
- **CORS**: Configured for cross-origin requests

#### Frontend
- **Framework**: React.js 18+
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6
- **State Management**: React Context API (AuthContext)
- **HTTP Client**: Fetch API
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

---

## 📁 Project Structure

### Backend Structure (`/app/backend/`)

```
backend/
├── server.py                      # Main FastAPI application
├── .env                          # Environment variables (MONGO_URL, DB_NAME)
├── requirements.txt              # Python dependencies
│
├── job_posting_routes.py         # Job CRUD operations
├── worker_profile_routes.py      # Worker profile management
├── application_routes.py         # Job application system
├── messaging_routes.py           # Messaging between users
├── quickhire_routes.py           # QuickHire gig system
├── ai_matching_routes.py         # AI-powered matching
├── voice_ai_routes.py            # Voice input processing
├── ai_price_routes.py            # AI price estimation
├── badge_routes.py               # Worker badge system
├── profile_routes.py             # User profile endpoints
├── jobs_routes.py                # Additional job endpoints
└── worker_features_routes.py     # Worker-specific features
```

### Frontend Structure (`/app/frontend/`)

```
frontend/
├── public/
│   └── index.html
│
├── src/
│   ├── App.js                    # Main app with routing
│   ├── App.css                   # Global styles
│   ├── index.js                  # Entry point
│   │
│   ├── components/               # Reusable components
│   │   ├── Header.jsx            # Public homepage header
│   │   ├── DashboardHeader.jsx   # Authenticated user header
│   │   ├── UnifiedHeroSection.jsx
│   │   ├── JobApplicationModal.jsx
│   │   ├── VoiceCaptureModal.jsx
│   │   ├── BadgeDisplay.jsx
│   │   └── ...
│   │
│   ├── pages/                    # Page components
│   │   ├── Homepage.jsx          # Landing page
│   │   ├── UnifiedAuthPage.jsx   # Login/Signup
│   │   ├── DashboardPage.jsx     # User dashboard
│   │   │
│   │   ├── PostProjectPage.jsx   # Job posting
│   │   ├── OpportunitiesPage.jsx # Job discovery
│   │   ├── FindWorkersPage.jsx   # Worker search
│   │   ├── ManageJobsPage.jsx    # Hirer's job management
│   │   │
│   │   ├── MyApplicationsPage.jsx      # Worker applications
│   │   ├── JobApplicationsPage.jsx     # Hirer application review
│   │   │
│   │   ├── QuickHirePostPage.jsx       # Post QuickHire gig
│   │   ├── QuickHireTrackingPage.jsx   # Live tracking
│   │   ├── QuickHireWorkerDashboard.jsx # Worker gig dashboard
│   │   │
│   │   ├── MySkillsPage.jsx      # Skills management
│   │   ├── MessagesPage.jsx      # Messaging interface
│   │   └── ...
│   │
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication state
│   │
│   ├── hooks/
│   │   └── useUserRoles.js       # User role management
│   │
│   └── .env                      # Frontend environment variables
│
├── package.json                  # Node dependencies
└── yarn.lock                     # Yarn lock file
```

---

## 🔧 Environment Variables

### Backend (`.env` in `/app/backend/`)

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=hapployed_db
CORS_ORIGINS=http://localhost:3000
EMERGENT_LLM_KEY=your_llm_key_here
```

### Frontend (`.env` in `/app/frontend/`)

```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Important**: Never commit `.env` files to version control!

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 14+ and Yarn
- MongoDB 4.4+
- Git

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hapployed.git
cd hapployed
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
yarn install

# Create .env file
cp .env.example .env
# Edit .env with your backend URL
```

#### 4. Database Setup

Make sure MongoDB is running:

```bash
# Start MongoDB (if not running as a service)
mongod --dbpath /path/to/your/data/directory
```

The application will automatically create necessary collections on first run.

---

## ▶️ Running the Application

### Development Mode

#### Start Backend (Terminal 1)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will be available at: `http://localhost:8001`
API Documentation: `http://localhost:8001/docs`

#### Start Frontend (Terminal 2)

```bash
cd frontend
yarn start
```

Frontend will be available at: `http://localhost:3000`

### Production Deployment

#### Backend

```bash
cd backend
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001
```

#### Frontend

```bash
cd frontend
yarn build
# Serve the build folder with a static server like nginx or serve
```

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

### Key API Endpoints

#### Jobs
- `POST /api/jobs` - Create a job
- `GET /api/jobs` - List jobs (with filters)
- `GET /api/jobs/{jobId}` - Get job details
- `PATCH /api/jobs/{jobId}` - Update job
- `DELETE /api/jobs/{jobId}` - Delete job

#### Worker Profiles
- `POST /api/worker-profiles` - Create profile
- `GET /api/worker-profiles/user/{userId}` - Get user's profile
- `PATCH /api/worker-profiles/{profileId}` - Update profile
- `POST /api/worker-profiles/search` - Search workers

#### Applications
- `POST /api/applications` - Submit application
- `GET /api/jobs/{jobId}/applications` - Get job applications
- `GET /api/workers/{workerId}/applications` - Get worker's applications
- `PATCH /api/applications/{applicationId}` - Update status

#### QuickHire
- `POST /api/quickhire/gigs` - Post QuickHire gig
- `GET /api/quickhire/gigs/nearby` - Get nearby gigs
- `POST /api/quickhire/gigs/{gigId}/accept` - Accept gig
- `PATCH /api/quickhire/gigs/{gigId}/status` - Update status

#### Messaging
- `POST /api/messages` - Send message
- `GET /api/conversations/{userId}` - Get conversations
- `GET /api/messages/{conversationId}` - Get messages

---

## 🗄️ Database Schema

### Collections

#### `jobs`
```javascript
{
  _id: UUID,
  userId: String,
  title: String,
  description: String,
  category: String,
  budget: { min: Number, max: Number },
  location: { type: String, city: String, state: String },
  status: String, // published, draft, closed
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### `worker_profiles`
```javascript
{
  _id: UUID,
  userId: String,
  name: String,
  email: String,
  skills: [String],
  bio: String,
  hourlyRate: Number,
  rating: Number,
  completedJobs: Number,
  isAvailable: Boolean,
  createdAt: ISODate
}
```

#### `applications`
```javascript
{
  _id: UUID,
  jobId: String,
  workerId: String,
  coverLetter: String,
  proposedRate: Number,
  status: String, // pending, reviewed, accepted, rejected
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### `quickhire_gigs`
```javascript
{
  _id: UUID,
  clientId: String,
  category: String,
  description: String,
  location: { type: "Point", coordinates: [lon, lat] },
  urgency: String, // ASAP, Today, Later
  status: String, // Posted, Dispatching, Matched, On-Route, Complete
  estimatedPrice: Number,
  createdAt: ISODate
}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/
```

### Frontend Tests

```bash
cd frontend
yarn test
```

---

## 🔐 Authentication

The application uses JWT-based authentication with React Context API for state management.

**Auth Flow:**
1. User logs in via `/auth/login`
2. Backend validates credentials
3. JWT token stored in localStorage
4. Token sent with API requests via headers
5. Protected routes check authentication status

---

## 🎨 Design System

### Color Palette
- **Primary**: Purple (#7C3AED)
- **Secondary**: Blue (#3B82F6)
- **Accent**: Orange (#F97316)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)

### Typography
- **Font**: System fonts (Inter, SF Pro, Segoe UI)
- **Headings**: Bold, large sizes
- **Body**: Regular weight, readable sizes

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- Built with FastAPI and React
- Icons by Lucide
- UI components styled with Tailwind CSS
- Deployed on Emergent Platform

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: your.email@example.com

---

## 🗺️ Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Payment integration (Stripe)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Video call integration
- [ ] AI-powered resume parsing
- [ ] Multi-language support
- [ ] Email notifications

---

**Built with ❤️ using FastAPI, React, and MongoDB**
