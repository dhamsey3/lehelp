// User types for LEHELP platform

export type UserRole = 'client' | 'lawyer' | 'activist';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  email?: string;
  displayName?: string;
  organization?: string;
  anonymous: boolean;
  verified: boolean;
  status: 'active' | 'suspended' | 'pending';
  createdAt: Date | string;
  lastLogin?: Date | string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  role: UserRole;
  email?: string;
  displayName?: string;
  organization?: string;
  anonymous?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken?: string;
  };
  message?: string;
}
