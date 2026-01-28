import type { User } from 'src/sections/auth/types/types';

import { create } from 'zustand';

import api from '../services/axios-instance/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  checkAuth: async () => {
    try {
      set({ loading: true });
      const response = await api.get('/auth/me');
      set({ user: response.data, loading: false });
    } catch (error) {
      set({ user: null, loading: false });
      console.log('Auth store error: ', error);
      
    }
  },
  setUser: (user) => set({ user }),
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor', error);
    } finally {
      set({ user: null });
    }
  },
}));