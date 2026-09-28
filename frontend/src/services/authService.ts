import api from './api';
import type { UserRegisterPayload, UserLoginPayload, TokenResponse, User } from '../types/auth';

export const authService = {
  register: async (payload: UserRegisterPayload): Promise<User> => {
    const res = await api.post<User>('/auth/register', payload);
    return res.data;
  },

  login: async (payload: UserLoginPayload): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>('/auth/login', payload);
    if (res.data.access_token) {
      localStorage.setItem('jwt_token', res.data.access_token);
      localStorage.setItem('user_info', JSON.stringify({
        username: res.data.username,
        full_name: res.data.full_name,
        role: res.data.role,
      }));
    }
    return res.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
  },

  getStoredUser: (): { username: string; full_name: string; role: string } | null => {
    const info = localStorage.getItem('user_info');
    if (!info) return null;
    try {
      return JSON.parse(info);
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('jwt_token');
  }
};
