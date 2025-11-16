import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import dns from 'dns';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { caseRouter } from './routes/cases';
import { userRouter } from './routes/users';
import { documentRouter } from './routes/documents';
import { messageRouter } from './routes/messages';
import { testRouter } from './routes/test';
import { pool, closeDatabase } from './config/database';
import { initRedis, closeRedis } from './config/redis';

dotenv.config();

// Force IPv4 DNS resolution for Supabase compatibility
dns.setDefaultResultOrder('ipv4first');

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Trust Render's proxy (required for X-Forwarded-For header)
app.set('trust proxy', 1);

// Initialize services
const initializeServices = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    logger.info('PostgreSQL connection verified');
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // Initialize Redis (optional - for distributed rate limiting)
  try {
    await initRedis();
    logger.info('Redis connected - using distributed rate limiting');
  } catch (error) {
    logger.warn('Redis unavailable - using in-memory rate limiting:', error);
  }
  
  logger.info('All required services initialized successfully');
};

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin matches allowed origins or Vercel preview domains
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || 
      (allowed.includes('vercel.app') && origin.endsWith('.vercel.app'))
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Health check endpoint
// Root route
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'LEHELP API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: 'https://github.com/dhamsey3/lehelp',
    },
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/cases', caseRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/documents', documentRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/test', testRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await closeDatabase();
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await closeDatabase();
  await closeRedis();
  process.exit(0);
});

// Start server
const startServer = async () => {
  await initializeServices();
  
  app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
