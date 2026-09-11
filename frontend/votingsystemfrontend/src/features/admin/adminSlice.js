import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Thunks
export const fetchParties = createAsyncThunk('admin/fetchParties',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get('/parties');
      return data.parties || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch parties');
    }
  }
);

export const fetchCandidates = createAsyncThunk('admin/fetchCandidates', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/admin/candidates');
    return data.candidates;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch candidates');
  }
});

export const fetchVoters = createAsyncThunk('admin/fetchVoters', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/admin/voters');
    return data.voters;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch voters');
  }
});

export const fetchAnnouncements = createAsyncThunk('admin/fetchAnnouncements', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/announcements/all');
    return data.announcements;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch announcements');
  }
});

export const fetchSchedules = createAsyncThunk('admin/fetchSchedules', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/schedule');
    return data.schedules;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch schedules');
  }
});

export const fetchVoteStats = createAsyncThunk('admin/fetchVoteStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/vote/stats');
    return data.stats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch vote stats');
  }
});

export const fetchElectionHistory = createAsyncThunk('admin/fetchElectionHistory', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/vote/history');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch election history');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    parties: [],
    candidates: [],
    voters: [],
    announcements: [],
    schedules: [],
    voteStats: null,
    electionHistory: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError: (state) => { state.error = null; },
    addPartyLocal: (state, action) => { state.parties.unshift(action.payload); },
    removePartyLocal: (state, action) => {
      state.parties = state.parties.filter((p) => p._id !== action.payload);
    },
    addCandidateLocal: (state, action) => { state.candidates.unshift(action.payload); },
    removeCandidateLocal: (state, action) => {
      state.candidates = state.candidates.filter((c) => c._id !== action.payload);
    },
    addAnnouncementLocal: (state, action) => { state.announcements.unshift(action.payload); },
    updateAnnouncementLocal: (state, action) => {
      const idx = state.announcements.findIndex((a) => a._id === action.payload._id);
      if (idx !== -1) state.announcements[idx] = action.payload;
    },
    removeAnnouncementLocal: (state, action) => {
      state.announcements = state.announcements.filter((a) => a._id !== action.payload);
    },
    addScheduleLocal: (state, action) => { state.schedules.unshift(action.payload); },
    updateScheduleLocal: (state, action) => {
      const idx = state.schedules.findIndex((s) => s._id === action.payload._id);
      if (idx !== -1) state.schedules[idx] = action.payload;
    },
    removeScheduleLocal: (state, action) => {
      state.schedules = state.schedules.filter((s) => s._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null; };
    const setError = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(fetchParties.pending, setLoading)
      .addCase(fetchParties.fulfilled, (state, action) => { state.loading = false; state.parties = action.payload; })
      .addCase(fetchParties.rejected, setError)

      .addCase(fetchCandidates.pending, setLoading)
      .addCase(fetchCandidates.fulfilled, (state, action) => { state.loading = false; state.candidates = action.payload; })
      .addCase(fetchCandidates.rejected, setError)

      .addCase(fetchVoters.pending, setLoading)
      .addCase(fetchVoters.fulfilled, (state, action) => { state.loading = false; state.voters = action.payload; })
      .addCase(fetchVoters.rejected, setError)

      .addCase(fetchAnnouncements.pending, setLoading)
      .addCase(fetchAnnouncements.fulfilled, (state, action) => { state.loading = false; state.announcements = action.payload; })
      .addCase(fetchAnnouncements.rejected, setError)

      .addCase(fetchSchedules.pending, setLoading)
      .addCase(fetchSchedules.fulfilled, (state, action) => { state.loading = false; state.schedules = action.payload; })
      .addCase(fetchSchedules.rejected, setError)

      .addCase(fetchVoteStats.pending, setLoading)
      .addCase(fetchVoteStats.fulfilled, (state, action) => { state.loading = false; state.voteStats = action.payload; })
      .addCase(fetchVoteStats.rejected, setError)

      .addCase(fetchElectionHistory.pending, setLoading)
      .addCase(fetchElectionHistory.fulfilled, (state, action) => { state.loading = false; state.electionHistory = action.payload; })
      .addCase(fetchElectionHistory.rejected, setError);
  },
});

export const {
  clearAdminError, addPartyLocal, removePartyLocal,
  addCandidateLocal, removeCandidateLocal,
  addAnnouncementLocal, updateAnnouncementLocal, removeAnnouncementLocal,
  addScheduleLocal, updateScheduleLocal, removeScheduleLocal,
} = adminSlice.actions;

export default adminSlice.reducer;