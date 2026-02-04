import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// Detect if running in Electron
const isElectron = typeof window !== 'undefined' && window.appInfo?.isDesktopApp;

// Determine the API base URL
// - In Electron: always use explicit backend URL (no proxy)
// - In development: use localhost with proxy fallback
// - In production web: use relative /api (handled by web server)
const getApiBaseUrl = () => {
  // Check for explicit env variable first
  if (import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  
  // Electron desktop app - needs explicit backend URL
  if (isElectron) {
    // In production, this should be configured via env or settings
    // For now, default to localhost for local backend
    return 'http://localhost:5000/api';
  }
  
  // Web development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  
  // Web production - use relative path (proxied by web server)
  return '/api';
};

const BASE = getApiBaseUrl();
const api = axios.create({
  baseURL: BASE,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect for AI endpoints - let components handle fallbacks gracefully
      const isAIEndpoint = error.config?.url?.includes('/ai/');
      
      if (!isAIEndpoint) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;