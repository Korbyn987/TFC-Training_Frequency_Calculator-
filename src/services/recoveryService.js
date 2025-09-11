import { supabase } from "../config/supabase";
import { getCurrentUser } from "./supabaseAuth";

// Muscle group mapping for consistent naming
const MUSCLE_GROUP_MAPPING = {
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  biceps: "biceps",
  triceps: "triceps",
  forearms: "forearms",
  core: "abs",
  abs: "abs",
  quads: "quads",
  quadriceps: "quads",
  hamstrings: "hamstrings",
  calves: "calves",
  glutes: "glutes"
};

// Default recovery times in hours
const DEFAULT_RECOVERY_TIMES = {
  chest: 72,
  back: 72,
  shoulders: 48,
  biceps: 48,
  triceps: 48,
  forearms: 48,
  abs: 24,
  quads: 72,
  hamstrings: 72,
  calves: 48,
  glutes: 72
};

/**
 * Get the most recent workout date for each muscle group from Supabase
 */
export const getUserMuscleRecoveryData = async () => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.log("RecoveryService: No authenticated user found");
      return null;
    }

    console.log("RecoveryService: Current user ID:", currentUser.id);

    // Get user's profile ID for RLS compliance
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_user_id", currentUser.id)
      .single();

    if (profileError || !userProfile) {
      console.log("RecoveryService: User profile not found:", profileError);
      return null;
    }

    console.log("RecoveryService: User profile ID:", userProfile.id);

    // Now get only completed workouts for recovery calculation
    const { data: completedWorkouts, error: completedError } = await supabase
      .from("workouts")
      .select(
        `
        id,
        completed_at,
        created_at,
        name,
        workout_exercises (
          exercise_name,
          muscle_group
        )
      `
      )
      .eq("user_id", userProfile.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (completedError) {
      console.error(
        "RecoveryService: Error fetching completed workouts:",
        completedError
      );
      return null;
    }

    console.log(
      "RecoveryService: Completed workouts found:",
      completedWorkouts?.length || 0
    );
    console.log(
      "RecoveryService: Completed workouts data:",
      JSON.stringify(completedWorkouts, null, 2)
    );

    if (!completedWorkouts || completedWorkouts.length === 0) {
      console.log("RecoveryService: No completed workouts found");
      return createDefaultRecoveryData();
    }

    // Process workouts to find most recent workout for each muscle group
    const muscleLastWorkout = {};

    completedWorkouts.forEach((workout) => {
      const workoutDate = workout.completed_at || workout.created_at;
      console.log(
        `RecoveryService: Processing workout ${workout.id} from ${workoutDate}`
      );

      if (workout.workout_exercises) {
        workout.workout_exercises.forEach((exercise) => {
          const muscleGroup = normalizeMuscleGroup(exercise.muscle_group);
          console.log(
            `RecoveryService: Exercise ${exercise.exercise_name} targets ${exercise.muscle_group} -> normalized to ${muscleGroup}`
          );

          if (
            muscleGroup &&
            (!muscleLastWorkout[muscleGroup] ||
              new Date(workoutDate) > new Date(muscleLastWorkout[muscleGroup]))
          ) {
            muscleLastWorkout[muscleGroup] = workoutDate;
            console.log(
              `RecoveryService: Updated ${muscleGroup} last workout to ${workoutDate}`
            );
          }
        });
      }
    });

    console.log(
      "RecoveryService: Final muscle last workout mapping:",
      muscleLastWorkout
    );

    // Create recovery data structure
    const recoveryData = {};
    Object.keys(DEFAULT_RECOVERY_TIMES).forEach((muscle) => {
      recoveryData[muscle] = {
        lastWorkout: muscleLastWorkout[muscle] || null,
        recoveryTime: DEFAULT_RECOVERY_TIMES[muscle]
      };
    });

    console.log(
      "RecoveryService: Generated recovery data from Supabase:",
      recoveryData
    );
    return recoveryData;
  } catch (error) {
    console.error(
      "RecoveryService: Error getting muscle recovery data:",
      error
    );
    return createDefaultRecoveryData();
  }
};

/**
 * Normalize muscle group names to match Redux store keys
 */
const normalizeMuscleGroup = (muscleGroup) => {
  if (!muscleGroup) return null;

  const normalized = muscleGroup.toLowerCase().trim();
  return MUSCLE_GROUP_MAPPING[normalized] || normalized;
};

/**
 * Create default recovery data when no workouts exist
 */
const createDefaultRecoveryData = () => {
  const recoveryData = {};
  Object.keys(DEFAULT_RECOVERY_TIMES).forEach((muscle) => {
    recoveryData[muscle] = {
      lastWorkout: null,
      recoveryTime: DEFAULT_RECOVERY_TIMES[muscle]
    };
  });
  return recoveryData;
};

/**
 * Update muscle recovery after workout completion
 */
export const updateMuscleRecoveryAfterWorkout = async (muscleGroups) => {
  try {
    if (!muscleGroups || muscleGroups.length === 0) {
      console.log("No muscle groups provided for recovery update");
      return;
    }

    const currentDate = new Date().toISOString();
    const recoveryUpdates = {};

    muscleGroups.forEach((muscle) => {
      const normalizedMuscle = normalizeMuscleGroup(muscle);
      if (normalizedMuscle) {
        recoveryUpdates[normalizedMuscle] = {
          lastWorkout: currentDate,
          recoveryTime: DEFAULT_RECOVERY_TIMES[normalizedMuscle] || 48
        };
      }
    });

    console.log("Updated muscle recovery for:", recoveryUpdates);
    return recoveryUpdates;
  } catch (error) {
    console.error("Error updating muscle recovery:", error);
    return {};
  }
};
