/**
 * Description:          Instancia de cliente HTTP, define el BASE_URL del endpoint backend y el 
 *                       header application/json que reciben todos los servicios del backend.
 * Created by:           Kevind Ospina
 * Created date:         Ene 08, 2026
 * Last modified by:     Kevind Ospina
 * Last modified date    Ene 08, 2026
 */
import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { useAuthStore } from 'src/auth/auth-store';

// Definimos que nuestras peticiones devuelven T directamente, no AxiosResponse<T>
export interface CustomAxiosInstance extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
}

// const api: AxiosInstance = axios.create({
const api = axios.create({
  // Usar hostname dinámico en desarrollo para evitar problemas de CORS/Cookies con la IP local
  baseURL: import.meta.env.DEV ? `http://${window.location.hostname}:3000` : import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, 
}) as CustomAxiosInstance;

// Interceptor de respuesta para manejar errores globales
api.interceptors.response.use(
  (response) => response.data?.data !== undefined ? response.data.data : response.data,
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