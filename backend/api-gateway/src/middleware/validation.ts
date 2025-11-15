import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Remove any potential XSS payloads from strings
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove script tags and other dangerous patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Validation schemas
export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .message('Password must contain uppercase, lowercase, number, and special character'),
    firstName: Joi.string().max(100).optional(),
    lastName: Joi.string().max(100).optional(),
    role: Joi.string().valid('client', 'lawyer', 'activist', 'admin').required(),
    organization: Joi.string().max(255).optional(),
    anonymous: Joi.boolean().optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createCase: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(20).max(5000).required(),
    caseType: Joi.string().valid(
      'arbitrary_detention',
      'torture',
      'disappearance',
      'discrimination',
      'freedom_of_expression',
      'freedom_of_assembly',
      'property_rights',
      'labor_rights',
      'refugee_rights',
      'other'
    ).required(),
    urgencyLevel: Joi.string().valid('low', 'medium', 'high', 'critical').required(),
    location: Joi.object({
      country: Joi.string().required(),
      city: Joi.string().optional(),
      region: Joi.string().optional(),
    }).required(),
    anonymous: Joi.boolean().optional(),
  }),

  updateCase: Joi.object({
    title: Joi.string().min(5).max(200).optional(),
    description: Joi.string().min(20).max(5000).optional(),
    status: Joi.string().valid(
      'submitted',
      'under_review',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'rejected'
    ).optional(),
  }),
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    req.body = value;
    next();
  };
};
