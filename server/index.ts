import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

import { CardManager } from './services/cardManager';
import { AIOrchestrator } from './services/aiOrchestrator';
import { WebSocketHandler } from './services/websocketHandler';
import { Logger } from './utils/logger';
import cardRoutes from './routes/cards';
import agentRoutes from './routes/agents';
import { Card, MessageType, WebSocketMessage } from '../shared/types';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;
const logger = new Logger();

// Initialize services
const cardManager = new CardManager();
const aiOrchestrator = new AIOrchestrator(cardManager);
const wsHandler = new WebSocketHandler(io, cardManager, aiOrchestrator);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API Routes
app.use('/api/cards', cardRoutes(cardManager, wsHandler));
app.use('/api/agents', agentRoutes(aiOrchestrator));

// Demo mode endpoint
app.post('/api/demo/start', async (req, res) => {
  try {
    if (process.env.DEMO_MODE === 'true') {
      await aiOrchestrator.startDemoSequence();
      res.json({ success: true, message: 'Demo sequence started' });
    } else {
      res.status(400).json({ success: false, error: 'Demo mode is disabled' });
    }
  } catch (error) {
    logger.error('Error starting demo sequence:', error);
    res.status(500).json({ success: false, error: 'Failed to start demo sequence' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Send current cards to newly connected client
  const cards = cardManager.getAllCards();
  socket.emit('initial_cards', cards);
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
  
  // Handle heartbeat
  socket.on('heartbeat', () => {
    socket.emit('heartbeat_response', { timestamp: new Date() });
  });
});

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 AI Agent Orchestrator server running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready for connections`);
  logger.info(`🎭 Demo mode: ${process.env.DEMO_MODE === 'true' ? 'enabled' : 'disabled'}`);
  
  // Start demo sequence if enabled and auto-start is configured
  if (process.env.DEMO_MODE === 'true' && process.env.DEMO_AUTO_START === 'true') {
    setTimeout(() => {
      aiOrchestrator.startDemoSequence().catch(error => {
        logger.error('Failed to start demo sequence:', error);
      });
    }, 3000); // Wait 3 seconds for client connections
  }
});

export { app, server, io };
