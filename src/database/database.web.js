// Web-only database stub for TFC
// Exports static muscle group and exercise data, and no-op database functions

import { STATIC_MUSCLE_GROUPS, STATIC_EXERCISES } from "./staticExercises";

export { STATIC_MUSCLE_GROUPS, STATIC_EXERCISES };

export const initDatabase = async () => true;

// Stub functions for web
export const getMuscleGroups = async () => STATIC_MUSCLE_GROUPS;
export const getExercises = async (muscleGroup = null) => {
  if (!muscleGroup || muscleGroup === "All") return STATIC_EXERCISES;
  let groupId = muscleGroup;
  if (typeof muscleGroup === "string") {
    const found = STATIC_MUSCLE_GROUPS.find(g => g.name === muscleGroup);
    groupId = found ? found.id : null;
  }
  return STATIC_EXERCISES.filter(e => e.muscle_group_id === groupId);
};

// Add other stubbed exports as needed for web compatibility.
