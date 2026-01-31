# TaskFlow - Advanced Task Management System

A modern, full-stack task management application with enterprise-grade authentication and real-time collaboration features.

![TaskFlow](https://img.shields.io/badge/Status-Production%20Ready-success)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688?logo=fastapi)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)

---

## 🚀 Features

### Core Functionality
- ✅ **Task Management** - Create, update, delete, and organize tasks with collaboration
- 📝 **Notes** - Rich text notes with Markdown support, pinning, and favorites
- 🎯 **Habit Tracking** - Build habits with streak tracking and accountability partners
- 📁 **Folder Organization** - Group tasks and notes into folders
- 👥 **Team Collaboration** - Share tasks, notes, folders with team members
- 🎯 **Priority Levels** - High, Medium, Low priority tasks
- 📅 **Due Dates** - Set and track task deadlines
- 🏷️ **Tags** - Categorize tasks and notes with custom tags
- 🗑️ **Soft Delete** - Recover deleted tasks and notes from trash
- 📊 **Analytics** - Comprehensive habit analytics with heatmaps and social feed

### Advanced Authentication 🔐
- 📧 **Email Verification** - Verify user emails before account activation
- 🔑 **Password Reset** - Secure password reset via email
- 🎫 **Dual Token System** - Access tokens (15 min) + Refresh tokens (30 days)
- 📱 **Session Management** - Track and manage sessions across devices
- 💻 **Device Tracking** - Monitor which devices are logged in
- 🚪 **Industry-Level Logout** - Token blacklisting and session cleanup
- 🛡️ **Security Features**:
  - Account lockout after failed attempts
  - Rate limiting on auth endpoints
  - Security event logging
  - IP tracking
  - New device login alerts

### User Experience
- 🎨 **Modern UI** - Clean, responsive design
- 🌓 **Dark Mode** - Eye-friendly dark theme
- ⚡ **Real-time Updates** - Instant synchronization
- 📊 **Dashboard** - Overview of tasks and progress
- 🔍 **Search** - Quick task search and filtering

---

## 🏗️ Tech Stack

### Backend (FastAPI)
- **Framework**: FastAPI 0.115.0
- **Language**: Python 3.12
- **Database**: MongoDB Atlas (Motor async driver)
- **Authentication**: JWT with dual token system
- **Password Hashing**: Argon2 (industry-standard)
- **Email Service**: SMTP with HTML templates
- **Validation**: Pydantic models
- **API Documentation**: Auto-generated Swagger UI

### Frontend (React)
- **Framework**: React 18.x
- **Language**: TypeScript/JavaScript
- **Styling**: Custom CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Routing**: React Router

### Database
- **Primary**: MongoDB Atlas
- **Collections**: users, tasks, notes, habits, habit_logs, folders, teams, sessions, token_blacklist, security_logs


---

## 📦 Project Structure

```
TaskFlow/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   │   ├── auth.py        # Authentication routes
│   │   │   ├── users.py       # User management
│   │   │   ├── tasks.py       # Task operations
│   │   │   ├── notes.py       # Note operations
│   │   │   ├── habits.py      # Habit tracking
│   │   │   ├── analytics.py   # Analytics & insights
│   │   │   ├── folders.py     # Folder management
│   │   │   └── teams.py       # Team collaboration
│   │   ├── core/              # Core functionality
│   │   │   ├── security.py    # JWT, password hashing
│   │   │   └── dependencies.py # Auth dependencies
│   │   ├── services/          # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── email_service.py
│   │   │   ├── session_service.py
│   │   │   └── security_service.py
│   │   ├── schemas/           # Pydantic models
│   │   ├── utils/             # Utilities
│   │   │   ├── device_parser.py
│   │   │   └── token_manager.py
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # MongoDB connection
│   │   └── main.py            # FastAPI app
│   ├── venv/                  # Virtual environment
│   ├── .env                   # Environment variables
│   └── requirements.txt       # Python dependencies
│
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # React context
│   │   ├── services/          # API services
│   │   └── App.tsx            # Main app
│   └── package.json
│
└── README.md                  # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Python**: 3.12 or higher
- **Node.js**: 16.x or higher
- **MongoDB**: Atlas account (free tier works)
- **Gmail**: For email service (or other SMTP provider)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TaskFlow.git
   cd TaskFlow/backend
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
   # Edit .env with your credentials
   ```

   Required variables:
   ```env
   # MongoDB
   MONGO_URI=your-mongodb-atlas-uri
   
   # JWT
   JWT_SECRET=your-secret-key-min-32-chars
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=30
   
   # Email (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=your-email@gmail.com
   
   # Frontend
   FRONTEND_URL=http://localhost:3000
   ```

5. **Run the server**
   ```bash
   ./venv/bin/uvicorn app.main:app --reload --port 8000
   ```

   Server will start at: http://localhost:8000
   
   API Documentation: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd ../client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   
   Update `src/services/api.js`:
   ```javascript
   const API_BASE_URL = "http://localhost:8000/api/v1";
   ```

4. **Start development server**
   ```bash
   npm start
   ```

   Frontend will start at: http://localhost:3000

---

## 📧 Email Configuration

### Gmail SMTP Setup

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)" → "TaskFlow"
   - Copy the 16-character password (remove spaces)

3. **Update .env**
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop  # 16-char app password
   ```

For detailed email setup instructions, see `backend/EMAIL_SETUP_GUIDE.md`

---

## 🔐 Authentication Flow

### Registration
1. User registers with name, email, password
2. Account created with `isEmailVerified: false`
3. Verification email sent with 24-hour token
4. User clicks link to verify email
5. Account activated

### Login
1. User enters email and password
2. System checks if email is verified
3. If verified, generates access token (15 min) and refresh token (30 days)
4. Creates session with device information
5. Returns both tokens to client

### Token Refresh
1. Access token expires after 15 minutes
2. Client uses refresh token to get new access token
3. Refresh token valid for 30 days
4. No need to re-login frequently

### Logout
1. **Single Device**: Revokes current session, blacklists access token
2. **All Devices**: Revokes all sessions, blacklists current token

---

## 📚 API Endpoints

### Authentication (11 endpoints)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/verify-email` - Verify email with token
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token
- `POST /api/v1/auth/logout` - Logout current device
- `POST /api/v1/auth/logout-all` - Logout all devices
- `GET /api/v1/auth/sessions` - Get active sessions
- `DELETE /api/v1/auth/sessions/{id}` - Revoke specific session

### Users (5 endpoints)
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile (name, bio, appearance)
- `POST /api/v1/users/upload-avatar` - Upload user avatar image
- `PUT /api/v1/users/change-password` - Change password
- `DELETE /api/v1/users/profile` - Delete account and all data

### Tasks (13 endpoints)
- `GET /api/v1/tasks` - Get all tasks (with filters: folder_id, status)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/{id}` - Get task by ID
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Soft delete task (move to trash)
- `GET /api/v1/tasks/trash` - Get all trashed tasks
- `POST /api/v1/tasks/{id}/restore` - Restore task from trash
- `DELETE /api/v1/tasks/{id}/permanent` - Permanently delete task
- `POST /api/v1/tasks/{id}/assign` - Assign user to task
- `POST /api/v1/tasks/{id}/invite` - Invite collaborator by email
- `GET /api/v1/tasks/{id}/collaborators` - Get task collaborators
- `DELETE /api/v1/tasks/{id}/collaborators/{user_id}` - Remove collaborator

### Notes (14 endpoints)
- `GET /api/v1/notes` - Get all notes (filters: folder_id, tags, is_pinned, is_archived, is_favorite)
- `GET /api/v1/notes/favorites` - Get favorite/starred notes
- `POST /api/v1/notes` - Create note (supports Markdown/Rich Text)
- `GET /api/v1/notes/{id}` - Get note by ID
- `PUT /api/v1/notes/{id}` - Update note
- `PUT /api/v1/notes/{id}/pin` - Pin/unpin note
- `DELETE /api/v1/notes/{id}` - Soft delete note (move to trash)
- `GET /api/v1/notes/trash` - Get trashed notes
- `POST /api/v1/notes/{id}/restore` - Restore note from trash
- `DELETE /api/v1/notes/{id}/permanent` - Permanently delete note
- `POST /api/v1/notes/{id}/invite` - Invite collaborator by email
- `GET /api/v1/notes/{id}/collaborators` - Get note collaborators
- `DELETE /api/v1/notes/{id}/collaborators/{user_id}` - Remove collaborator

### Habits (13 endpoints)
- `GET /api/v1/habits` - Get all habits (filters: is_active, category)
- `POST /api/v1/habits` - Create habit
- `GET /api/v1/habits/{id}` - Get habit by ID with streak info
- `PUT /api/v1/habits/{id}` - Update habit
- `DELETE /api/v1/habits/{id}` - Archive habit (soft delete)
- `POST /api/v1/habits/{id}/log` - Mark habit as done for a date
- `DELETE /api/v1/habits/{id}/log/{date}` - Remove habit log entry
- `GET /api/v1/habits/{id}/logs` - Get habit logs (with date range)
- `GET /api/v1/habits/logs/monthly` - Get all habit logs for a month
- `POST /api/v1/habits/{id}/share` - Share habit with accountability partner
- `DELETE /api/v1/habits/{id}/share/{user_id}` - Unshare habit
- `GET /api/v1/habits/{id}/collaborators` - Get habit collaborators

### Analytics (3 endpoints)
- `GET /api/v1/analytics/summary` - Get comprehensive analytics summary
- `GET /api/v1/analytics/heatmap` - Get heatmap data (GitHub-style contribution graph)
- `GET /api/v1/analytics/social/feed` - Get social activity feed from shared habits

### Folders (6 endpoints)
- `GET /api/v1/folders` - Get all folders
- `POST /api/v1/folders` - Create folder
- `PUT /api/v1/folders/{id}` - Update folder
- `DELETE /api/v1/folders/{id}` - Delete folder
- `POST /api/v1/folders/{id}/share` - Share folder with team
- `DELETE /api/v1/folders/{id}/share/{team_id}` - Unshare folder from team

### Teams (9 endpoints)
- `GET /api/v1/teams` - Get all teams (where user is owner or member)
- `POST /api/v1/teams` - Create team
- `PUT /api/v1/teams/{id}` - Update team (owner only)
- `DELETE /api/v1/teams/{id}` - Delete team (owner only)
- `GET /api/v1/teams/{id}/members` - Get team members
- `POST /api/v1/teams/{id}/invite` - Invite member by email
- `PUT /api/v1/teams/{id}/members/{user_id}/role` - Update member role
- `DELETE /api/v1/teams/{id}/members/{user_id}` - Remove team member
- `GET /api/v1/teams/{id}/activity` - Get team activity history

**Total: 80+ API Endpoints**

**Full API Documentation**: http://localhost:8000/docs

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Test SMTP connection
./venv/bin/python test_smtp.py

# Test authentication flow
./test_auth.sh

# Manual email verification
./venv/bin/python verify_email_manual.py user@example.com
```

### Frontend Tests

```bash
cd client
npm test
```

---

## 🔒 Security Features

### Password Security
- **Argon2** hashing (more secure than bcrypt)
- Minimum 6 characters required
- Passwords never stored in plain text

### Token Security
- **Access tokens**: Short-lived (15 minutes)
- **Refresh tokens**: Stored in database, can be revoked
- **Token blacklisting**: Immediate invalidation on logout
- **HTTPS recommended** for production

### Account Security
- **Email verification** required before login
- **Account lockout** after 5 failed attempts (15 minutes)
- **Rate limiting** on authentication endpoints
- **Security logging** for audit trail

### Session Security
- **Device tracking** with fingerprinting
- **IP address** logging
- **New device alerts** via email
- **Session limits** (max 5 devices per user)

---

## 🌐 Deployment

### Backend (FastAPI)

**Recommended platforms:**
- **Render** (easiest)
- **Railway**
- **Heroku**
- **AWS EC2**
- **DigitalOcean**

**Environment variables to set:**
- All variables from `.env`
- Set `ENVIRONMENT=production`
- Use production MongoDB URI
- Configure production email service (SendGrid/AWS SES recommended)

### Frontend (React)

**Recommended platforms:**
- **Vercel** (easiest)
- **Netlify**
- **AWS S3 + CloudFront**

**Build command:**
```bash
npm run build
```

**Update API URL** in production build to point to deployed backend.

---

## 📖 Documentation

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Email Setup**: `backend/EMAIL_SETUP_GUIDE.md`
- **Frontend Integration**: `backend/FRONTEND_INTEGRATION.md`
- **Test Results**: `backend/ENDPOINT_TEST_RESULTS.md`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Mirza Shafi**
- GitHub: [@mirzashafi](https://github.com/mirzashafi)
- Email: mirza.md.shafi.uddin@gmail.com

---

## 🙏 Acknowledgments

- FastAPI for the amazing web framework
- MongoDB for the flexible database
- React for the powerful frontend library
- All open-source contributors

---

## 📊 Project Stats

- **Backend**: ~5,000+ lines of Python code
- **Frontend**: React with TypeScript
- **API Endpoints**: 80+ endpoints across 8 modules
- **Database Collections**: 10+ collections
- **Authentication**: Enterprise-grade security
- **Email Templates**: 3 beautiful HTML templates
- **Documentation**: Auto-generated Swagger UI

---

**⭐ If you find this project useful, please give it a star!**