import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  muscleGroups: {
    chest: { recovery: 70 },
    back: { recovery: 30 },
    shoulders: { recovery: 50 },
    biceps: { recovery: 80 },
    triceps: { recovery: 75 },
    forearms: { recovery: 90 },
    abs: { recovery: 85 },
    traps: { recovery: 45 },
    quads: { recovery: 20 },
    hamstrings: { recovery: 25 },
    calves: { recovery: 95 },
    glutes: { recovery: 35 },
  }
};

const recoverySlice = createSlice({
  name: 'recovery',
  initialState,
  reducers: {
    updateMuscleRecovery: (state, action) => {
      const { muscle, recovery } = action.payload;
      if (state.muscleGroups[muscle]) {
        state.muscleGroups[muscle].recovery = recovery;
      }
    },
    resetRecovery: (state) => {
      state.muscleGroups = initialState.muscleGroups;
    }
  }
});

export const { updateMuscleRecovery, resetRecovery } = recoverySlice.actions;
export default recoverySlice.reducer;
