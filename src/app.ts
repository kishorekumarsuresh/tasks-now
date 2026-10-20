import express, { Request, Response } from 'express';
import cors from 'cors';
import taskRoutes from './modules/tasks/task.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';

const app = express();

// Enable CORS for frontend clients
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 1. Global Pre-route Middleware
app.use(express.json());
app.use(requestLogger);

// 2. Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 3. Fallback for Unknown Routes (404)
app.use(notFoundHandler);

// 4. Centralized Error Handler (Last in pipeline)
app.use(errorHandler);

export default app;