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
  displayName: Joi.string().min(2).max(100),
  organization: Joi.string().max(200),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  mfaCode: Joi.string().length(6).pattern(/^\d+$/),
});

// POST /api/v1/auth/register - Register new user
router.post('/register', async (req: Request, res: Response) => {
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
    
    // Generate user ID and verification token
    const userId = uuidv4();
    const verificationToken = anonymous ? null : uuidv4();

    // Insert user
    await pool.query(
      `INSERT INTO users (
        id, email, password_hash, role, email_verified, 
        verification_token, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [userId, anonymous ? null : email, hashedPassword, role, anonymous, verificationToken]
    );

    // Create user profile
    await pool.query(
      `INSERT INTO user_profiles (
        id, user_id, display_name, organization, anonymous, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [uuidv4(), userId, displayName || 'Anonymous User', organization, anonymous]
    );

    // Send verification email if not anonymous
    if (!anonymous && email && verificationToken) {
      try {
        await emailService.sendVerificationEmail(email, verificationToken);
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
          emailVerified: anonymous,
        },
        token,
        message: anonymous ? 'Account created' : 'Please check your email to verify your account',
      },
    });
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
});

// POST /api/v1/auth/login - Login user
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { email, password, mfaCode } = value;

    // Retrieve user from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.email_verified, u.account_locked,
              up.display_name, up.anonymous
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if account is locked
    if (user.account_locked) {
      throw new AuthenticationError('Account is locked. Please contact support.');
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

    // Store refresh token in Redis
    const redis = getRedisClient();
    await redis.set(`refresh_token:${user.id}`, refreshToken, { EX: 7 * 24 * 3600 });

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
          emailVerified: user.email_verified,
          anonymous: user.anonymous,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    throw error;
  }
});

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;
    const decoded = jwt.verify(refreshToken, refreshSecret) as { id: string };

    // Verify token exists in Redis
    const redis = getRedisClient();
    const storedToken = await redis.get(`refresh_token:${decoded.id}`);
    
    if (!storedToken || storedToken !== refreshToken) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Retrieve user from database
    const result = await pool.query(
      `SELECT u.id, u.email, u.role, up.display_name
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = $1 AND u.account_locked = false`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      throw new AuthenticationError('User not found or account locked');
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
      throw new AuthenticationError('Invalid refresh token');
    }
    logger.error('Token refresh error:', error);
    throw error;
  }
});

// POST /api/v1/auth/logout - Logout user
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token) as { id?: string };
      
      if (decoded?.id) {
        // Remove refresh token from Redis
        const redis = getRedisClient();
        await redis.del(`refresh_token:${decoded.id}`);
      }
    }
    
    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    throw error;
  }
});

// GET /api/v1/auth/verify-email/:token - Verify email address
router.get('/verify-email/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const result = await pool.query(
      'SELECT id, email FROM users WHERE verification_token = $1 AND email_verified = false',
      [token]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Invalid or expired verification token');
    }

    const user = result.rows[0];

    // Mark email as verified
    await pool.query(
      'UPDATE users SET email_verified = true, verification_token = NULL WHERE id = $1',
      [user.id]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, resource_type, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), user.id, 'email_verified', 'user']
    );

    res.json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    logger.error('Email verification error:', error);
    throw error;
  }
});

// POST /api/v1/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ValidationError('Email is required');
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const resetToken = uuidv4();

      // Store reset token with 1-hour expiration
      await pool.query(
        `UPDATE users 
         SET password_reset_token = $1, password_reset_expires = NOW() + INTERVAL '1 hour'
         WHERE id = $2`,
        [resetToken, user.id]
      );

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(email, resetToken);
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
      }
    }

    // Always return success to prevent email enumeration
    res.json({
      status: 'success',
      message: 'If the email exists, a password reset link has been sent',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    throw error;
  }
});

// POST /api/v1/auth/reset-password - Reset password with token
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new ValidationError('Token and new password are required');
    }

    if (newPassword.length < 8) {
      throw new ValidationError('Password must be at least 8 characters');
    }

    const result = await pool.query(
      `SELECT id FROM users 
       WHERE password_reset_token = $1 
       AND password_reset_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const user = result.rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await pool.query(
      `UPDATE users 
       SET password_hash = $1, 
           password_reset_token = NULL, 
           password_reset_expires = NULL,
           updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, resource_type, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), user.id, 'password_reset', 'user']
    );

    res.json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    throw error;
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
