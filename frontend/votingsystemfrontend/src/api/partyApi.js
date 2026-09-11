import axiosInstance from './axiosInstance';

export const getParties = () => axiosInstance.get('/parties');
export const getPartyById = (id) => axiosInstance.get(`/parties/${id}`);
export const getIndependentCandidates = () => axiosInstance.get('/parties/independent');
export const createParty = (formData) =>
  axiosInstance.post('/parties', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateParty = (id, formData) =>
  axiosInstance.put(`/parties/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteParty = (id) => axiosInstance.delete(`/parties/${id}`);