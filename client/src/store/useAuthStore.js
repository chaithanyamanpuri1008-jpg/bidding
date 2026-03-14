import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true, loading: false });
      toast.success('Logged in successfully!');
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      set({ user: data, token: data.token, isAuthenticated: true, loading: false });
      toast.success('Registered successfully!');
      return true;
    } catch (error) {
      set({ loading: false });
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Logged out');
  },
  
  // Note: normally we would have a /auth/me route to fetch user profile using the token on load.
  // For simplicity, we just keep token based check or we mock the rehydration here:
  rehydrate: () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        set({ user: { role: payload.role }, isAuthenticated: true });
      } catch (e) {
        localStorage.removeItem('token');
        set({ isAuthenticated: false, user: null });
      }
    }
  }
}));
