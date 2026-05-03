import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', saved);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: saved },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', state.mode);
      localStorage.setItem('theme', state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      document.documentElement.setAttribute('data-theme', action.payload);
      localStorage.setItem('theme', action.payload);
    }
  }
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;