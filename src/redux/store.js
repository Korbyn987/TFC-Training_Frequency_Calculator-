import { configureStore } from '@reduxjs/toolkit';
import workoutReducer from './workoutSlice';

const store = configureStore({
  reducer: {
    workout: workoutReducer
  },
});

export default store;
