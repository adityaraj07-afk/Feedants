import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import competitionRoutes from './routes/competitionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { Competition } from './models/index.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for Expo / React Native Web and native apps
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  })
);

app.use(express.json());

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    serverTime: new Date().toISOString(),
    service: 'Feedants Competition API',
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api/competitions', competitionRoutes);
app.use('/api/users', userRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Server Initialization
async function startServer() {
  try {
    await connectDB();

    // Auto-seed if empty
    const count = await Competition.countDocuments();
    if (count === 0) {
      console.log('[Seed] Database is empty. Automatically running seed script...');
      await seedDatabase();
    } else {
      console.log(`[Seed] Found ${count} existing competitions in database.`);
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Feedants Backend API listening on port ${PORT}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🏆 Competitions: http://localhost:${PORT}/api/competitions`);
      console.log(`👥 Users:        http://localhost:${PORT}/api/users`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
