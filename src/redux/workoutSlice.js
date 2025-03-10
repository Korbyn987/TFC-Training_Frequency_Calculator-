import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workouts: [],
  muscleStatus: {
    chest: { lastWorkout: null },
    back: { lastWorkout: null },
    shoulders: { lastWorkout: null },
    biceps: { lastWorkout: null },
    triceps: { lastWorkout: null },
    forearms: { lastWorkout: null },
    abs: { lastWorkout: null },
    traps: { lastWorkout: null },
    quads: { lastWorkout: null },
    hamstrings: { lastWorkout: null },
    calves: { lastWorkout: null },
    glutes: { lastWorkout: null }
  }
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    addWorkout: (state, action) => {
      const { date, muscles, intensity } = action.payload;
      // Add the workout to history
      state.workouts.push({
        date,
        muscles,
        intensity
      });
      
      // Update last workout date for each muscle
      muscles.forEach(muscle => {
        if (state.muscleStatus[muscle]) {
          state.muscleStatus[muscle].lastWorkout = date;
        }
      });
    },
    clearWorkouts: (state) => {
      return initialState;
    }
  }
});

export const { addWorkout, clearWorkouts } = workoutSlice.actions;
export default workoutSlice.reducer;
