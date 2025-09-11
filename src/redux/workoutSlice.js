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
      
      // Filter exercises by muscle group
      const calfExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('calf') || name.includes('calves') || 
               desc.includes('calf') || desc.includes('calves') ||
               name.includes('raise') && (name.includes('heel') || name.includes('toe'));
      });

      const coreExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('core') || name.includes('abs') || name.includes('abdominal') ||
               desc.includes('core') || desc.includes('abs') || desc.includes('abdominal') ||
               name.includes('crunch') || name.includes('plank') || name.includes('sit-up') ||
               desc.includes('crunch') || desc.includes('plank') || desc.includes('sit-up');
      });
      
      // Identify chest exercises
      const chestExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('chest') || desc.includes('chest') ||
               name.includes('pec') || desc.includes('pec') ||
               name.includes('bench press') || desc.includes('bench press') ||
               name.includes('push-up') || name.includes('pushup') ||
               desc.includes('push-up') || desc.includes('pushup') ||
               name.includes('fly') || desc.includes('fly') ||
               name.includes('dip') || desc.includes('dip') ||
               name.includes('decline') || name.includes('incline');
      });
      
      // Identify back exercises
      const backExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('back') || desc.includes('back') ||
               name.includes('lat') || desc.includes('lat') ||
               name.includes('row') || desc.includes('row') ||
               name.includes('pull') || desc.includes('pull') ||
               name.includes('pulldown') || desc.includes('pulldown') ||
               name.includes('pullup') || desc.includes('pullup') ||
               name.includes('chin up') || desc.includes('chin up') ||
               name.includes('deadlift') || desc.includes('deadlift');
      });
      
      // Identify shoulder exercises
      const shoulderExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('shoulder') || desc.includes('shoulder') ||
               name.includes('delt') || desc.includes('delt') ||
               name.includes('press') || desc.includes('press') ||
               name.includes('military') || desc.includes('military') ||
               name.includes('lateral raise') || desc.includes('lateral raise') ||
               name.includes('front raise') || desc.includes('front raise') ||
               name.includes('rear delt') || desc.includes('rear delt') ||
               name.includes('face pull') || desc.includes('face pull') ||
               name.includes('upright row') || desc.includes('upright row');
      });
      
      // Identify biceps exercises
      const bicepsExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('bicep') || desc.includes('bicep') ||
               name.includes('curl') || desc.includes('curl') ||
               name.includes('preacher') || desc.includes('preacher') ||
               name.includes('hammer') || desc.includes('hammer') ||
               name.includes('concentration') || desc.includes('concentration') ||
               name.includes('drag') || desc.includes('drag');
      });
      
      // Identify triceps exercises
      const tricepsExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('tricep') || desc.includes('tricep') ||
               name.includes('extension') || desc.includes('extension') ||
               name.includes('pushdown') || desc.includes('pushdown') ||
               name.includes('kickback') || desc.includes('kickback') ||
               name.includes('skull crusher') || desc.includes('skull crusher') ||
               name.includes('close grip') || desc.includes('close grip') ||
               name.includes('overhead extension') || desc.includes('overhead extension');
      });

      // Identify compound leg movements
      const compoundLegExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return name.includes('squat') || desc.includes('squat') ||
               name.includes('leg press') || desc.includes('leg press') ||
               name.includes('hack squat') || desc.includes('hack squat') ||
               name.includes('lunge') || desc.includes('lunge') ||
               name.includes('step up') || desc.includes('step up') ||
               name.includes('deadlift') || desc.includes('deadlift') ||
               name.includes('bulgarian split') || desc.includes('bulgarian split') ||
               name.includes('leg day') || desc.includes('leg day');
      });

      // Identify quad-specific exercises
      const quadOnlyExercises = (exercises || []).filter(ex => {
        const name = (ex.name || '').toLowerCase();
        const desc = (ex.description || '').toLowerCase();
        return (name.includes('quad') || desc.includes('quad') ||
                name.includes('leg extension') || desc.includes('leg extension') ||
                name.includes('sissy squat') || desc.includes('sissy squat')) &&
               !compoundLegExercises.includes(ex); // Exclude if it's already a compound movement
      });

      const hasCalfExercise = calfExercises.length > 0;
      const hasCoreExercise = coreExercises.length > 0;
      const hasCompoundLeg = compoundLegExercises.length > 0;
      const hasQuadOnly = quadOnlyExercises.length > 0;
      const hasChestExercise = chestExercises.length > 0;
      const hasBackExercise = backExercises.length > 0;
      const hasShoulderExercise = shoulderExercises.length > 0;
      const hasBicepsExercise = bicepsExercises.length > 0;
      const hasTricepsExercise = tricepsExercises.length > 0;

      console.log('Redux: Has calf exercise?', hasCalfExercise);
      console.log('Redux: Has core exercise?', hasCoreExercise);
      console.log('Redux: Has compound leg exercise?', hasCompoundLeg);
      console.log('Redux: Has quad-only exercise?', hasQuadOnly);
      console.log('Redux: Has chest exercise?', hasChestExercise);
      console.log('Redux: Has back exercise?', hasBackExercise);
      console.log('Redux: Has shoulder exercise?', hasShoulderExercise);
      console.log('Redux: Has biceps exercise?', hasBicepsExercise);
      console.log('Redux: Has triceps exercise?', hasTricepsExercise);

      // Initialize workout history array if it doesn't exist
      state.workoutHistory = state.workoutHistory || [];

      // Handle calf exercises
      if (hasCalfExercise) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['calves'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: calfExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['calves'],
          exercises: calfExercises
        });

        state.muscleStatus['calves'] = {
          lastWorkout: date,
          recoveryTime: 48
        };
        console.log('Redux: Updated calves muscle status with date:', date);
      }

      // Handle core exercises
      if (hasCoreExercise) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['abs'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: coreExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['abs'],
          exercises: coreExercises
        });

        state.muscleStatus['abs'] = {
          lastWorkout: date,
          recoveryTime: 24  // Core has 24-hour recovery time
        };
        console.log('Redux: Updated core muscle status with date:', date);
      }

      // Handle quad-only exercises
      if (hasQuadOnly) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['quads'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: quadOnlyExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['quads'],
          exercises: quadOnlyExercises
        });

        state.muscleStatus['quads'] = {
          lastWorkout: date,
          recoveryTime: 72  // Quads have 72-hour recovery time
        };
        console.log('Redux: Updated quads muscle status with date:', date);
      }

      // Handle compound leg exercises - update all leg muscle groups
      if (hasCompoundLeg) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['quads', 'hamstrings', 'glutes'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: compoundLegExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['quads', 'hamstrings', 'glutes'],
          exercises: compoundLegExercises
        });

        // Update all leg muscle groups
        const legMuscles = ['quads', 'hamstrings', 'glutes'];
        legMuscles.forEach(muscle => {
          state.muscleStatus[muscle] = {
            lastWorkout: date,
            recoveryTime: 72  // All leg muscles get 72-hour recovery time
          };
        });
        console.log('Redux: Updated all leg muscle status for compound movement with date:', date);
      }
      
      // Handle chest exercises
      if (hasChestExercise) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['chest'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: chestExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['chest'],
          exercises: chestExercises
        });

        state.muscleStatus['chest'] = {
          lastWorkout: date,
          recoveryTime: 72  // Chest has 72-hour recovery time
        };
        console.log('Redux: Updated chest muscle status with date:', date);
      }
      
      // Handle back exercises
      if (hasBackExercise) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['back'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: backExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['back'],
          exercises: backExercises
        });

        state.muscleStatus['back'] = {
          lastWorkout: date,
          recoveryTime: 72  // Back has 72-hour recovery time
        };
        console.log('Redux: Updated back muscle status with date:', date);
      }
      
      // Handle shoulder exercises
      if (hasShoulderExercise) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['shoulders'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: shoulderExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['shoulders'],
          exercises: shoulderExercises
        });

        // Update shoulders as a single muscle group
        state.muscleStatus['shoulders'] = {
          lastWorkout: date,
          recoveryTime: 48  // Shoulders have 48-hour recovery time
        };
        console.log('Redux: Updated shoulder muscle status with date:', date);
      }
      
      // Handle biceps exercises
      if (hasBicepsExercise) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['biceps'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: bicepsExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['biceps'],
          exercises: bicepsExercises
        });

        state.muscleStatus['biceps'] = {
          lastWorkout: date,
          recoveryTime: 48  // Biceps have 48-hour recovery time
        };
        console.log('Redux: Updated biceps muscle status with date:', date);
      }
      
      // Handle triceps exercises
      if (hasTricepsExercise) {
        state.workoutHistory.push({
          date: action.payload.date,
          muscles: ['triceps'],
          intensity: action.payload.intensity,
          name: action.payload.name,
          exercises: tricepsExercises
        });

        state.workouts.push({
          ...newWorkout,
          muscles: ['triceps'],
          exercises: tricepsExercises
        });

        state.muscleStatus['triceps'] = {
          lastWorkout: date,
          recoveryTime: 48  // Triceps have 48-hour recovery time
        };
        console.log('Redux: Updated triceps muscle status with date:', date);
      }
      
      console.log('Updated muscle status:', state.muscleStatus);
      console.log('Total workouts in history:', state.workouts.length);
    },
    clearWorkouts: (state) => {
      return initialState;
    },
    resetMuscleRecovery: (state, action) => {
      // Reset specific muscle groups to current date
      const { muscleGroups } = action.payload;
      const currentDate = new Date().toISOString();
      
      muscleGroups.forEach(muscle => {
        const muscleKey = getMuscleKey(muscle);
        if (state.muscleStatus[muscleKey]) {
          state.muscleStatus[muscleKey].lastWorkout = currentDate;
          console.log(`Redux: Reset ${muscleKey} recovery timer to current date`);
        }
      });
    },
    syncMuscleRecoveryData: (state, action) => {
      const { recoveryData } = action.payload;
      
      if (recoveryData) {
        // Update muscle status with real workout data from Supabase
        Object.keys(recoveryData).forEach(muscleKey => {
          if (state.muscleStatus[muscleKey]) {
            state.muscleStatus[muscleKey] = {
              ...state.muscleStatus[muscleKey],
              ...recoveryData[muscleKey]
            };
          }
        });
        console.log('Redux: Synced muscle recovery data from Supabase');
      }
    }
  }
});

export const {
  addWorkout,
  clearWorkouts,
  resetMuscleRecovery,
  syncMuscleRecoveryData
} = workoutSlice.actions;
export default workoutSlice.reducer;
