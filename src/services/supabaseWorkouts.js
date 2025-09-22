import { supabase } from "../config/supabase";
import { getCurrentUser } from "./supabaseAuth";

// Fetch all exercises from Supabase
export const getExercises = async () => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select(
        `
        *,
        muscle_groups (name)
      `
      )
      .order("name");

    if (error) {
      console.error("Error fetching exercises:", error);
      return { success: false, error: error.message };
    }

    const exercisesWithMuscleGroup = data.map((ex) => ({
      ...ex,
      muscle_group: ex.muscle_groups.name
    }));

    return { success: true, exercises: exercisesWithMuscleGroup || [] };
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
          weight_kg: setData.weight_kg || null,
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

    // Calculate total volume from the exercises data passed in completionData
    let totalVolumeKg = 0;
    if (completionData.exercises && completionData.exercises.length > 0) {
      totalVolumeKg = completionData.exercises.reduce((total, exercise) => {
        const exerciseVolume = exercise.sets.reduce((vol, set) => {
          const weight = parseFloat(set.weight) || 0;
          const reps = parseInt(set.reps) || 0;
          return vol + weight * reps;
        }, 0);
        return total + exerciseVolume;
      }, 0);
    }

    console.log(
      "Calculated total volume:",
      totalVolumeKg,
      "kg from",
      completionData.exercises?.length || 0,
      "exercises"
    );

    // Update workout status to completed
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .update({
        completed_at: new Date().toISOString(),
        duration_minutes: completionData.duration_minutes,
        notes: completionData.notes,
        total_volume_kg: totalVolumeKg
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

    // Reset muscle group recovery timers if muscle groups provided
    if (
      completionData.muscle_groups &&
      completionData.muscle_groups.length > 0
    ) {
      // Note: Recovery timer reset is now handled by Redux in the UI components
      // This avoids the need for a user_muscle_recovery table in Supabase
      console.log(
        "Workout completed with muscle groups:",
        completionData.muscle_groups
      );
      console.log(
        "Recovery timer reset will be handled by Redux dispatch in UI"
      );
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

// Get user workout history
export const getUserWorkoutHistory = async (userId, limit = 50) => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.error("getUserWorkoutHistory: User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    // Use database user ID from user_metadata, not auth user ID
    const dbUserId = user.user_metadata?.id;
    console.log("getUserWorkoutHistory: Auth user ID:", user.id);
    console.log("getUserWorkoutHistory: Database user ID:", dbUserId);
    console.log("getUserWorkoutHistory: Passed userId:", userId);

    if (!dbUserId) {
      console.error("getUserWorkoutHistory: Database user ID not found");
      return { success: false, error: "Database user ID not found" };
    }

    // First, let's check ALL workouts for this user (including incomplete ones) for debugging
    const { data: allWorkouts, error: allError } = await supabase
      .from("workouts")
      .select("id, name, completed_at, created_at, user_id")
      .eq("user_id", dbUserId)
      .order("created_at", { ascending: false });

    if (allError) {
      console.error("Error fetching all workouts for debugging:", allError);
    } else {
      console.log(
        "getUserWorkoutHistory: Total workouts for user:",
        allWorkouts?.length || 0
      );
      console.log("getUserWorkoutHistory: All workouts breakdown:");
      allWorkouts?.forEach((workout, index) => {
        console.log(
          `  ${index + 1}. ${workout.name} - Created: ${
            workout.created_at
          } - Completed: ${workout.completed_at || "NOT COMPLETED"}`
        );
      });
    }

    // Now get the completed workouts with full details
    const { data, error } = await supabase
      .from("workouts")
      .select(
        `
        id,
        name,
        completed_at,
        created_at,
        total_volume_kg,
        workout_exercises (
          exercise_name,
          exercise_sets (
            reps,
            weight_kg
          )
        )
      `
      )
      .eq("user_id", dbUserId)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching completed workout history:", error);
      return { success: false, error: error.message };
    }

    console.log(
      "getUserWorkoutHistory: Found completed workouts:",
      data?.length || 0
    );

    // Log details of completed workouts
    if (data && data.length > 0) {
      console.log("getUserWorkoutHistory: Completed workouts details:");
      data.forEach((workout, index) => {
        const completedDate = new Date(
          workout.completed_at
        ).toLocaleDateString();
        console.log(
          `  ${index + 1}. ${
            workout.name
          } - Completed: ${completedDate} - Volume: ${
            workout.total_volume_kg
          } kg`
        );
      });
    }

    // Also check for workouts that might have been completed but have null completed_at
    const { data: possiblyMissedWorkouts, error: missedError } = await supabase
      .from("workouts")
      .select("id, name, created_at, completed_at, duration_minutes")
      .eq("user_id", dbUserId)
      .is("completed_at", null)
      .not("duration_minutes", "is", null); // Has duration but no completed_at

    if (
      !missedError &&
      possiblyMissedWorkouts &&
      possiblyMissedWorkouts.length > 0
    ) {
      console.log(
        "getUserWorkoutHistory: Found workouts with duration but no completed_at:"
      );
      possiblyMissedWorkouts.forEach((workout, index) => {
        console.log(
          `  ${index + 1}. ${workout.name} - Duration: ${
            workout.duration_minutes
          }min - Created: ${workout.created_at}`
        );
      });
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
    const user = await getCurrentUser();
    if (!user) {
      console.error("getUserStats: User not authenticated");
      return { success: false, error: "User not authenticated" };
    }

    // Use database user ID from user_metadata, not auth user ID
    const dbUserId = user.user_metadata?.id;
    console.log("getUserStats: Auth user ID:", user.id);
    console.log("getUserStats: Database user ID:", dbUserId);
    console.log("getUserStats: Passed userId:", userId);

    if (!dbUserId) {
      console.error("getUserStats: Database user ID not found");
      return { success: false, error: "Database user ID not found" };
    }

    // Get basic user stats
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", dbUserId)
      .single();

    // Get workout count and total time from workouts table
    const { data: workoutData, error: workoutError } = await supabase
      .from("workouts")
      .select("duration_minutes, completed_at, created_at")
      .eq("user_id", dbUserId)
      .not("completed_at", "is", null);

    // Get personal records from exercise_sets table with proper joins
    const { data: prData, error: prError } = await supabase
      .from("exercise_sets")
      .select(
        `
        weight_kg,
        reps,
        workout_exercises!inner (
          exercise_name,
          muscle_group,
          workouts!inner (
            user_id
          )
        )
      `
      )
      .eq("workout_exercises.workouts.user_id", dbUserId)
      .not("weight_kg", "is", null)
      .order("weight_kg", { ascending: false })
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

    if (workoutError) {
      console.error("Error fetching workout data:", workoutError);
    }

    if (prError) {
      console.error("Error fetching personal records:", prError);
    }

    // Calculate enhanced stats from workout data
    let calculatedStats = { ...defaultStats };

    if (workoutData && workoutData.length > 0) {
      console.log("getUserStats: Processing", workoutData.length, "workouts");

      calculatedStats.totalWorkouts = workoutData.length;

      // Calculate total time (ensure all values are positive numbers)
      calculatedStats.totalTime = workoutData.reduce((sum, w) => {
        const duration = Math.max(0, w.duration_minutes || 0);
        return sum + duration;
      }, 0);

      // Calculate average workout time (ensure positive result)
      calculatedStats.averageWorkoutTime =
        calculatedStats.totalWorkouts > 0
          ? Math.round(
              calculatedStats.totalTime / calculatedStats.totalWorkouts
            )
          : 0;

      // Ensure averageWorkoutTime is not negative
      calculatedStats.averageWorkoutTime = Math.max(
        0,
        calculatedStats.averageWorkoutTime
      );

      // Calculate workouts this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      calculatedStats.workoutsThisMonth = workoutData.filter((w) => {
        const workoutDate = new Date(w.completed_at);
        return workoutDate >= thisMonth;
      }).length;

      console.log("getUserStats: Calculated stats:", {
        totalWorkouts: calculatedStats.totalWorkouts,
        totalTime: calculatedStats.totalTime,
        averageWorkoutTime: calculatedStats.averageWorkoutTime,
        workoutsThisMonth: calculatedStats.workoutsThisMonth
      });
    }

    // Add personal record
    if (prData && prData.length > 0) {
      calculatedStats.personalRecord = {
        weight: prData[0].weight_kg,
        reps: prData[0].reps,
        exercise: prData[0].workout_exercises?.exercise_name || "Unknown"
      };
    }

    // Merge with database stats if available, but prioritize calculated values
    const finalStats = {
      ...defaultStats,
      ...(statsData || {}),
      // Always use calculated values to ensure accuracy
      totalWorkouts: calculatedStats.totalWorkouts,
      totalTime: Math.max(0, calculatedStats.totalTime), // Ensure positive
      averageWorkoutTime: Math.max(0, calculatedStats.averageWorkoutTime), // Ensure positive
      workoutsThisMonth: calculatedStats.workoutsThisMonth,
      personalRecord: calculatedStats.personalRecord
    };

    console.log("getUserStats: Final stats:", finalStats);
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

    const dbUserId = user.user_metadata?.id;
    if (!dbUserId) {
      return { success: false, error: "Database user ID not found" };
    }

    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .select("*")
      .eq("id", workoutId)
      .eq("user_id", dbUserId)
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

// New comprehensive save workout function
export const saveWorkout = async (workoutData) => {
  try {
    console.log("saveWorkout called with data:", workoutData);

    // 1. Create the main workout
    const workoutResult = await createWorkout(workoutData);
    if (!workoutResult.success) {
      return workoutResult; // Propagate error
    }
    const workoutId = workoutResult.workout.id;
    console.log("Created workout with ID:", workoutId);

    // 2. Add exercises and their sets
    for (let i = 0; i < workoutData.exercises.length; i++) {
      const exercise = workoutData.exercises[i];
      console.log(`Processing exercise ${i + 1}:`, exercise.name);

      // Look up the actual exercise ID from the exercises table by name
      let actualExerciseId = 1; // Default fallback ID (Dips - always exists)
      try {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from("exercises")
          .select("id")
          .ilike("name", exercise.name) // Case-insensitive match
          .single();

        if (!exerciseError && exerciseData) {
          actualExerciseId = exerciseData.id;
          console.log(
            `Found exercise ID ${actualExerciseId} for "${exercise.name}"`
          );
        } else {
          console.warn(
            `Exercise "${exercise.name}" not found in database, using fallback ID ${actualExerciseId}`
          );
        }
      } catch (lookupError) {
        console.warn(
          `Error looking up exercise "${exercise.name}":`,
          lookupError,
          `using fallback ID ${actualExerciseId}`
        );
      }

      const workoutExerciseResult = await addWorkoutExercise(workoutId, {
        exercise_id: actualExerciseId, // Use the looked-up ID or fallback
        exercise_name: exercise.name,
        muscle_group:
          exercise.target_muscle || exercise.muscle_group || "Unknown",
        order_index: i,
        target_sets: exercise.sets ? exercise.sets.length : 0
      });

      if (!workoutExerciseResult.success) {
        console.error("Failed to add exercise:", exercise.name);
        return workoutExerciseResult;
      }

      const workoutExerciseId = workoutExerciseResult.workoutExercise.id;
      console.log("Created workout exercise with ID:", workoutExerciseId);

      // 3. Add sets for the exercise
      if (exercise.sets && exercise.sets.length > 0) {
        for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
          const set = exercise.sets[setIndex];
          console.log(
            `Adding set ${setIndex + 1} for exercise ${exercise.name}:`,
            set
          );

          const setResult = await addExerciseSet(workoutExerciseId, {
            set_number: setIndex + 1,
            set_type: set.set_type || "working",
            weight_kg: parseFloat(set.weight) || null,
            reps: parseInt(set.reps) || null,
            rest_seconds: set.rest_seconds || null
          });

          if (!setResult.success) {
            console.error("Failed to add set:", setResult.error);
            // Continue with other sets even if one fails
          }
        }
      }
    }

    // 4. Fetch the complete workout details to return
    console.log("Fetching complete workout details for ID:", workoutId);
    return await getWorkoutDetails(workoutId);
  } catch (error) {
    console.error("Error in comprehensive saveWorkout:", error);
    return { success: false, error: error.message };
  }
};
