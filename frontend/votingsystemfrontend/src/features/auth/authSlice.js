import { createSlice } from '@reduxjs/toolkit';

// Rehydrate from localStorage on app load
const storedToken = localStorage.getItem('token') || null;
const storedUser  = (() => {
  try { return JSON.parse(localStorage.getItem('user')) || null; }
  catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: storedToken,
    user:  storedUser,
    isAuthenticated: !!storedToken,
  },
  reducers: {
    /** Called after a successful login response */
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;
      state.token           = token;
      state.user            = user;
      state.isAuthenticated = true;
      // Keep localStorage in sync so axiosInstance interceptor always has a fresh token
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },

    /** Update the stored user object (e.g. after profile edit) */
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },

    /** Clear everything on logout */
    logout: (state) => {
      state.token           = null;
      state.user            = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { loginSuccess, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;