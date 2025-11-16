// Message types for LEHELP platform

export interface Message {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'lawyer' | 'activist' | 'system';
  content: string;
  encrypted: boolean;
  createdAt: Date | string;
  read: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

export interface SendMessageData {
  caseId: string;
  content: string;
  attachments?: File[];
}
