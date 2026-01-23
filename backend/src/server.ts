import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
// Import configurations
import { config, validateEnv } from '@/config/environment';
import { connectDatabase } from '@/config/database';

// Import routes
import authRoutes from '@/routes/auth.routes';
import taskRoutes from '@/routes/task.routes';
import userRoutes from '@/routes/user.routes';
import folderRoutes from '@/routes/folder.routes';
import teamRoutes from '@/routes/team.routes';

// Import middleware
import { errorHandler } from '@/middleware/error.middleware';

// Validate environment variables
validateEnv();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads/avatars directory');
}

const app: Application = express();

// ===================================
// === CORS CONFIGURATION ===
// ===================================
app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));

// ===================================
// === MIDDLEWARE ===
// ===================================
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// ===================================
// === API ROUTES ===
// ===================================
app.use('/api/users', authRoutes); // Auth (login/register)
app.use('/api/user', userRoutes);   // User Profile
app.use('/api/tasks', taskRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/teams', teamRoutes);

// Root route for testing
app.get('/', (_req: Request, res: Response) => {
  res.send('API is running...');
});

// ===================================
// === ERROR HANDLING ===
// ===================================
app.use(errorHandler);

// ===================================
// === DATABASE CONNECTION & SERVER START ===
// ===================================
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
