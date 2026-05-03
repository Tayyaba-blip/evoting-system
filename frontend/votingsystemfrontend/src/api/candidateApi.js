

import api from './axiosInstance';

// Candidate
export const getCandidateProfile = () => api.get('/candidate/profile');
export const getCandidateNotifications = () => api.get('/candidate/notifications');
export const markCandidateNotificationRead = (id) => api.put(`/candidate/notifications/${id}/read`);
export const getCandidateVotes = () => api.get('/candidate/votes');