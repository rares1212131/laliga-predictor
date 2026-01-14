import api from '../api/api';

const API_URL = '/auth';

const register = (firstName, lastName, email, password, confirmPassword) => {
  return api.post(`${API_URL}/register`, {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });
};

const login = (email, password) => {
  return api.post(`${API_URL}/login`, {
    email,
    password,
  });
};

const refreshToken = () => {
  return api.post(`${API_URL}/refresh-token`);
};

const logout = () => {
  return api.post(`${API_URL}/logout`);
};

const verifyEmail = (token) => {
  return api.get(`${API_URL}/verify-email?token=${token}`);
};

const forgotPassword = (email) => {
  return api.post(`${API_URL}/forgot-password`, { email });
};

const resetPassword = (token, newPassword) => {
  return api.post(`${API_URL}/reset-password`, {
    token,
    newPassword,
  });
};

const getMe = () => {
  return api.get(`${API_URL}/me`);
};

const authService = {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
};

export default authService;