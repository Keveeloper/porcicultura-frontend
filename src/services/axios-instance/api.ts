/**
 * Description:          Instancia de cliente HTTP, define el BASE_URL del endpoint backend y el 
 *                       header application/json que reciben todos los servicios del backend.
 * Created by:           Kevind Ospina
 * Created date:         Ene 08, 2026
 * Last modified by:     Kevind Ospina
 * Last modified date    Ene 08, 2026
 */
import axios, { AxiosError, type AxiosInstance } from 'axios';

import { useAuthStore } from 'src/auth/auth-store';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, 
});

// Interceptor de respuesta para manejar errores globales
api.interceptors.response.use(
  (response) => {
    // --- LOG DE DEPURACIÓN AGRESIVO ---
    if (response.config.url?.includes('batch-stage')) {
      console.log('--- DEBUG AXIOS RECEIVE ---');
      console.log('URL:', response.config.url);
      console.log('Full Body (response.data):', response.data);
      if (response.data.data) {
        console.log('Wrapped Data (.data.data):', response.data.data);
        console.log('¿Metrics existe aquí?:', !!response.data.data.metrics);
      }
      console.log('---------------------------');
    }
    // ----------------------------------
    
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      console.warn('Sesión inválida o expirada.');

      // 1. Limpiamos el estado de Zustand de forma imperativa
      // En Zustand, puedes acceder a las acciones fuera de hooks usando getState()
      useAuthStore.getState().setUser(null);

      // 2. Redirección al login
      if (!window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

export default api;