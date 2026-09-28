export type UserRole = 'ANALYST' | 'SUPERVISOR' | 'DIRECTOR' | 'ADMIN' | 'CLIENT';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserRegisterPayload {
  username: string;
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
}

export interface UserLoginPayload {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  username: string;
  full_name: string;
  role: UserRole;
}
