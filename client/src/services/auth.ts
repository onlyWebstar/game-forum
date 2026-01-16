// services/auth.ts
import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export const authService = {
  // Register new user
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Google OAuth
  googleLogin: () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  },

  // Discord OAuth
  discordLogin: () => {
    window.location.href = 'http://localhost:5000/api/auth/discord';
  },
};