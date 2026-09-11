import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const fetchVoterProfile = createAsyncThunk(
  'voter/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/voter/profile');
      return data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchVoterNotifications = createAsyncThunk(
  'voter/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/notifications');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchCandidatesForVoter = createAsyncThunk(
  'voter/fetchCandidates',
  async (electionType, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/vote/candidates/${electionType}`);
      return { electionType, candidates: data.candidates };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch candidates');
    }
  }
);

export const fetchActiveSchedule = createAsyncThunk(
  'voter/fetchActiveSchedule',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/schedule/active');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

const voterSlice = createSlice({
  name: 'voter',
  initialState: {
    profile: null,
    notifications: [],
    unreadCount: 0,
    mnaCandidates: [],
    mpaCandidates: [],
    activeSchedule: null,
    isVotingActive: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearVoterError: (state) => { state.error = null; },
    markVoterNotifRead: (state, action) => {
      const notif = state.notifications.find((n) => n._id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    setHasVotedMNA: (state) => { if (state.profile) state.profile.hasVotedMNA = true; },
    setHasVotedMPA: (state) => { if (state.profile) state.profile.hasVotedMPA = true; },
    updateVoterProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVoterProfile.pending, (state) => { state.loading = true; })
      .addCase(fetchVoterProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchVoterProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchVoterNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchCandidatesForVoter.fulfilled, (state, action) => {
        if (action.payload.electionType === 'MNA') state.mnaCandidates = action.payload.candidates;
        else state.mpaCandidates = action.payload.candidates;
      })
      .addCase(fetchActiveSchedule.fulfilled, (state, action) => {
        state.activeSchedule = action.payload.schedule;
        state.isVotingActive = action.payload.isActive;
      });
  },
});

export const {
  clearVoterError, markVoterNotifRead,
  setHasVotedMNA, setHasVotedMPA, updateVoterProfile,
} = voterSlice.actions;

export default voterSlice.reducer;