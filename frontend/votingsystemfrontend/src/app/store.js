import { configureStore } from '@reduxjs/toolkit';
import authReducer         from '../features/auth/authSlice';
import voterReducer        from '../features/voter/voterSlice';
import adminReducer        from '../features/admin/adminSlice';
import candidateReducer    from '../features/candidate/candidateSlice';
import themeReducer        from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    voter:     voterReducer,
    admin:     adminReducer,
    candidate: candidateReducer,
    theme:     themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
