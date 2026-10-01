import axiosInstance from './axiosInstance';

/* =========================================================
   PUBLIC ANNOUNCEMENTS
========================================================= */

// Public — fetch ACTIVE announcements for landing/register
export const getAnnouncements = (page) =>
  axiosInstance.get('/announcements', {
    params: page ? { page } : {},
  });

/* =========================================================
   ADMIN ANNOUNCEMENTS
========================================================= */

// Admin — fetch ALL announcements
export const getAllAnnouncements = () =>
  axiosInstance.get('/admin/announcements/all');

// Admin — fetch single announcement
export const getAnnouncementById = (id) =>
  axiosInstance.get(`/admin/announcements/${id}`);

// Admin — create announcement
export const createAnnouncement = (data) =>
  axiosInstance.post('/admin/announcements', data);

// Admin — update announcement
export const updateAnnouncement = (id, data) =>
  axiosInstance.put(
    `/admin/announcements/${id}`,
    data
  );

// Admin — activate/deactivate announcement
export const toggleAnnouncement = (id) =>
  axiosInstance.patch(
    `/admin/announcements/${id}/toggle`
  );

// Admin — permanently delete announcement
export const deleteAnnouncement = (id) =>
  axiosInstance.delete(
    `/admin/announcements/${id}`
  );