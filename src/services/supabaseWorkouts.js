import { supabase } from "../config/supabase";
import { getCurrentUser } from "./supabaseAuth";

// Fetch all exercises from Supabase
export const getExercises = async () => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching exercises:", error);
      return { success: false, error: error.message };
    }

    return { success: true, exercises: data || [] };
  } catch (error) {
    console.error("Error in getExercises:", error);
    return { success: false, error: error.message };
  }
};

// Fetch all muscle groups from Supabase
export const getMuscleGroups = async () => {
  try {
    const { data, error } = await supabase
      .from("muscle_groups")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching muscle groups:", error);
      return { success: false, error: error.message };
    }

    return { success: true, muscleGroups: data || [] };
  } catch (error) {
    console.error("Error in getMuscleGroups:", error);
    return { success: false, error: error.message };
  }
};

// Create a new workout
export const createWorkout = async (workoutData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Debug: Log all user properties to identify correct ID
    console.log("User object for workout creation:", {
      id: user.id,
      auth_id: user.auth_id,
      user_metadata_id: user.user_metadata?.id,
      user_metadata: user.user_metadata,
      email: user.email
    });

    // The workouts table expects user_id to reference users.id (UUID from database)
    // We need to get the database user ID, not the auth ID
    const dbUserId = user.user_metadata?.id;

    if (!dbUserId) {
      console.error("Database user ID not found in user metadata");
      return { success: false, error: "User database ID not found" };
    }

    console.log("Using database user ID for workout:", dbUserId);

    const { data, error } = await supabase
      .from("workouts")
      .insert([
        {
          user_id: dbUserId, // Use database user ID
          name: workoutData.name,
          description: workoutData.notes || null,
          started_at: new Date().toISOString(),
          workout_type: "strength"
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating workout:", error);
      return { success: false, error: error.message };
    }

    return { success: true, workout: data };
  } catch (error) {
    console.error("Error in createWorkout:", error);
    return { success: false, error: error.message };
  }
};

// Add exercise to workout
export const addWorkoutExercise = async (workoutId, exerciseData) => {
  try {
    const { data, error } = await supabase
      .from("workout_exercises")
      .insert([
        {
          workout_id: workoutId,
          exercise_id: exerciseData.exercise_id,
          exercise_name: exerciseData.exercise_name || "Unknown Exercise",
          muscle_group: exerciseData.muscle_group || "Unknown",
          exercise_order: exerciseData.order_index || 0,
          target_sets: exerciseData.target_sets || null,
          sets_completed: 0
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding workout exercise:", error);
      return { success: false, error: error.message };
    }

    return { success: true, workoutExercise: data };
  } catch (error) {
    console.error("Error in addWorkoutExercise:", error);
    return { success: false, error: error.message };
  }
};

// Add set to workout exercise
export const addExerciseSet = async (workoutExerciseId, setData) => {
  try {
    const { data, error } = await supabase
      .from("exercise_sets")
      .insert([
        {
          workout_exercise_id: workoutExerciseId,
          set_number: setData.set_number,
          set_type: setData.set_type || "working",
          weight_kg: setData.weight || null,
          reps: setData.reps,
          rest_seconds: setData.rest_seconds || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding exercise set:", error);
      return { success: false, error: error.message };
    }

    return { success: true, set: data };
  } catch (error) {
    console.error("Error in addExerciseSet:", error);
    return { success: false, error: error.message };
  }
};

// Complete workout and update user stats
export const completeWorkout = async (workoutId, completionData) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Debug: Log all user properties to identify correct ID
    console.log("User object for workout completion:", {
      id: user.id,
      auth_id: user.auth_id,
      user_metadata_id: user.user_metadata?.id,
      user_metadata: user.user_metadata,
      email: user.email
    });

    // Try multiple possible user ID formats
    const userId = user.user_metadata?.id || user.auth_id || user.id;
    console.log("Using user ID for workout completion:", userId);

    // Update workout status to completed
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .update({
        completed_at: new Date().toISOString(),
        duration_minutes: completionData.duration_minutes,
        notes: completionData.notes
      })
      .eq("id", workoutId)
      .eq("user_id", userId) // Add user_id check for RLS
      .select()
      .single();

    if (workoutError) {
      console.error("Error completing workout:", workoutError);
      return { success: false, error: workoutError.message };
    }

    // Update user stats
    await updateUserStats(userId, {
      total_workouts: 1,
      total_workout_time_minutes: completionData.duration_minutes || 0
    });

    // Reset muscle group recovery timers
    if (
      completionData.muscle_groups &&
      completionData.muscle_groups.length > 0
    ) {
      await resetMuscleGroupRecovery(userId, completionData.muscle_groups);
    }

    return { success: true, workout };
  } catch (error) {
    console.error("Error in completeWorkout:", error);
    return { success: false, error: error.message };
  }
};

// Update user stats
export const updateUserStats = async (userId, statsUpdate) => {
  try {
    // First, get current stats
    const { data: currentStats, error: fetchError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching user stats:", fetchError);
      return { success: false, error: fetchError.message };
    }

    const updatedStats = {
      user_id: userId,
      total_workouts:
        (currentStats?.total_workouts || 0) + (statsUpdate.total_workouts || 0),
      total_workout_time_minutes:
        (currentStats?.total_workout_time_minutes || 0) +
        (statsUpdate.total_workout_time_minutes || 0),
      last_workout_date: new Date().toISOString()
    };

    // Upsert user stats
    const { data, error } = await supabase
      .from("user_stats")
      .upsert([updatedStats])
      .select()
      .single();

    if (error) {
      console.error("Error updating user stats:", error);
      return { success: false, error: error.message };
    }

    return { success: true, stats: data };
  } catch (error) {
    console.error("Error in updateUserStats:", error);
    return { success: false, error: error.message };
  }
};

// Reset muscle group recovery timers
export const resetMuscleGroupRecovery = async (userId, muscleGroups) => {
  try {
    const recoveryData = muscleGroups.map((muscleGroup) => ({
      user_id: userId,
      muscle_group: muscleGroup,
      last_worked_date: new Date().toISOString(),
      recovery_hours: 48 // Default recovery time
    }));

    const { data, error } = await supabase
      .from("user_muscle_recovery")
      .upsert(recoveryData, {
        onConflict: "user_id,muscle_group"
      })
      .select();

    if (error) {
      console.error("Error resetting muscle group recovery:", error);
      return { success: false, error: error.message };
    }

    return { success: true, recoveryData: data };
  } catch (error) {
    console.error("Error in resetMuscleGroupRecovery:", error);
    return { success: false, error: error.message };
  }
};

// Get user workout history
export const getUserWorkoutHistory = async (userId, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching workout history:", error);
      return { success: false, error: error.message };
    }

    return { success: true, workouts: data || [] };
  } catch (error) {
    console.error("Error in getUserWorkoutHistory:", error);
    return { success: false, error: error.message };
  }
};

// Get user stats
export const getUserStats = async (userId) => {
  try {
    // Get basic user stats
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    // Get workout count and total time from workouts table
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .select("duration_minutes, completed_at, created_at")
      .eq("user_id", userId)
      .not("completed_at", "is", null);

    // Get personal records from workout_sets table
    const { data: prData, error: prError } = await supabase
      .from("workout_sets")
      .select(
        `
        weight,
        reps,
        exercises (name, muscle_group)
      `
      )
      .eq("user_id", userId)
      .order("weight", { ascending: false })
      .limit(1);

    const defaultStats = {
      totalWorkouts: 0,
      currentStreak: 0,
      totalVolume: 0,
      totalTime: 0,
      personalRecord: null,
      averageWorkoutTime: 0,
      workoutsThisMonth: 0
    };

    if (statsError && statsError.code !== "PGRST116") {
      console.error("Error fetching user stats:", statsError);
    }

    // Calculate enhanced stats from workout data
    let calculatedStats = { ...defaultStats };

    if (workoutData && workoutData.length > 0) {
      calculatedStats.totalWorkouts = workoutData.length;
      calculatedStats.totalTime = workoutData.reduce(
        (sum, w) => sum + (w.duration_minutes || 0),
        0
      );
      calculatedStats.averageWorkoutTime = Math.round(
        calculatedStats.totalTime / calculatedStats.totalWorkouts
      );

      // Calculate workouts this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      calculatedStats.workoutsThisMonth = workoutData.filter(
        (w) => new Date(w.completed_at) >= thisMonth
      ).length;
    }

    // Add personal record
    if (prData && prData.length > 0) {
      calculatedStats.personalRecord = {
        weight: prData[0].weight,
        reps: prData[0].reps,
        exercise: prData[0].exercises?.name || "Unknown"
      };
    }

    // Merge with database stats if available
    const finalStats = {
      ...calculatedStats,
      ...(statsData || {}),
      // Override calculated values
      totalWorkouts: calculatedStats.totalWorkouts,
      totalTime: calculatedStats.totalTime,
      averageWorkoutTime: calculatedStats.averageWorkoutTime,
      workoutsThisMonth: calculatedStats.workoutsThisMonth,
      personalRecord: calculatedStats.personalRecord
    };

    return { success: true, stats: finalStats };
  } catch (error) {
    console.error("Error in getUserStats:", error);
    return { success: false, error: error.message };
  }
};

// Get muscle group recovery status
export const getMuscleGroupRecovery = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("user_muscle_recovery")
      .select(
        `
        *,
        muscle_groups (
          id,
          name
        )
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching muscle group recovery:", error);
      return { success: false, error: error.message };
    }

    return { success: true, recoveryData: data || [] };
  } catch (error) {
    console.error("Error in getMuscleGroupRecovery:", error);
    return { success: false, error: error.message };
  }
};

// Delete workout
export const deleteWorkout = async (workoutId) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", workoutId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting workout:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteWorkout:", error);
    return { success: false, error: error.message };
  }
};

// Get detailed workout information including exercises and sets
export const getWorkoutDetails = async (workoutId) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get workout basic info
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .eq("user_id", user.id)
      .single();

    if (workoutError) {
      console.error("Error fetching workout:", workoutError);
      return { success: false, error: workoutError.message };
    }

    // Get workout exercises with sets
    const { data: workoutExercises, error: exercisesError } = await supabase
      .from("workout_exercises")
      .select(
        `
        *,
        exercise_sets (
          id,
          set_number,
          set_type,
          weight_kg,
          reps,
          rest_seconds
        )
      `
      )
      .eq("workout_id", workoutId)
      .order("exercise_order");

    if (exercisesError) {
      console.error("Error fetching workout exercises:", exercisesError);
      return { success: false, error: exercisesError.message };
    }

    // Calculate total volume and other stats
    let totalVolume = 0;
    let totalSets = 0;

    workoutExercises.forEach((exercise) => {
      if (exercise.exercise_sets) {
        exercise.exercise_sets.forEach((set) => {
          if (set.weight_kg && set.reps) {
            totalVolume += set.weight_kg * set.reps;
          }
          totalSets++;
        });
      }
    });

    return {
      success: true,
      workout: {
        ...workout,
        exercises: workoutExercises,
        totalVolume,
        totalSets
      }
    };
  } catch (error) {
    console.error("Error in getWorkoutDetails:", error);
    return { success: false, error: error.message };
  }
};
