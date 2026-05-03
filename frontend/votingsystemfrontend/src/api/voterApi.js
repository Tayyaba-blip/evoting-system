
import api from './axiosInstance';

// Voter
export const getVoterProfile = () => api.get('/voter/profile');
export const updateVoterProfile = (formData) => api.put('/voter/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getVoterNotifications = () => api.get('/voter/notifications');
export const markVoterNotificationRead = (id) => api.put(`/voter/notifications/${id}/read`);
