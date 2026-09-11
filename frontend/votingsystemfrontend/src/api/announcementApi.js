import axiosInstance from './axiosInstance';

// Public — fetch active announcements for a specific page location
// page: 'landing' | 'register' | 'both' (optional, if omitted returns all active)
export const getAnnouncements = (page) =>
  axiosInstance.get('/announcements', { params: page ? { page } : {} });

// Admin — fetch ALL announcements (active + inactive) for management
export const getAllAnnouncements = () =>
  axiosInstance.get('/announcements/all');

// Admin — fetch single announcement by ID
export const getAnnouncementById = (id) =>
  axiosInstance.get(`/announcements/${id}`);

// Admin — create new announcement
export const createAnnouncement = (data) =>
  axiosInstance.post('/announcements', data);

// Admin — update announcement
export const updateAnnouncement = (id, data) =>
  axiosInstance.put(`/announcements/${id}`, data);

// Admin — toggle active/inactive
export const toggleAnnouncement = (id) =>
  axiosInstance.patch(`/announcements/${id}/toggle`);

// Admin — delete announcement
export const deleteAnnouncement = (id) =>
  axiosInstance.delete(`/announcements/${id}`);