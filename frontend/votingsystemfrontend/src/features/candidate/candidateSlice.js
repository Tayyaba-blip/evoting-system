import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchCandidateProfile = createAsyncThunk(
  'candidate/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/candidate/profile');
      return data.candidate;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchCandidateVoteCount = createAsyncThunk(
  'candidate/fetchVoteCount',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/candidate/votes');
      return data.candidate;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch vote count');
    }
  }
);

export const fetchCandidateNotifications = createAsyncThunk(
  'candidate/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/notifications');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

const candidateSlice = createSlice({
  name: 'candidate',
  initialState: {
    profile: null,
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCandidateError: (state) => { state.error = null; },
    markNotifRead: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    updateCandidateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidateProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchCandidateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCandidateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCandidateVoteCount.fulfilled, (state, action) => {
        if (state.profile) state.profile.totalVotes = action.payload.totalVotes;
      })
      .addCase(fetchCandidateNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      });
  },
});

export const { clearCandidateError, markNotifRead, updateCandidateProfile } = candidateSlice.actions;
export default candidateSlice.reducer;