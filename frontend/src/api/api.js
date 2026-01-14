import axios from 'axios';
import { getAccessToken, setAccessToken } from './tokenStore';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true 
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API] Request:', config.method.toUpperCase(), config.url, '✓ (with token)');
    } else {
      console.warn('[API] Request:', config.method.toUpperCase(), config.url, '✗ (NO TOKEN)');
    }
    return config;
  },
  (error) => {
    console.error('[API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('[API] Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest.url.includes('/auth/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true;

      try {
        console.log('[API] 401 detected → Attempting token refresh');
        
        const refreshApi = axios.create({
          baseURL: 'http://localhost:8080/api',
          withCredentials: true
        });
        
        const { data } = await refreshApi.post('/auth/refresh-token', {});
        
        setAccessToken(data.accessToken);
        console.log('[API] Token refreshed successfully ✓');
        
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      
        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Token refresh failed → Clearing auth state', refreshError.message);
        setAccessToken(null);
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status !== 401 || isRefreshRequest) {
      console.error('[API] Error:', error.response?.status, error.config.url, error.response?.data?.error || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;