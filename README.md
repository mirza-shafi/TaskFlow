# TaskFlow - Advanced Task Management System

A modern, full-stack task management application with enterprise-grade authentication, real-time collaboration, and powerful habit tracking features.

🌟 **Live Demo**: [https://task-flow.mirzashafi.com/](https://task-flow.mirzashafi.com/)
🔗 **API Backend**: [https://taskflow-api.mirzashafi.com/](https://taskflow-api.mirzashafi.com/)

![TaskFlow](https://img.shields.io/badge/Status-Production%20Ready-success)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)
![Docker](https://img.shields.io/badge/Docker-Optimized-2496ED?logo=docker)
![Docker Image](https://img.shields.io/badge/Image%20Size-~295MB-blue)

---

## 🚀 Features

### Core Functionality
- ✅ **Task Management** - Create, update, delete, and organize tasks with collaboration
- 📝 **Notes** - Rich text notes with Markdown support, pinning, favorites, and folders
- 👥 **Team Workspaces (New!)** - Real-time team collaboration environments:
    - **Shared Tasks & Notes**: Everything created within a team workspace is automatically shared with members.
    - **Role-based Access**: Owner, Admin, and Member roles with different permissions.
    - **Task Assignment**: Assign tasks to specific team members.
    - **Activity Tracking**: Track who created, edited, or deleted resources in the team.
- 🎯 **Habit Tracking** - Build habits with advanced analytics:
    - **GitHub-style Heatmap**: Visual calendar of your consistency.
    - **Streaks**: Track current and best streaks.
    - **Reminders**: Set daily notification times.
- 📁 **Folder Organization** - Group tasks and notes into custom folders
- 📅 **Due Dates & Priorities** - Set deadlines and priority levels (High/Med/Low)
- 🏷️ **Tags** - Categorize content with custom tags
- 🗑️ **Soft Delete** - Recover deleted items from the trash
- 📊 **Analytics** - Comprehensive dashboard with completion rates and productivity insights

### Advanced Authentication 🔐
- 🌐 **Google Login (Firebase)** - One-click authentication with Google OAuth
- 📧 **Resend Email Integration** - Deliver team invitations and password reset emails reliably
- 🔑 **Password Reset** - Secure reset flow via email
- 🎫 **Dual Token System** - Short-lived Access Tokens (15m) + Long-lived Refresh Tokens (30d)
- 📱 **Session Management** - View and revoke active sessions across devices
- 🚪 **Secure Logout** - Token blacklisting and session cleanup
- 🛡️ **Security Features**:
  - Account lockout after failed attempts
  - Rate limiting on sensitive endpoints
  - IP tracking and new device alerts

### User Experience
- 🎨 **Modern UI** - Built with Shadcn UI and Tailwind CSS
- 🌓 **Dark Mode** - Fully supported dark/light themes
- ⚡ **Real-time Updates** - Instant state synchronization
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

---

## 🏗️ Tech Stack

### Backend (FastAPI)
- **Framework**: FastAPI 0.115+
- **Database**: MongoDB Atlas (Motor async driver)
- **Authentication**: JWT (Access/Refresh strategy)
- **Security**: Argon2 password hashing
- **Validation**: Pydantic models
- **Documentation**: Swagger UI / OpenAPI

### Frontend (React)
- **Framework**: React 18 (Vite)
- **Language**: TypeScript
- **UI Library**: Shadcn UI + Tailwind CSS
- **State Management**: TanStack Query (React Query) + Context API
- **Routing**: React Router
- **Icons**: Lucide React
- **Animations**: Framer Motion

---

## 📦 Project Structure

```
TaskFlow/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints (auth, users, tasks, habits, teams, notes, etc.)
│   │   ├── core/              # Security, JWT, and config
│   │   ├── models/            # Database models / entities
│   │   ├── schemas/           # Pydantic data validation models
│   │   ├── services/          # Business logic layer
│   │   ├── middleware/        # Request/response middleware
│   │   ├── utils/             # Helper functions and utilities
│   │   ├── templates/         # Email HTML templates
│   │   ├── database.py        # MongoDB connection setup
│   │   └── main.py            # FastAPI application entry point
│   ├── Dockerfile             # Optimized production image (Alpine)
│   ├── Dockerfile.dev         # Development image with hot reload
│   ├── .dockerignore          # Docker build exclusions
│   ├── venv/                  # Python virtual environment
│   └── requirements.txt       # Backend dependencies
│
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities, configurations, and API client hooks
│   │   ├── pages/             # Application pages (Auth, Dashboard, Teams, etc.)
│   │   ├── providers/         # React Context providers (Auth, Theme, etc.)
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Main application entry
│   │   └── main.tsx           # React DOM rendering entry
│   └── package.json           # Frontend dependencies
│
├── docker-compose.yml         # Production orchestration
├── docker-compose.dev.yml     # Development orchestration
├── .env.example               # Environment variables template
├── .dockerignore              # Root-level exclusions
│
├── start-docker.sh            # Quick start script (Linux/Mac)
├── start-docker.bat           # Quick start script (Windows)
├── build-optimized.sh         # Build optimized images
├── build-optimized.bat        # Build script (Windows)
├── test-docker-optimization.sh # Test image sizes
│
├── README.md                  # This file
├── DOCKER_README.md           # Comprehensive Docker guide
├── DOCKER_OPTIMIZATION.md     # Optimization details & benchmarks
└── DOCKER_BUILD_FIX.md        # Build troubleshooting guide
```

---

## 🚀 Getting Started

### 🐳 Option 1: Docker (Recommended)

The fastest way to run TaskFlow is using Docker:

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your MongoDB URI and credentials
nano .env

# 3. Run with Docker Compose
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:80
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

📖 See [DOCKER_README.md](DOCKER_README.md) for detailed Docker documentation.

---

### 💻 Option 2: Local Development

### Prerequisites
- **Python**: 3.12+
- **Node.js**: 18+
- **MongoDB**: Atlas account (Connection URI)
- **Gmail**: For SMTP email service (optional for dev, required for auth flow)

### 1. Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python3.12 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your credentials:
   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-key
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

5. **Run the server**
   ```bash
   ./venv/bin/uvicorn app.main:app --reload --port 8000
   ```
   Server: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Frontend: `http://localhost:5173` (typically)

---

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Create account
- `POST /login` - Get access/refresh tokens
- `POST /google` - Authenticate via Firebase Google Auth
- `POST /refresh` - Refresh access token
- `POST /logout` - Revoke current session
- `POST /forgot-password` - Request password reset email
- `POST /reset-password` - Reset password using token

### Tasks (`/api/v1/tasks`)
- `GET /` - List tasks
- `POST /` - Create task
- `PUT /{id}` - Update task
- `DELETE /{id}` - Soft delete task
- `POST /{id}/restore` - Restore deleted task
- `DELETE /{id}/permanent` - Permanently delete task

### Teams (`/api/v1/teams`)
- `GET /` - List user's teams
- `POST /` - Create a team workspace
- `GET /{id}` - Get team details
- `PUT /{id}` - Update team settings
- `DELETE /{id}` - Delete team
- `POST /{id}/invite` - Invite member to team via email
- `PATCH /{id}/members/{member_id}` - Update member role
- `DELETE /{id}/members/{member_id}` - Remove member
- `GET /{id}/activity` - Get team activity history

### Notes (`/api/v1/notes`)
- `GET /` - List all notes
- `POST /` - Create note
- `GET /{id}` - Get note details
- `PUT /{id}` - Update note
- `DELETE /{id}` - Soft delete note
- `POST /{id}/pin` - Toggle note pin status
- `POST /{id}/favorite` - Toggle note favorite status

### Habits (`/api/v1/habits`)
- `GET /` - List active habits
- `POST /` - Create habit
- `PUT /{id}` - Update habit
- `DELETE /{id}` - Delete habit
- `POST /{id}/log` - Mark habit as completed
- `GET /heatmap` - Get activity heatmap data

### Other Modules
- **Folders** (`/api/v1/folders`): Create, update, list, and delete folders for organization.
- **Analytics** (`/api/v1/analytics`): Get productivity stats, task completion rates, and habit insights.
- **Notifications** (`/api/v1/notifications`): Get, mark as read, and delete user notifications.
- **Users** (`/api/v1/users`): Get current user profile, update settings, manage sessions.

*(Full list of 80+ endpoints available in Swagger UI at `/docs`)*

---

## 🔒 Security Summary

- **Passwords**: Hashed using Argon2 (winner of Password Hashing Competition).
- **Tokens**: Access tokens expire in 15 minutes. Refresh tokens last 30 days and can be revoked.
- **Sessions**: Complete session management allows users to sign out of specific devices.
- **Validation**: All inputs validated with Pydantic schemas.

---

## 🌐 Deployment

### 🐳 Docker Deployment (Recommended)

**On any VPS/Cloud (AWS EC2, DigitalOcean, Linode, etc.)**

1. Clone repository and setup environment:
   ```bash
   git clone https://github.com/mirza-shafi/TaskFlow.git
   cd TaskFlow
   cp .env.example .env
   nano .env  # Add your credentials
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. (Optional) Setup reverse proxy with Nginx/Caddy for custom domain and SSL

📖 See [DOCKER_README.md](DOCKER_README.md) for complete Docker deployment guide.

---

### ☁️ Cloud Deployment (Render & Vercel)

This application is configured for easy deployment on modern cloud platforms.

**Backend (Render Web Service)**
1. Create a new "Web Service" on Render linked to this repository.
2. Set Root Directory to `backend`.
3. Set Environment to `Python 3`.
4. Set Build Command: `pip install -r requirements.txt`.
5. Set Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Add the following key environment variables:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A long secure random string.
   - `FIREBASE_CREDENTIALS_JSON`: The entire raw JSON content of your `firebase-service-account.json`.
   - `RESEND_API_KEY`: Your Resend API Key for sending emails.
   - `EMAIL_FROM`: `onboarding@resend.dev` (or your verified domain).
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g. `https://task-flow.mirzashafi.com`).

**Frontend (Vercel)**
1. Create a new Project on Vercel linked to this repository.
2. Set Root Directory to `client`.
3. Framework Preset will automatically be detected as `Vite`.
4. Add the necessary Environment Variables:
   - `VITE_API_BASE_URL` = `https://<YOUR-RENDER-URL>/api/v1`
   - All `VITE_FIREBASE_*` variables from your local `.env` file for Google Auth.
5. Deploy! Vercel handles SPA routing seamlessly thanks to the included `client/vercel.json` rewrite rules.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Mirza Shafi**
- GitHub: [@mirzashafi](https://github.com/mirzashafi)
- Email: mirza.md.shafi.uddin@gmail.com

---

**⭐ If you find this project useful, you can give it a star!**