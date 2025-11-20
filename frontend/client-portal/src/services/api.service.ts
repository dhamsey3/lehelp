import axios from 'axios';
import { Case, CaseSubmission, CaseUpdate } from '../types/case.types';
import { User } from '../types/user.types';
import { LawyerProfile, LawyerStats } from '../types/lawyer.types';
import { Message, SendMessageData } from '../types/message.types';
import { Document, UploadDocumentData } from '../types/document.types';

// Configure axios defaults
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://lehelp-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // Cases
  cases: {
    getAll: (params?: { status?: string; category?: string }) => 
      api.get<{ success: boolean; data: Case[] }>('/api/v1/cases', { params }),
    
    getById: (id: string) => 
      api.get<{ success: boolean; data: Case }>(`/api/v1/cases/${id}`),
    
    create: (data: CaseSubmission) => 
      api.post<{ success: boolean; data: Case }>('/api/v1/cases', data),
    
    update: (id: string, data: CaseUpdate) => 
      api.patch<{ success: boolean; data: Case }>(`/api/v1/cases/${id}`, data),
    
    accept: (id: string) => 
      api.post<{ success: boolean; data: Case }>(`/api/v1/cases/${id}/accept`),
    
    delete: (id: string) => 
      api.delete(`/api/v1/cases/${id}`),
  },

  // Users
  users: {
    getProfile: () => 
      api.get<{ success: boolean; data: User }>('/api/v1/users/profile'),
    
    updateProfile: (data: Partial<User>) => 
      api.patch<{ success: boolean; data: User }>('/api/v1/users/profile', data),
  },

  // Lawyers
  lawyers: {
    getAll: (params?: { specialization?: string; availability?: boolean }) => 
      api.get<{ success: boolean; data: LawyerProfile[] }>('/api/v1/lawyers', { params }),
    
    getById: (id: string) => 
      api.get<{ success: boolean; data: LawyerProfile }>(`/api/v1/lawyers/${id}`),
    
    getStats: () => 
      api.get<{ success: boolean; data: LawyerStats }>('/api/v1/lawyers/stats'),
    
    updateProfile: (data: Partial<LawyerProfile>) => 
      api.patch<{ success: boolean; data: LawyerProfile }>('/api/v1/lawyers/profile', data),
  },

  // Messages
  messages: {
    getByCaseId: (caseId: string) => 
      api.get<{ success: boolean; data: Message[] }>(`/api/v1/messages/${caseId}`),
    
    send: (data: SendMessageData) => 
      api.post<{ success: boolean; data: Message }>('/api/v1/messages', data),
    
    markAsRead: (messageId: string) => 
      api.patch(`/api/v1/messages/${messageId}/read`),
  },

  // Documents
  documents: {
    getByCaseId: (caseId: string) => 
      api.get<{ success: boolean; data: Document[] }>(`/api/v1/documents/${caseId}`),
    
    upload: async (data: UploadDocumentData) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('caseId', data.caseId);
      if (data.metadata) {
        formData.append('metadata', JSON.stringify(data.metadata));
      }
      
      return api.post<{ success: boolean; data: Document }>(
        '/api/v1/documents/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    },
    
    download: (documentId: string) => 
      api.get(`/api/v1/documents/${documentId}/download`, {
        responseType: 'blob',
      }),
    
    delete: (documentId: string) => 
      api.delete(`/api/v1/documents/${documentId}`),
  },
};

export default api;
