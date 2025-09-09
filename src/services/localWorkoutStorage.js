import AsyncStorage from "@react-native-async-storage/async-storage";

const ACTIVE_WORKOUT_KEY = "@active_workout";
const ACTIVE_EXERCISES_KEY = "@active_exercises";
const ACTIVE_SETS_KEY = "@active_sets";

// Save active workout data
export const saveActiveWorkout = async (workoutData) => {
  try {
    await AsyncStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(workoutData));
    console.log("Active workout saved:", workoutData);
    return { success: true };
  } catch (error) {
    console.error("Error saving active workout:", error);
    return { success: false, error: error.message };
  }
};

// Load active workout data
export const loadActiveWorkout = async () => {
  try {
    const workoutData = await AsyncStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (workoutData) {
      const parsed = JSON.parse(workoutData);
      console.log("Active workout loaded:", parsed);
      return { success: true, workout: parsed };
    }
    return { success: true, workout: null };
  } catch (error) {
    console.error("Error loading active workout:", error);
    return { success: false, error: error.message };
  }
};

// Save active exercises
export const saveActiveExercises = async (exercises) => {
  try {
    await AsyncStorage.setItem(ACTIVE_EXERCISES_KEY, JSON.stringify(exercises));
    console.log("Active exercises saved:", exercises.length, "exercises");
    return { success: true };
  } catch (error) {
    console.error("Error saving active exercises:", error);
    return { success: false, error: error.message };
  }
};

// Load active exercises
export const loadActiveExercises = async () => {
  try {
    const exercisesData = await AsyncStorage.getItem(ACTIVE_EXERCISES_KEY);
    if (exercisesData) {
      const parsed = JSON.parse(exercisesData);
      console.log("Active exercises loaded:", parsed.length, "exercises");
      return { success: true, exercises: parsed };
    }
    return { success: true, exercises: [] };
  } catch (error) {
    console.error("Error loading active exercises:", error);
    return { success: false, error: error.message };
  }
};

// Save active sets
export const saveActiveSets = async (sets) => {
  try {
    await AsyncStorage.setItem(ACTIVE_SETS_KEY, JSON.stringify(sets));
    console.log(
      "Active sets saved:",
      Object.keys(sets).length,
      "exercise groups"
    );
    return { success: true };
  } catch (error) {
    console.error("Error saving active sets:", error);
    return { success: false, error: error.message };
  }
};

// Load active sets
export const loadActiveSets = async () => {
  try {
    const setsData = await AsyncStorage.getItem(ACTIVE_SETS_KEY);
    if (setsData) {
      const parsed = JSON.parse(setsData);
      console.log(
        "Active sets loaded:",
        Object.keys(parsed).length,
        "exercise groups"
      );
      return { success: true, sets: parsed };
    }
    return { success: true, sets: {} };
  } catch (error) {
    console.error("Error loading active sets:", error);
    return { success: false, error: error.message };
  }
};

// Add exercise to active workout
export const addActiveExercise = async (exercise) => {
  try {
    const { exercises } = await loadActiveExercises();
    const updatedExercises = [...exercises, exercise];
    await saveActiveExercises(updatedExercises);
    return { success: true, exercises: updatedExercises };
  } catch (error) {
    console.error("Error adding active exercise:", error);
    return { success: false, error: error.message };
  }
};

// Remove exercise from active workout
export const removeActiveExercise = async (exerciseId) => {
  try {
    const { exercises } = await loadActiveExercises();
    const updatedExercises = exercises.filter((ex) => ex.id !== exerciseId);
    await saveActiveExercises(updatedExercises);

    // Also remove sets for this exercise
    const { sets } = await loadActiveSets();
    const updatedSets = { ...sets };
    delete updatedSets[exerciseId];
    await saveActiveSets(updatedSets);

    return { success: true, exercises: updatedExercises };
  } catch (error) {
    console.error("Error removing active exercise:", error);
    return { success: false, error: error.message };
  }
};

// Add set to exercise
export const addActiveSet = async (exerciseId, set) => {
  try {
    const { sets } = await loadActiveSets();
    const exerciseSets = sets[exerciseId] || [];
    const updatedSets = {
      ...sets,
      [exerciseId]: [...exerciseSets, set]
    };
    await saveActiveSets(updatedSets);
    return { success: true, sets: updatedSets };
  } catch (error) {
    console.error("Error adding active set:", error);
    return { success: false, error: error.message };
  }
};

// Update set in exercise
export const updateActiveSet = async (exerciseId, setIndex, updatedSet) => {
  try {
    const { sets } = await loadActiveSets();
    const exerciseSets = sets[exerciseId] || [];
    const updatedExerciseSets = [...exerciseSets];
    updatedExerciseSets[setIndex] = updatedSet;

    const updatedSets = {
      ...sets,
      [exerciseId]: updatedExerciseSets
    };
    await saveActiveSets(updatedSets);
    return { success: true, sets: updatedSets };
  } catch (error) {
    console.error("Error updating active set:", error);
    return { success: false, error: error.message };
  }
};

// Remove set from exercise
export const removeActiveSet = async (exerciseId, setIndex) => {
  try {
    const { sets } = await loadActiveSets();
    const exerciseSets = sets[exerciseId] || [];
    const updatedExerciseSets = exerciseSets.filter(
      (_, index) => index !== setIndex
    );

    const updatedSets = {
      ...sets,
      [exerciseId]: updatedExerciseSets
    };
    await saveActiveSets(updatedSets);
    return { success: true, sets: updatedSets };
  } catch (error) {
    console.error("Error removing active set:", error);
    return { success: false, error: error.message };
  }
};

// Get complete active workout data
export const getCompleteActiveWorkout = async () => {
  try {
    const [workoutResult, exercisesResult, setsResult] = await Promise.all([
      loadActiveWorkout(),
      loadActiveExercises(),
      loadActiveSets()
    ]);

    if (
      !workoutResult.success ||
      !exercisesResult.success ||
      !setsResult.success
    ) {
      return {
        success: false,
        error: "Failed to load complete workout data"
      };
    }

    return {
      success: true,
      data: {
        workout: workoutResult.workout,
        exercises: exercisesResult.exercises,
        sets: setsResult.sets
      }
    };
  } catch (error) {
    console.error("Error getting complete active workout:", error);
    return { success: false, error: error.message };
  }
};

// Calculate workout statistics
export const calculateWorkoutStats = async () => {
  try {
    const { data } = await getCompleteActiveWorkout();
    if (!data || !data.workout) {
      return { success: false, error: "No active workout found" };
    }

    const { exercises, sets } = data;
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    let totalDuration = 0;

    exercises.forEach((exercise) => {
      const exerciseSets = sets[exercise.id] || [];
      totalSets += exerciseSets.length;

      exerciseSets.forEach((set) => {
        if (set.reps) totalReps += parseInt(set.reps) || 0;
        if (set.weight) totalWeight += parseFloat(set.weight) || 0;
        if (set.duration_seconds)
          totalDuration += parseInt(set.duration_seconds) || 0;
      });
    });

    const startTime = data.workout.start_time
      ? new Date(data.workout.start_time)
      : new Date();
    const currentTime = new Date();
    const workoutDuration = Math.floor((currentTime - startTime) / 1000 / 60); // minutes

    return {
      success: true,
      stats: {
        exercises: exercises.length,
        totalSets,
        totalReps,
        totalWeight,
        totalDuration,
        workoutDuration
      }
    };
  } catch (error) {
    console.error("Error calculating workout stats:", error);
    return { success: false, error: error.message };
  }
};

// Clear all active workout data
export const clearActiveWorkout = async () => {
  try {
    await Promise.all([
      AsyncStorage.removeItem(ACTIVE_WORKOUT_KEY),
      AsyncStorage.removeItem(ACTIVE_EXERCISES_KEY),
      AsyncStorage.removeItem(ACTIVE_SETS_KEY)
    ]);
    console.log("Active workout data cleared");
    return { success: true };
  } catch (error) {
    console.error("Error clearing active workout:", error);
    return { success: false, error: error.message };
  }
};

// Check if there's an active workout
export const hasActiveWorkout = async () => {
  try {
    const { workout } = await loadActiveWorkout();
    return { success: true, hasActive: !!workout };
  } catch (error) {
    console.error("Error checking active workout:", error);
    return { success: false, error: error.message };
  }
};
