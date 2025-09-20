import { supabase } from "../config/supabase";

// Cache for exercises to avoid repeated API calls
let exerciseCache = null;
let muscleGroupCache = null;

/**
 * Fetch all muscle groups from Supabase
 */
export const getMuscleGroups = async () => {
  try {
    if (muscleGroupCache) {
      return { success: true, data: muscleGroupCache };
    }

    const { data, error } = await supabase
      .from("muscle_groups")
      .select("*")
      .order("id");

    if (error) {
      console.error("Error fetching muscle groups:", error);
      return { success: false, error: error.message };
    }

    muscleGroupCache = data;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching muscle groups:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch all exercises from Supabase
 */
export const getExercises = async () => {
  try {
    if (exerciseCache) {
      return { success: true, data: exerciseCache };
    }

    const { data, error } = await supabase
      .from("exercises")
      .select(
        `
        *,
        muscle_groups (
          id,
          name
        )
      `
      )
      .order("id");

    if (error) {
      console.error("Error fetching exercises:", error);
      return { success: false, error: error.message };
    }

    exerciseCache = data;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch exercises by muscle group
 */
export const getExercisesByMuscleGroup = async (muscleGroupId) => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select(
        `
        *,
        muscle_groups (
          id,
          name
        )
      `
      )
      .eq("muscle_group_id", muscleGroupId)
      .order("name");

    if (error) {
      console.error("Error fetching exercises by muscle group:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching exercises by muscle group:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Search exercises by name
 */
export const searchExercises = async (searchTerm) => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select(
        `
        *,
        muscle_groups (
          id,
          name
        )
      `
      )
      .ilike("name", `%${searchTerm}%`)
      .order("name");

    if (error) {
      console.error("Error searching exercises:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error searching exercises:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Get exercise by ID
 */
export const getExerciseById = async (exerciseId) => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .select(
        `
        *,
        muscle_groups (
          id,
          name
        )
      `
      )
      .eq("id", exerciseId)
      .single();

    if (error) {
      console.error("Error fetching exercise by ID:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching exercise by ID:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear exercise cache (useful for refreshing data)
 */
export const clearExerciseCache = () => {
  exerciseCache = null;
  muscleGroupCache = null;
};

/**
 * Clear muscle group cache (useful for refreshing data)
 */
export const clearMuscleGroupCache = () => {
  muscleGroupCache = null;
};

/**
 * Add custom exercise (for users to create their own)
 */
export const addCustomExercise = async (exerciseData) => {
  try {
    const { data, error } = await supabase
      .from("exercises")
      .insert([exerciseData])
      .select()
      .single();

    if (error) {
      console.error("Error adding custom exercise:", error);
      return { success: false, error: error.message };
    }

    // Clear cache to refresh data
    clearExerciseCache();
    clearMuscleGroupCache();

    return { success: true, data };
  } catch (error) {
    console.error("Error adding custom exercise:", error);
    return { success: false, error: error.message };
  }
};
