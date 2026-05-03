
import api from './axiosInstance';


// Votes
export const castVote = (data) => api.post('/vote/cast', data);
export const getCandidatesForVoter = (electionType) => api.get(`/vote/candidates/${electionType}`);
export const getVoteStats = () => api.get('/vote/stats');
export const getElectionHistory = () => api.get('/vote/history');
