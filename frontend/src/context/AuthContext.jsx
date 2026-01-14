/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/api';
import { setAccessToken } from '../api/tokenStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('[AuthContext] Checking session...');
        const { data } = await api.post('/auth/refresh-token');
        setAccessToken(data.accessToken);
        await new Promise(resolve => setTimeout(resolve, 50));

        const userRes = await api.get('/auth/me');
        setUser(userRes.data);
        console.log('[AuthContext] Session restored ✔');
      } catch (err) {
        console.warn('[AuthContext] No active session found.', err.message);
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('[AuthContext] Starting login...');
      const response = await api.post('/auth/login', { email, password });

      const token = response.data.accessToken;
      setAccessToken(token);

      await new Promise(resolve => setTimeout(resolve, 100));

      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      console.log('[AuthContext] Login successful ✔');
      
      return response.data;
    } catch (error) {
      console.error('[AuthContext] Login failed:', error.response?.data || error.message);
      setUser(null);
      setAccessToken(null);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('[AuthContext] Registering user...');
      await api.post('/auth/register', userData);
      console.log('[AuthContext] Registration successful ✔');
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[AuthContext] Logging out...');
      await api.post('/auth/logout');
    } catch (error) {
      console.error('[AuthContext] Logout failed on server:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      console.log('[AuthContext] Logout complete ✔');
    }
  };

  const setAuthToken = async (token) => {
    try {
      console.log('[AuthContext] Setting OAuth token...');
      setAccessToken(token);

      await new Promise(resolve => setTimeout(resolve, 100));

      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      console.log('[AuthContext] OAuth authentication successful ✔');
    } catch (error) {
      console.error('[AuthContext] Failed to fetch user after OAuth:', error);
      await logout();
    }
  };
  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
};

  const value = {
    user,
    setAuthToken,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading session...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};