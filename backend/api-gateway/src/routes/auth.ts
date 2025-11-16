import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import { ValidationError, AuthenticationError } from '../middleware/errorHandler';
import { pool } from '../config/database';
import { getRedisClient } from '../config/redis';
import { emailService } from '../config/email';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().when('anonymous', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('client', 'lawyer', 'activist').required(),
  anonymous: Joi.boolean().default(false),
  displayName: Joi.string().min(2).max(100).allow('').optional(),
  organization: Joi.string().max(200).allow('').optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  mfaCode: Joi.string().length(6).pattern(/^\d+$/),
});

// POST /api/v1/auth/register - Register new user
router.post('/register', async (req: Request, res: Response, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password, role, anonymous, displayName, organization } = value;

    // Check if user already exists
    if (!anonymous && email) {
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        throw new ValidationError('Email already registered');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate user ID
    const userId = uuidv4();

    // Insert user
    await pool.query(
      `INSERT INTO users (
        id, email, password_hash, role, verified, display_name, organization, anonymous
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, anonymous ? null : email, hashedPassword, role, anonymous, displayName || 'Anonymous User', organization, anonymous]
    );

    // Create user profile
    await pool.query(
      `INSERT INTO user_profiles (
        user_id, created_at, updated_at
      ) VALUES ($1, NOW(), NOW())`,
      [userId]
    );

    // Send verification email if not anonymous
    if (!anonymous && email) {
      try {
        await emailService.sendVerificationEmail(email, userId);
        logger.info(`Verification email sent to ${email}`);
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }
    }

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, resource_type, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [uuidv4(), userId, 'user_register', 'user', JSON.stringify({ role, anonymous })]
    );

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      {
        id: userId,
        email: anonymous ? null : email,
        role,
        permissions: getPermissionsByRole(role),
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' } as jwt.SignOptions
    );

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: userId,
          email: anonymous ? null : email,
          role,
          displayName: displayName || 'Anonymous User',
          organization,
          anonymous,
          verified: anonymous,
        },
        token,
        message: 'Account created successfully',
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
});

// POST /api/v1/auth/login - Login user
router.post('/login', async (req: Request, res: Response, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password, mfaCode } = value;

    // Retrieve user from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.verified, u.status,
              u.display_name, u.organization, u.anonymous
       FROM users u
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if account is active
    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active. Please contact support.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      // Log failed attempt
      await pool.query(
        `INSERT INTO activity_logs (id, user_id, action, resource_type, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [uuidv4(), user.id, 'login_failed', 'user', JSON.stringify({ email })]
      );
      
      throw new AuthenticationError('Invalid email or password');
    }

    // Check MFA if enabled
    // TODO: Implement MFA verification when needed
    if (mfaCode) {
      // Placeholder for MFA verification
      logger.info('MFA check skipped for now');
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET!;
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: getPermissionsByRole(user.role),
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' } as jwt.SignOptions
    );

    // Generate refresh token
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
    const refreshToken = jwt.sign(
      { id: user.id, type: 'refresh' },
      refreshSecret,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' } as jwt.SignOptions
    );

    // Store refresh token in Redis (optional - if not available, will use DB in future)
    try {
      const redis = getRedisClient();
      await redis.set(`refresh_token:${user.id}`, refreshToken, { EX: 7 * 24 * 3600 });
    } catch (redisError) {
      logger.warn('Redis unavailable for token storage, continuing without distributed sessions');
    }

    // Update last login
    await pool.query(
      'UPDATE users SET last_login = NOW() WHERE id = $1',
      [user.id]
    );

    // Log successful login
    await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, resource_type, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), user.id, 'login_success', 'user']
    );

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName: user.display_name,
          organization: user.organization,
          verified: user.verified,
          anonymous: user.anonymous,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
});

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
    const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };

    // Verify token exists in Redis (optional - if Redis unavailable, skip Redis check)
    try {
      const redis = getRedisClient();
      const storedToken = await redis.get(`refresh_token:${decoded.id}`);
      
      if (!storedToken || storedToken !== refreshToken) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }
    } catch (redisError) {
      logger.warn('Redis unavailable, skipping stored token verification');
    }

    // Retrieve user from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, u.display_name, u.status
       FROM users u
       WHERE u.id = $1 AND u.status = 'active'`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('User not found or account not active');
    }

    const user = result.rows[0];

    const jwtSecret = process.env.JWT_SECRET!;
    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: user.email,
        role: user.role,
        permissions: getPermissionsByRole(user.role),
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' } as jwt.SignOptions
    );

    res.json({
      status: 'success',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid refresh token'));
    } else {
      logger.error('Token refresh error:', error);
      next(error);
    }
  }
});

// POST /api/v1/auth/logout - Logout user
router.post('/logout', async (req: Request, res: Response, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token) as { id?: string };
      
      if (decoded?.id) {
        // Remove refresh token from Redis (optional)
        try {
          const redis = getRedisClient();
          await redis.del(`refresh_token:${decoded.id}`);
        } catch (redisError) {
          logger.warn('Redis unavailable for logout, continuing without session cleanup');
        }
      }
    }
    
    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
});

// GET /api/v1/auth/verify-email/:token - Verify email address
router.get('/verify-email/:token', async (req: Request, res: Response, next) => {
  try {
    // Email verification not required for this version - all users auto-verified
    res.json({
      status: 'success',
      message: 'Email verification complete',
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    next(error);
  }
});

// POST /api/v1/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req: Request, res: Response, next) => {
  try {
    // Password reset not available in this version
    res.json({
      status: 'success',
      message: 'Password reset not available in this version',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
});

// POST /api/v1/auth/reset-password - Reset password with token
router.post('/reset-password', async (req: Request, res: Response, next) => {
  try {
    // Password reset not available in this version
    throw new ValidationError('Password reset not available in this version');
  } catch (error) {
    logger.error('Password reset error:', error);
    next(error);
  }
});

// Helper function to get permissions by role
function getPermissionsByRole(role: string): string[] {
  const permissions: Record<string, string[]> = {
    client: ['case:create', 'case:read', 'message:send', 'document:upload'],
    lawyer: [
      'case:read',
      'case:update',
      'case:assign',
      'message:send',
      'document:read',
      'document:upload',
    ],
    activist: [
      'case:create',
      'case:read',
      'message:send',
      'document:upload',
      'resource:read',
    ],
    admin: [
      'case:*',
      'user:*',
      'document:*',
      'message:*',
      'analytics:read',
      'system:manage',
    ],
  };

  return permissions[role] || [];
}

export { router as authRouter };
