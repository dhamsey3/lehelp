import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest, authenticate } from '../middleware/auth';
import { ValidationError } from '../middleware/errorHandler';
import Joi from 'joi';
import { pool } from '../config/database';
import { aiService } from '../services/ai';
import { emailService } from '../config/email';
import { logger } from '../utils/logger';

const router = Router();

// Validation schemas
const createCaseSchema = Joi.object({
  title: Joi.string().required().min(5).max(200),
  description: Joi.string().required().min(20).max(5000),
  caseType: Joi.string().required().valid(
    'asylum',
    'refugee',
    'torture',
    'arbitrary_detention',
    'disappearance',
    'discrimination',
    'freedom_expression',
    'other'
  ),
  urgency: Joi.string().required().valid('low', 'medium', 'high', 'critical'),
  location: Joi.object({
    country: Joi.string().required(),
    city: Joi.string(),
    region: Joi.string(),
  }),
  anonymous: Joi.boolean().default(false),
});

// GET /api/v1/cases - List cases
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status, type, page = '1', limit = '20', urgency } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let query = `
      SELECT c.id, c.title, c.case_type, c.status, c.urgency, c.created_at,
             c.location, c.anonymous, u.id as client_id, up.display_name as client_name,
             l.id as lawyer_id, lp.display_name as lawyer_name
      FROM cases c
      LEFT JOIN users u ON c.client_id = u.id
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN users l ON c.lawyer_id = l.id
      LEFT JOIN user_profiles lp ON l.id = lp.user_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 1;

    // Filter by user role
    if (userRole === 'client') {
      query += ` AND c.client_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    } else if (userRole === 'lawyer') {
      query += ` AND (c.lawyer_id = $${paramCount} OR c.status = 'pending_assignment')`;
      params.push(userId);
      paramCount++;
    }

    // Additional filters
    if (status) {
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      query += ` AND c.case_type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (urgency) {
      query += ` AND c.urgency = $${paramCount}`;
      params.push(urgency);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      query.replace('SELECT c.id,', 'SELECT COUNT(*) as total,').split('ORDER BY')[0],
      params
    );
    const total = parseInt(countResult.rows[0]?.total || '0');

    // Get paginated results
    query += ` ORDER BY 
      CASE c.urgency 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        ELSE 4 
      END,
      c.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      status: 'success',
      data: {
        cases: result.rows,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    logger.error('Error listing cases:', error);
    throw error;
  }
});

// GET /api/v1/cases/:id - Get case details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const result = await pool.query(
      `SELECT c.*, 
              json_build_object('id', u.id, 'displayName', up.display_name, 'anonymous', up.anonymous) as client,
              json_build_object('id', l.id, 'displayName', lp.display_name, 'email', l.email) as lawyer
       FROM cases c
       LEFT JOIN users u ON c.client_id = u.id
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN users l ON c.lawyer_id = l.id
       LEFT JOIN user_profiles lp ON l.id = lp.user_id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Case not found');
    }

    const caseData = result.rows[0];

    // Authorization check
    const hasAccess = 
      userRole === 'admin' ||
      caseData.client_id === userId ||
      caseData.lawyer_id === userId ||
      (userRole === 'lawyer' && caseData.status === 'pending_assignment');

    if (!hasAccess) {
      throw new ValidationError('Access denied');
    }

    // Get case events
    const events = await pool.query(
      `SELECT id, event_type, description, created_by, created_at, metadata
       FROM case_events
       WHERE case_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [id]
    );

    res.json({
      status: 'success',
      data: {
        case: {
          ...caseData,
          events: events.rows,
        },
      },
    });
  } catch (error) {
    logger.error('Error getting case:', error);
    throw error;
  }
});

// POST /api/v1/cases - Create new case
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = createCaseSchema.validate(req.body);
    
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const userId = req.user?.id;
    const { title, description, caseType, urgency, location, anonymous } = value;

    // Create case ID
    const caseId = uuidv4();

    // Use AI to triage the case
    let triageResult;
    try {
      triageResult = await aiService.triageCase({
        description,
        category: caseType,
        urgency,
        language: req.headers['accept-language']?.split(',')[0] || 'en',
      });
      logger.info('AI triage result:', triageResult);
    } catch (aiError) {
      logger.error('AI triage failed, using defaults:', aiError);
      triageResult = {
        category: caseType,
        urgency,
        confidence: 0.5,
        suggestedActions: [],
      };
    }

    // Insert case into database
    await pool.query(
      `INSERT INTO cases (
        id, title, description, case_type, status, urgency,
        location, client_id, anonymous, ai_triage_result, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [
        caseId,
        title,
        description,
        triageResult.category,
        'pending_assignment',
        triageResult.urgency,
        JSON.stringify(location),
        userId,
        anonymous,
        JSON.stringify(triageResult),
      ]
    );

    // Log case creation event
    await pool.query(
      `INSERT INTO case_events (id, case_id, event_type, description, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        uuidv4(),
        caseId,
        'case_created',
        'Case submitted and triaged',
        userId,
      ]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_logs (id, user_id, action, resource_type, resource_id, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [
        uuidv4(),
        userId,
        'case_create',
        'case',
        caseId,
        JSON.stringify({ caseType, urgency: triageResult.urgency }),
      ]
    );

    // Try to find matching lawyers
    try {
      const matches = await aiService.matchLawyers({
        caseId,
        category: triageResult.category,
        location: location.country,
        language: req.headers['accept-language']?.split(',')[0] || 'en',
      });

      if (matches.matches && matches.matches.length > 0) {
        logger.info(`Found ${matches.matches.length} potential lawyer matches`);
        // Could automatically assign or notify top matches
      }
    } catch (matchError) {
      logger.error('Lawyer matching failed:', matchError);
    }

    res.status(201).json({
      status: 'success',
      data: {
        case: {
          id: caseId,
          title,
          description,
          caseType: triageResult.category,
          status: 'pending_assignment',
          urgency: triageResult.urgency,
          location,
          anonymous,
          createdAt: new Date().toISOString(),
          triageConfidence: triageResult.confidence,
          suggestedActions: triageResult.suggestedActions,
        },
      },
    });
  } catch (error) {
    logger.error('Error creating case:', error);
    throw error;
  }
});

// PATCH /api/v1/cases/:id - Update case
router.patch('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status, notes } = req.body;

    // Check authorization
    const caseResult = await pool.query(
      'SELECT client_id, lawyer_id, status FROM cases WHERE id = $1',
      [id]
    );

    if (caseResult.rows.length === 0) {
      throw new ValidationError('Case not found');
    }

    const caseData = caseResult.rows[0];
    const canUpdate = 
      caseData.client_id === userId || 
      caseData.lawyer_id === userId ||
      req.user?.role === 'admin';

    if (!canUpdate) {
      throw new ValidationError('Access denied');
    }

    // Update case
    const updates: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (updates.length === 0) {
      throw new ValidationError('No valid updates provided');
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    await pool.query(
      `UPDATE cases SET ${updates.join(', ')} WHERE id = $${paramCount}`,
      params
    );

    // Log event
    if (status && status !== caseData.status) {
      await pool.query(
        `INSERT INTO case_events (id, case_id, event_type, description, created_by, created_at, metadata)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)`,
        [
          uuidv4(),
          id,
          'status_changed',
          `Status changed from ${caseData.status} to ${status}`,
          userId,
          JSON.stringify({ from: caseData.status, to: status, notes }),
        ]
      );
    }

    res.json({
      status: 'success',
      data: {
        case: {
          id,
          status,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error('Error updating case:', error);
    throw error;
  }
});

// POST /api/v1/cases/:id/assign - Assign case to lawyer
router.post('/:id/assign', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { lawyerId } = req.body;
    const userId = req.user?.id;

    if (!lawyerId) {
      throw new ValidationError('Lawyer ID is required');
    }

    // Verify lawyer exists and has lawyer role
    const lawyerResult = await pool.query(
      'SELECT id, email FROM users WHERE id = $1 AND role = $2',
      [lawyerId, 'lawyer']
    );

    if (lawyerResult.rows.length === 0) {
      throw new ValidationError('Invalid lawyer ID');
    }

    const lawyer = lawyerResult.rows[0];

    // Get case details
    const caseResult = await pool.query(
      'SELECT title, client_id, status FROM cases WHERE id = $1',
      [id]
    );

    if (caseResult.rows.length === 0) {
      throw new ValidationError('Case not found');
    }

    const caseData = caseResult.rows[0];

    // Assign lawyer
    await pool.query(
      `UPDATE cases 
       SET lawyer_id = $1, status = 'assigned', updated_at = NOW()
       WHERE id = $2`,
      [lawyerId, id]
    );

    // Create case assignment record
    await pool.query(
      `INSERT INTO case_assignments (id, case_id, lawyer_id, assigned_by, assigned_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [uuidv4(), id, lawyerId, userId]
    );

    // Log event
    await pool.query(
      `INSERT INTO case_events (id, case_id, event_type, description, created_by, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [
        uuidv4(),
        id,
        'case_assigned',
        `Case assigned to lawyer`,
        userId,
      ]
    );

    // Send notification email to lawyer
    try {
      await emailService.sendCaseAssignmentEmail(
        lawyer.email,
        id,
        caseData.title
      );
    } catch (emailError) {
      logger.error('Failed to send assignment email:', emailError);
    }

    res.json({
      status: 'success',
      data: {
        case: {
          id,
          assignedTo: lawyerId,
          assignedAt: new Date().toISOString(),
          status: 'assigned',
        },
      },
    });
  } catch (error) {
    logger.error('Error assigning case:', error);
    throw error;
  }
});

export { router as caseRouter };
