import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isAuthenticated: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      // Save to localStorage for persistence
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      }
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      // Clear from localStorage
      localStorage.removeItem('user');
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
