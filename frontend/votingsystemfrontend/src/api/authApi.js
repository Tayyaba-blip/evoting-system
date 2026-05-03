import api from './axiosInstance';

// Auth
export const registerVoter = (formData) => api.post('/auth/register', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const voterLogin = (data) => api.post('/auth/voter-login', data);
export const adminLogin = (data) => api.post('/auth/admin-login', data);
export const candidateLogin = (data) => api.post('/auth/candidate-login', data);
export const changePassword = (data) => api.put('/auth/change-password', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);
export const verifyFace = (data) => api.post('/auth/verify-face', data);
export const getMe = () => api.get('/auth/me');

