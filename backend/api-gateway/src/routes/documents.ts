import { Router, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest, authenticate } from '../middleware/auth';
import { storageService } from '../config/storage';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, images, and text files are allowed.'));
    }
  },
});

// GET /api/v1/documents - List documents
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const result = await pool.query(
      `SELECT 
        id, filename, file_size, mime_type, 
        uploaded_at, encrypted, case_id
      FROM documents 
      WHERE uploaded_by = $1 
      ORDER BY uploaded_at DESC 
      LIMIT 50`,
      [userId]
    );

    res.json({
      status: 'success',
      data: {
        documents: result.rows,
      },
    });
  } catch (error) {
    logger.error('Error listing documents:', error);
    throw error;
  }
});

// POST /api/v1/documents - Upload document
router.post('/', authenticate, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
      });
    }

    const userId = req.user?.id;
    const { caseId, category } = req.body;
    
    // Generate unique storage key
    const fileExtension = req.file.originalname.split('.').pop();
    const storageKey = `documents/${userId}/${uuidv4()}.${fileExtension}`;

    // Upload to S3/MinIO
    await storageService.uploadFile({
      key: storageKey,
      body: req.file.buffer,
      contentType: req.file.mimetype,
      metadata: {
        'original-filename': req.file.originalname,
        'uploaded-by': userId || 'anonymous',
        'case-id': caseId || '',
      },
    });

    // Save metadata to database
    const result = await pool.query(
      `INSERT INTO documents (
        id, filename, storage_key, file_size, mime_type,
        uploaded_by, case_id, category, encrypted
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, filename, uploaded_at`,
      [
        uuidv4(),
        req.file.originalname,
        storageKey,
        req.file.size,
        req.file.mimetype,
        userId,
        caseId || null,
        category || 'general',
        true, // Client-side encryption expected
      ]
    );

    res.status(201).json({
      status: 'success',
      data: {
        document: result.rows[0],
      },
    });
  } catch (error) {
    logger.error('Error uploading document:', error);
    throw error;
  }
});

// GET /api/v1/documents/:id - Get document download URL
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get document metadata and verify access
    const result = await pool.query(
      `SELECT d.*, c.client_id, c.lawyer_id
       FROM documents d
       LEFT JOIN cases c ON d.case_id = c.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
      });
    }

    const document = result.rows[0];

    // Verify user has access to this document
    const hasAccess = 
      document.uploaded_by === userId ||
      document.client_id === userId ||
      document.lawyer_id === userId;

    if (!hasAccess) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied',
      });
    }

    // Generate signed download URL (valid for 1 hour)
    const downloadUrl = await storageService.getSignedDownloadUrl(
      document.storage_key,
      3600
    );

    res.json({
      status: 'success',
      data: {
        document: {
          id: document.id,
          filename: document.filename,
          fileSize: document.file_size,
          mimeType: document.mime_type,
          downloadUrl,
          expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error('Error getting document:', error);
    throw error;
  }
});

// DELETE /api/v1/documents/:id - Delete document
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Get document and verify ownership
    const result = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND uploaded_by = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found or access denied',
      });
    }

    const document = result.rows[0];

    // Delete from storage
    await storageService.deleteFile(document.storage_key);

    // Delete from database
    await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    res.json({
      status: 'success',
      message: 'Document deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting document:', error);
    throw error;
  }
});

export { router as documentRouter };
