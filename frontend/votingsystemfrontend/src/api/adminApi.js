import api from './axiosInstance';

// Admin
export const getParties = () => api.get('/admin/parties');
export const getPartyById = (id) => api.get(`/admin/parties/${id}`);
export const createParty = (formData) => api.post('/admin/parties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateParty = (id, formData) => api.put(`/admin/parties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteParty = (id) => api.delete(`/admin/parties/${id}`);
export const getCandidates = () => api.get('/admin/candidates');
export const createCandidate = (formData) => api.post('/admin/candidates', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCandidate = (id) => api.delete(`/admin/candidates/${id}`);
export const getVotersList = () => api.get('/admin/voters');
export const getAnnouncements = (page) => api.get(`/admin/announcements${page ? `?page=${page}` : ''}`);
export const createAnnouncement = (data) => api.post('/admin/announcements', data);
export const updateAnnouncement = (id, data) => api.put(`/admin/announcements/${id}`, data);
export const deleteAnnouncement = (id) => api.delete(`/admin/announcements/${id}`);
export const getSchedules = () => api.get('/admin/schedule');
export const getActiveSchedule = () => api.get('/admin/schedule/active');
export const createSchedule = (data) => api.post('/admin/schedule', data);
export const updateSchedule = (id, data) => api.put(`/admin/schedule/${id}`, data);
export const deleteSchedule = (id) => api.delete(`/admin/schedule/${id}`);
