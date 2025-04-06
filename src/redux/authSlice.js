import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  user: null,
  recoveryStatus: null,
  recoveryError: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    setRecoveryStatus: (state, action) => {
      state.recoveryStatus = action.payload;
      state.recoveryError = null;
    },
    setRecoveryError: (state, action) => {
      state.recoveryError = action.payload;
      state.recoveryStatus = null;
    },
    clearRecoveryState: (state) => {
      state.recoveryStatus = null;
      state.recoveryError = null;
    },
  },
});

export const { login, logout, setRecoveryStatus, setRecoveryError, clearRecoveryState } = authSlice.actions;
export default authSlice.reducer;
