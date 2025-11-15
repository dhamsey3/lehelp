import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { getRedisClient } from '../config/redis';
import { storageService } from '../config/storage';
import { emailService } from '../config/email';
import { aiService } from '../services/ai';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/v1/test - Test all service integrations
 */
router.get('/', async (req: Request, res: Response) => {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Test PostgreSQL
  try {
    const dbResult = await pool.query('SELECT NOW() as time, version() as version');
    results.services.postgres = {
      status: 'connected',
      time: dbResult.rows[0].time,
      version: dbResult.rows[0].version.split(' ')[0],
    };
  } catch (error: any) {
    results.services.postgres = {
      status: 'error',
      error: error.message,
    };
  }

  // Test Redis
  try {
    const redis = getRedisClient();
    await redis.set('health_check', 'ok', { EX: 60 });
    const value = await redis.get('health_check');
    results.services.redis = {
      status: value === 'ok' ? 'connected' : 'error',
      ping: value,
    };
  } catch (error: any) {
    results.services.redis = {
      status: 'error',
      error: error.message,
    };
  }

  // Test S3/MinIO (just check client, don't upload)
  try {
    results.services.storage = {
      status: 'configured',
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT || 'AWS S3',
    };
  } catch (error: any) {
    results.services.storage = {
      status: 'error',
      error: error.message,
    };
  }

  // Test Email (check config only)
  try {
    results.services.email = {
      status: 'configured',
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      from: process.env.SMTP_FROM,
    };
  } catch (error: any) {
    results.services.email = {
      status: 'error',
      error: error.message,
    };
  }

  // Test AI Service
  try {
    results.services.ai = {
      status: 'configured',
      url: process.env.AI_SERVICE_URL,
      note: 'Call /test-ai to verify AI service is running',
    };
  } catch (error: any) {
    results.services.ai = {
      status: 'error',
      error: error.message,
    };
  }

  // Overall status
  const hasErrors = Object.values(results.services).some(
    (service: any) => service.status === 'error'
  );

  res.status(hasErrors ? 500 : 200).json({
    status: hasErrors ? 'degraded' : 'healthy',
    ...results,
  });
});

/**
 * POST /api/v1/test/email - Send test email
 */
router.post('/email', async (req: Request, res: Response) => {
  try {
    const { to } = req.body;
    
    await emailService.sendEmail({
      to: to || 'test@example.com',
      subject: 'LEHELP Test Email',
      html: `
        <h2>✅ Email Integration Working!</h2>
        <p>This is a test email from LEHELP platform.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr>
        <p><small>View this email in MailHog: <a href="http://localhost:8025">http://localhost:8025</a></small></p>
      `,
      text: `Email integration working! Timestamp: ${new Date().toISOString()}`,
    });

    res.json({
      status: 'success',
      message: 'Test email sent',
      note: 'Check MailHog at http://localhost:8025',
    });
  } catch (error: any) {
    logger.error('Error sending test email:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/test/ai - Test AI service
 */
router.post('/ai', async (req: Request, res: Response) => {
  try {
    const result = await aiService.triageCase({
      description: 'Test case: I need legal assistance with a labor dispute.',
      language: 'en',
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error: any) {
    logger.error('Error testing AI service:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

export { router as testRouter };
