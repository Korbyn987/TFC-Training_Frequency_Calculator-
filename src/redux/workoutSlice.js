import { createSlice } from '@reduxjs/toolkit';

// Helper function to get muscle group key from display name
const getMuscleKey = (muscleName) => {
  // Convert to lowercase and handle special cases
  const lowerName = muscleName.toLowerCase().trim();
  
  // Map of display names to store keys
  const map = {
    // Exact matches
    'chest': 'chest',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'back': 'back',
    'shoulders': 'shoulders',
    'core': 'abs',
    'abs': 'abs',
    'forearms': 'forearms',
    'traps': 'traps',
    'quads': 'quads',
    'hamstrings': 'hamstrings',
    'calves': 'calves',
    'glutes': 'glutes',
    
    // Common variations
    'bicep': 'biceps',
    'tricep': 'triceps',
    'shoulder': 'shoulders',
    'quad': 'quads',
    'hamstring': 'hamstrings',
    'calf': 'calves',
    'glute': 'glutes',
    'trap': 'traps',
    'forearm': 'forearms'
  };
  
  const key = map[lowerName] || lowerName;
  console.log(`Mapping muscle name: "${muscleName}" -> key: "${key}"`);
  return key;
};

const initialState = {
  workouts: [],
  muscleStatus: {
    chest: { lastWorkout: null, recoveryTime: 72 },
    back: { lastWorkout: null, recoveryTime: 72 },
    shoulders: { lastWorkout: null, recoveryTime: 48 },
    biceps: { lastWorkout: null, recoveryTime: 48 },
    triceps: { lastWorkout: null, recoveryTime: 48 },
    forearms: { lastWorkout: null, recoveryTime: 48 },
    abs: { lastWorkout: null, recoveryTime: 24 },
    traps: { lastWorkout: null, recoveryTime: 48 },
    quads: { lastWorkout: null, recoveryTime: 72 },
    hamstrings: { lastWorkout: null, recoveryTime: 72 },
    calves: { lastWorkout: null, recoveryTime: 48 },
    glutes: { lastWorkout: null, recoveryTime: 72 }
  }
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    addWorkout: (state, action) => {
      const { date, muscles, intensity, name, exercises } = action.payload;
      
      console.log('Redux: Adding workout with data:', { date, muscles, intensity, name });
      
      // Add the workout to history
      const newWorkout = {
        date,
        muscles,
        intensity,
        name: name || 'Unnamed Workout',
        id: Date.now().toString(),
        exercises: exercises || []
      };
      
      state.workouts.push(newWorkout);
      
      // Update last workout date for each muscle group
      muscles.forEach(muscleName => {
        // Convert display name to store key (lowercase, handle special cases)
        const muscleKey = getMuscleKey(muscleName);
        
        console.log(`Updating muscle group: ${muscleName} (key: ${muscleKey}) with workout date:`, date);
        
        if (state.muscleStatus[muscleKey]) {
          state.muscleStatus[muscleKey].lastWorkout = date;
        } else {
          // If muscle doesn't exist in state, add it with default recovery time
          state.muscleStatus[muscleKey] = {
            lastWorkout: date,
            recoveryTime: 48 // Default recovery time in hours
          };
        }
      });
      
      console.log('Updated muscle status:', state.muscleStatus);
      console.log('Total workouts in history:', state.workouts.length);
    },
    clearWorkouts: (state) => {
      return initialState;
    }
  }
});

export const { addWorkout, clearWorkouts } = workoutSlice.actions;
export default workoutSlice.reducer;
