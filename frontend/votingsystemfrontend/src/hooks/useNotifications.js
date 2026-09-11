import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVoterNotifications, markVoterNotifRead } from '../features/voter/voterSlice';
import { fetchCandidateNotifications, markNotifRead as markCandidateNotifRead } from '../features/candidate/candidateSlice';
import axiosInstance from '../api/axiosInstance';

const useNotifications = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const voterState = useSelector((state) => state.voter);
  const candidateState = useSelector((state) => state.candidate);

  const isVoter = user?.role === 'voter';
  const isCandidate = user?.role === 'candidate';

  const notifications = isVoter
    ? voterState.notifications
    : isCandidate
    ? candidateState.notifications
    : [];

  const unreadCount = isVoter
    ? voterState.unreadCount
    : isCandidate
    ? candidateState.unreadCount
    : 0;

  const fetchNotifications = useCallback(() => {
    if (isVoter) dispatch(fetchVoterNotifications());
    else if (isCandidate) dispatch(fetchCandidateNotifications());
  }, [dispatch, isVoter, isCandidate]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(
    async (notifId) => {
      try {
        await axiosInstance.put(`/notifications/${notifId}/read`);
        if (isVoter) dispatch(markVoterNotifRead(notifId));
        else if (isCandidate) dispatch(markCandidateNotifRead(notifId));
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [dispatch, isVoter, isCandidate]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(
    async (notifId) => {
      try {
        await axiosInstance.delete(`/notifications/${notifId}`);
        fetchNotifications();
      } catch (err) {
        console.error('Failed to delete notification:', err);
      }
    },
    [fetchNotifications]
  );

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};

export default useNotifications;