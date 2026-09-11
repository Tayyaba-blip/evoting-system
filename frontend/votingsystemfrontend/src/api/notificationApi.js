import axiosInstance from './axiosInstance';

export const getNotifications = () => axiosInstance.get('/notifications');
export const markAsRead = (notifId) => axiosInstance.put(`/notifications/${notifId}/read`);
export const markAllAsRead = () => axiosInstance.put('/notifications/read-all');
export const deleteNotification = (notifId) => axiosInstance.delete(`/notifications/${notifId}`);
export const broadcastNotification = (data) => axiosInstance.post('/notifications/broadcast', data);