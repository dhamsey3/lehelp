// Lawyer types for LEHELP platform

import { CaseCategory } from './case.types';

export interface LawyerProfile {
  userId: string;
  displayName: string;
  specializations: CaseCategory[];
  yearsOfExperience: number;
  languages: string[];
  activeCases: number;
  totalResolved: number;
  rating?: number;
  availability: boolean;
  organization?: string;
  bio?: string;
  location?: string;
  certifications?: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LawyerStats {
  activeCases: number;
  newRequests: number;
  totalResolved: number;
  averageResponseTime?: number; // in hours
  successRate?: number; // percentage
  rating?: number;
}

export interface LawyerFilters {
  specializations?: CaseCategory[];
  languages?: string[];
  minExperience?: number;
  availability?: boolean;
  minRating?: number;
}
