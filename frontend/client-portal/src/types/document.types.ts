// Document types for LEHELP platform

export interface Document {
  id: string;
  caseId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  encrypted: boolean;
  uploadedBy: string;
  uploadedByRole: 'client' | 'lawyer' | 'activist';
  uploadedAt: Date | string;
  url?: string;
  downloadUrl?: string;
  metadata?: DocumentMetadata;
}

export interface DocumentMetadata {
  description?: string;
  tags?: string[];
  category?: string;
  classification?: 'public' | 'confidential' | 'restricted';
}

export interface UploadDocumentData {
  caseId: string;
  file: File;
  metadata?: DocumentMetadata;
}
