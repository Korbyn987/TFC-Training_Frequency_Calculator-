import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./authSlice";
import workoutReducer from "./workoutSlice";

const store = configureStore({
  reducer: {
    workout: workoutReducer,
    auth: authReducer
  },
});

export default store;
