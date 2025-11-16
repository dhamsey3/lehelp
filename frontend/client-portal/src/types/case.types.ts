// Case types for LEHELP platform

export type CaseStatus = 'pending' | 'active' | 'resolved' | 'closed' | 'urgent';

export type CaseCategory = 
  | 'asylum_refugee' 
  | 'torture' 
  | 'arbitrary_detention' 
  | 'enforced_disappearance' 
  | 'discrimination' 
  | 'freedom_expression'
  | 'other';

export type CaseUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  category: CaseCategory;
  status: CaseStatus;
  urgency: CaseUrgency;
  description: string;
  clientId: string;
  assignedLawyerId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  documentsCount?: number;
  messagesCount?: number;
  aiClassification?: string;
  location?: string;
}

export interface CaseSubmission {
  title: string;
  category: CaseCategory;
  urgency: CaseUrgency;
  description: string;
  location?: string;
  anonymous?: boolean;
}

export interface CaseUpdate {
  status?: CaseStatus;
  urgency?: CaseUrgency;
  assignedLawyerId?: string;
  notes?: string;
}

export const caseCategoryLabels: Record<CaseCategory, string> = {
  asylum_refugee: 'Asylum & Refugee Cases',
  torture: 'Torture & Inhumane Treatment',
  arbitrary_detention: 'Arbitrary Detention',
  enforced_disappearance: 'Enforced Disappearances',
  discrimination: 'Discrimination Cases',
  freedom_expression: 'Freedom of Expression',
  other: 'Other Human Rights Cases',
};

export const caseUrgencyColors: Record<CaseUrgency, string> = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#F97316',
  critical: '#EF4444',
};

export const caseStatusColors: Record<CaseStatus, string> = {
  pending: '#F59E0B',
  active: '#3B82F6',
  resolved: '#10B981',
  closed: '#6B7280',
  urgent: '#EF4444',
};
