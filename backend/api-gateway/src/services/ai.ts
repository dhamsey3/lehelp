import axios from 'axios';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_API_KEY = process.env.AI_API_KEY;

export interface CaseTriageRequest {
  description: string;
  category?: string;
  urgency?: string;
  language?: string;
}

export interface CaseTriageResponse {
  category: string;
  urgency: string;
  confidence: number;
  suggestedActions: string[];
}

export interface LawyerMatchRequest {
  caseId: string;
  category: string;
  location?: string;
  language?: string;
}

export interface LawyerMatchResponse {
  matches: Array<{
    lawyerId: string;
    score: number;
    reasoning: string;
  }>;
}

export interface AIService {
  triageCase: (request: CaseTriageRequest) => Promise<CaseTriageResponse>;
  matchLawyers: (request: LawyerMatchRequest) => Promise<LawyerMatchResponse>;
  analyzeDocument: (documentText: string) => Promise<any>;
}

export const aiService: AIService = {
  /**
   * Triage case using AI
   */
  async triageCase(request: CaseTriageRequest): Promise<CaseTriageResponse> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/v1/triage`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error calling AI triage service:', error);
      
      // Fallback to simple categorization
      return {
        category: request.category || 'general',
        urgency: request.urgency || 'medium',
        confidence: 0.5,
        suggestedActions: ['Manual review required'],
      };
    }
  },

  /**
   * Match lawyers to case using AI
   */
  async matchLawyers(request: LawyerMatchRequest): Promise<LawyerMatchResponse> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/v1/match`,
        request,
        {
          headers: {
            'Authorization': `Bearer ${AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error calling AI matching service:', error);
      
      // Fallback to empty matches
      return {
        matches: [],
      };
    }
  },

  /**
   * Analyze document content
   */
  async analyzeDocument(documentText: string): Promise<any> {
    try {
      const response = await axios.post(
        `${AI_SERVICE_URL}/api/v1/analyze`,
        { text: documentText },
        {
          headers: {
            'Authorization': `Bearer ${AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // Longer timeout for document analysis
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Error calling AI document analysis service:', error);
      return null;
    }
  },
};
