import api from './axios';
import { AuthResponse, LoginCredentials, RegisterData } from '@/types/user';

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials).then((r) => r.data),

  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  refresh: () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    return api.post<AuthResponse>('/auth/refresh', {}, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    }).then((r) => r.data);
  },

  getProfile: () =>
    api.get('/auth/profile').then((r) => r.data),
};
