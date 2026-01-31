# TaskFlow - Advanced Task Management System

A modern, full-stack task management application with enterprise-grade authentication, real-time collaboration, and powerful habit tracking features.

![TaskFlow](https://img.shields.io/badge/Status-Production%20Ready-success)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)

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
- 📧 **Email Verification** - Secure account activation
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
└── README.md                  # This file
```

---

## 🚀 Getting Started

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
- `POST /api/v1/auth/register` - Create account
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

### Backend (Render/Railway/AWS)
1. Set environment variables in your cloud provider.
2. Use the start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

### Frontend (Vercel/Netlify)
1. Build the project:
   ```bash
   cd client
   npm run build
   ```
2. Deploy the `dist` folder.

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