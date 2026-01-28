import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.js';
import { teamsRouter } from './routes/teams.js';
import { gamesRouter } from './routes/games.js';
import { problemsRouter } from './routes/problems.js';
import { submissionsRouter } from './routes/submissions.js';
import { adminRouter } from './routes/admin.js';
import { setupSocketHandlers } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/games', gamesRouter);
app.use('/api/problems', problemsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);

// Error handling
app.use(errorHandler);

// Socket.io setup
setupSocketHandlers(io);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready for connections`);
});

export { app, io };
