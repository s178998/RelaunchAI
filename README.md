# RelaunchAI

<div align="center">

![RelaunchAI Logo](https://via.placeholder.com/120x120?text=R)

**AI-Powered Career Transition Platform for Tech Professionals**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.13+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/react-18.3+-blue.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/fastapi-0.115+-green.svg)](https://fastapi.tiangolo.com)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-3.4+-38B2AC.svg)](https://tailwindcss.com)

</div>

---

## 📋 Overview

RelaunchAI is a comprehensive career transition platform designed to help tech professionals navigate layoffs, upskill effectively, and find their next opportunity. Using artificial intelligence, the platform provides personalized risk analysis, job matching, skills assessment, and professional resume generation.

### 🎯 Problem Statement

Tech professionals facing layoffs struggle with:
- Understanding their actual layoff risk level
- Identifying relevant job opportunities
- Knowing which skills to develop
- Creating professional resumes quickly
- Navigating career transitions effectively

### 💡 Solution

RelaunchAI solves these challenges by providing:
- **AI-powered risk analysis** based on company, role, and market conditions
- **Personalized job matching** using skills and experience
- **Smart skills assessment** with learning path recommendations
- **Professional resume generation** with beautiful templates
- **Comprehensive transition toolkit** with resources and checklists

---

## ✨ Features

### 🔐 Authentication & User Management
- Secure JWT-based authentication
- Google OAuth 2.0 integration
- User profile management
- Session persistence with localStorage

### 📊 Dashboard & Risk Analysis
- Real-time layoff risk scoring (15-85%)
- Company-specific risk factors
- Leadership exit tracking
- Market demand analytics
- Personalized recommendations

### 💼 Job Matching
- AI-powered job recommendations
- Match score calculation based on skills
- Filter by match percentage
- Direct application links
- Job application tracking

### 📚 Skills & Learning
- Role-specific skill assessment
- Market demand heatmap
- Personalized course recommendations
- Direct links to Coursera, Udemy, edX, etc.
- Learning progress tracking

### 📄 Resume Builder
- AI-assisted resume generation
- Multiple professional templates
- Real-time preview
- Download as TXT/JSON
- Edit and customize sections

### 🔄 Transition Hub
- Severance package estimator
- Benefits protection guide
- Legal resources
- Networking tools
- Action plan checklists
- Email notifications

### 👥 Community (Coming Soon)
- Discussion forums
- Study groups
- Mentorship program
- Job board
- Success stories

---

## 🏗️ Architecture

### Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router |
| **Backend** | FastAPI, Python 3.13+, SQLAlchemy |
| **Database** | PostgreSQL |
| **AI/ML** | OpenAI GPT-3.5/4, Custom risk algorithms |
| **Auth** | JWT, Google OAuth 2.0 |
| **Deployment** | Docker, Docker Compose |

### System Architecture

┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│                 (React SPA with Tailwind)                   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Auth API  │  │   AI API    │  │   User API          │  │
│  │  /auth/*    │  │  /ai/*      │  │  /users/*           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        PostgreSQL                            │
│                  (users, profiles, cache)                    │
└─────────────────────────────────────────────────────────────┘


### Data Flow

1. User registers → JWT token generated → Stored in localStorage
2. Onboarding data → Saved to user profile → Used for AI analysis
3. API requests → Token validation → AI processing → Cached response
4. Risk scores → Deterministic calculation based on company/role
5. 24-hour caching → Consistent user experience

---

## 🚀 Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL 15+
- OpenAI API key

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/relaunch-ai.git
cd relaunch-ai


# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost/relaunchai_db
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
APP_NAME=RelaunchAI
DEBUG=True
EOF

# Initialize database
python -c "from app.core.database import engine, Base; Base.metadata.create_all(bind=engine)"

# Run backend server
uvicorn app.main:app --reload --port 8000


# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:8000
EOF

# Run development server
npm run dev


4. Access the application
Frontend: http://localhost:5173

Backend API: http://localhost:8000

API Documentation: http://localhost:8000/docs



relaunch-ai/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       ├── ai_router.py      # AI endpoints
│   │   │       ├── auth_router.py    # Authentication
│   │   │       ├── user_router.py    # User management
│   │   │       └── google_auth_router.py
│   │   ├── core/
│   │   │   ├── config.py             # Settings
│   │   │   ├── database.py           # DB connection
│   │   │   └── security.py           # JWT & password
│   │   ├── models/
│   │   │   └── user.py               # User model
│   │   ├── repositories/
│   │   │   └── user_repository.py    # DB operations
│   │   ├── schemas/
│   │   │   └── user.py               # Pydantic schemas
│   │   ├── services/
│   │   │   ├── openai_service.py     # AI integration
│   │   │   └── user_service.py       # Business logic
│   │   └── main.py                   # App entry
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # Sidebar, Topbar
│   │   │   └── Onboarding.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── PublicLayout.jsx
│   │   │   └── CommunityLayout.jsx
│   │   ├── pages/
│   │   │   ├── app/                  # Protected pages
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── LayoffRisk.jsx
│   │   │   │   ├── JobMatching.jsx
│   │   │   │   ├── SkillsLearning.jsx
│   │   │   │   ├── ResumeBuilder.jsx
│   │   │   │   └── TransitionHub.jsx
│   │   │   ├── public/               # Public pages
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── community/            # Community pages
│   │   ├── services/
│   │   │   └── api.js                # API client
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── routes.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── docker-compose.yml
└── README.md






🔧 API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/token	Login with email/password
GET	/auth/google/login	Google OAuth login
GET	/auth/google/callback	Google OAuth callback
Users
Method	Endpoint	Description
POST	/users	Create new user
GET	/users/me	Get current user
GET	/users/{id}	Get user by ID
PUT	/users/{id}	Update user
DELETE	/users/{id}	Delete user
AI Services
Method	Endpoint	Description
POST	/ai/analyze-risk	Layoff risk analysis
POST	/ai/match-jobs	Job matching
POST	/ai/analyze-skills	Skills analysis
🎨 Risk Score Calculation
Risk scores are calculated deterministically based on:

text
Base Score = Company Risk (15-80)
          × Department Multiplier (0.85-1.4)
          ± Level Adjustment (±10)

Final Score = Clamp(Base Score, 15, 85)
Company Risk Tiers
Tier	Companies	Risk Range
High	Meta, Amazon, Salesforce	65-80%
Medium	Google, Microsoft, Netflix	50-65%
Low	Apple, Stripe, Adobe	30-50%
Department Multipliers
Department	Multiplier
HR, Recruiting	1.3-1.4x
Sales, Marketing	1.15-1.2x
Engineering, Product	0.85-0.9x

🧪 Testing
bash

# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
📦 Deployment
Docker Deployment
bash

# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
Production Checklist
Set DEBUG=False in backend .env

Use production PostgreSQL database

Configure proper CORS origins

Set strong SECRET_KEY

Enable HTTPS with SSL certificate

Set up monitoring (Prometheus/Grafana)

Configure backup strategy

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to branch (git push origin feature/amazing-feature)

Open a Pull Request

Development Guidelines
Follow PEP 8 for Python code

Use ESLint + Prettier for frontend

Write meaningful commit messages

Add tests for new features

Update documentation accordingly

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
OpenAI for GPT API

FastAPI community

React team

Tailwind CSS

All contributors and users

📞 Contact & Support
Issues: GitHub Issues

Email: support@relaunchai.com

Website: https://relaunchai.com

<div align="center"> <sub>Built with ❤️ for the tech community</sub> </div> ```
This README provides:

Professional overview - Clear problem statement and solution

Feature list - All major functionality documented

Architecture diagram - Visual system design

Setup instructions - Step-by-step installation

API documentation - All endpoints explained

Risk calculation - Transparent scoring algorithm

Project structure - Organized file tree

Deployment guide - Docker and production setup

Contributing guidelines - For open source collaboration

Save this as README.md in your project root before committing to GitHub!

