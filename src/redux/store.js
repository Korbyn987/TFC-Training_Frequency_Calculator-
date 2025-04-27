import { configureStore } from '@reduxjs/toolkit';
import workoutReducer from './workoutSlice';
import authReducer from './authSlice';

const store = configureStore({
  reducer: {
    workout: workoutReducer,
    auth: authReducer
  },
});

export default store;
