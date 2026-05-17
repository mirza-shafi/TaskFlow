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
- 🎯 **Habit Tracking (New!)** - Build habits with advanced analytics:
    - **GitHub-style Heatmap**: Visual calendar of your consistency.
    - **Streaks**: Track current and best streaks.
    - **Reminders**: Set daily notification times.
    - **Social Feed**: View activity from friends/accountability partners.
- 📁 **Folder Organization** - Group tasks and notes into custom folders
- 👥 **Team Collaboration** - Share tasks, notes, and folders with team members
- 📅 **Due Dates & Priorities** - Set deadlines and priority levels (High/Med/Low)
- 🏷️ **Tags** - Categorize content with custom tags
- 🗑️ **Soft Delete** - Recover deleted items from the trash
- 📊 **Analytics** - Comprehensive dashboard with completion rates and productivity insights

### Advanced Authentication 🔐
- 📧 **Real-time Email Validation** - Live domain and MX record deliverability checking
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
│   │   ├── api/v1/            # API endpoints (auth, users, tasks, habits, etc.)
│   │   ├── core/              # Security and config
│   │   ├── services/          # Business logic layer
│   │   └── schemas/           # Pydantic data models
│   ├── Dockerfile             # Optimized production image (Alpine)
│   ├── Dockerfile.dev         # Development image with hot reload
│   ├── .dockerignore          # Docker build exclusions
│   ├── venv/                  # Python virtual environment
│   └── requirements.txt       # Backend dependencies
│
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Application pages
│   │   ├── lib/               # Utilities and API client
│   │   └── App.tsx            # Main application entry
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
└── DOCKER_OPTIMIZATION.md     # Optimization details & benchmarks
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

### Authentication
- `POST /api/v1/auth/register` - Create account (Instant, no email verification needed)
- `POST /api/v1/auth/login` - Get access/refresh tokens
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Revoke current session

### Tasks
- `GET /api/v1/tasks` - List tasks
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Soft delete task

### Habits
- `GET /api/v1/habits` - List active habits
- `POST /api/v1/habits` - Create habit
- `POST /api/v1/habits/{id}/log` - Mark habit as completed
- `GET /api/v1/habits/heatmap` - Get activity heatmap data

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
6. Add all environment variables from your local `.env` (ensure `PYTHON_VERSION` is set to `3.12.0`).

**Frontend (Vercel)**
1. Create a new Project on Vercel linked to this repository.
2. Set Root Directory to `client`.
3. Framework Preset will automatically be detected as `Vite`.
4. Add the Environment Variable: `VITE_API_BASE_URL` = `https://<YOUR-RENDER-URL>/api/v1`.
5. Deploy! (Don't forget to add your Vercel URL to the `CORS_ORIGINS` in your Render backend settings).

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