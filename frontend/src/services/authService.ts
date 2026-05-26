import api from './api';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials) => {
    const response = await api.post<AuthResponse>('/auth/register', credentials);
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};
