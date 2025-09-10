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

    const { data, error } = await supabase
      .from("workouts")
      .insert([
        {
          user_id: user.id,
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

    // Update workout status to completed
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        duration_minutes: completionData.duration_minutes,
        notes: completionData.notes
      })
      .eq("id", workoutId)
      .select()
      .single();

    if (workoutError) {
      console.error("Error completing workout:", workoutError);
      return { success: false, error: workoutError.message };
    }

    // Update user stats
    await updateUserStats(user.id, {
      total_workouts: 1,
      total_duration_minutes: completionData.duration_minutes || 0
    });

    // Reset muscle group recovery timers
    if (
      completionData.muscle_groups &&
      completionData.muscle_groups.length > 0
    ) {
      await resetMuscleGroupRecovery(user.id, completionData.muscle_groups);
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
      total_duration_minutes:
        (currentStats?.total_duration_minutes || 0) +
        (statsUpdate.total_duration_minutes || 0),
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
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Error fetching user stats:", error);
      return { success: false, error: error.message };
    }

    // Return default stats if none exist
    const defaultStats = {
      user_id: userId,
      total_workouts: 0,
      total_duration_minutes: 0,
      last_workout_date: null
    };

    return { success: true, stats: data || defaultStats };
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
