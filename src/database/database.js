console.log("database.js loaded (start)");

import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

// Platform-specific SQLite imports
let db = null;

// Declare at top-level for export
let STATIC_MUSCLE_GROUPS = [];
let STATIC_EXERCISES = [];

if (Platform.OS === "web") {
  const staticData = require("./staticExercises");
  STATIC_MUSCLE_GROUPS = staticData.STATIC_MUSCLE_GROUPS;
  STATIC_EXERCISES = staticData.STATIC_EXERCISES;
  console.log("database.js loaded static data");
} else {
  // Fallback for native (if needed)
  STATIC_MUSCLE_GROUPS = [
    { id: 1, name: "Chest" },
    { id: 2, name: "Back" },
    { id: 3, name: "Quadriceps" },
    { id: 4, name: "Hamstrings" },
    { id: 5, name: "Shoulders" },
    { id: 6, name: "Biceps" },
    { id: 7, name: "Triceps" },
    { id: 8, name: "Core" }
  ];
  STATIC_EXERCISES = [
    // Chest (id: 1)
    {
      id: 1,
      name: "Bench Press",
      muscle_group_id: 1,
      description: "Lie on a flat bench and press barbell up and down"
    },
    {
      id: 2,
      name: "Incline Bench Press",
      muscle_group_id: 1,
      description: "Bench press on an inclined bench"
    },
    {
      id: 3,
      name: "Decline Bench Press",
      muscle_group_id: 1,
      description: "Bench press on a declined bench"
    },
    {
      id: 4,
      name: "Dumbbell Flys",
      muscle_group_id: 1,
      description: "Lie flat and perform flye motion with dumbbells"
    },
    {
      id: 5,
      name: "Push-Ups",
      muscle_group_id: 1,
      description: "Classic bodyweight chest exercise"
    },
    {
      id: 6,
      name: "Cable Flys",
      muscle_group_id: 1,
      description: "Standing cable flye motion"
    },
    {
      id: 7,
      name: "Dips",
      muscle_group_id: 1,
      description: "Bodyweight dips for lower chest"
    },
    // Back (id: 2)
    {
      id: 8,
      name: "Pull-Ups",
      muscle_group_id: 2,
      description: "Bodyweight pulling exercise"
    },
    {
      id: 9,
      name: "Lat Pulldowns",
      muscle_group_id: 2,
      description: "Cable pulldown targeting lats"
    },
    {
      id: 10,
      name: "Barbell Rows",
      muscle_group_id: 2,
      description: "Bent over barbell row"
    },
    {
      id: 11,
      name: "Seated Cable Rows",
      muscle_group_id: 2,
      description: "Seated row on cable machine"
    },
    {
      id: 12,
      name: "Face Pulls",
      muscle_group_id: 2,
      description: "Cable pull to face for rear delts"
    },
    {
      id: 13,
      name: "Deadlifts",
      muscle_group_id: 2,
      description: "Compound lift for back and legs"
    },
    // Quadriceps (id: 3)
    {
      id: 14,
      name: "Squats",
      muscle_group_id: 3,
      description: "Compound leg exercise with barbell"
    },
    {
      id: 15,
      name: "Leg Press",
      muscle_group_id: 3,
      description: "Machine press for legs"
    },
    {
      id: 16,
      name: "Leg Extensions",
      muscle_group_id: 3,
      description: "Machine for quad isolation"
    },
    // Hamstrings (id: 4)
    {
      id: 17,
      name: "Lunges",
      muscle_group_id: 4,
      description: "Walking or stationary lunges"
    },
    {
      id: 18,
      name: "Romanian Deadlifts",
      muscle_group_id: 4,
      description: "Deadlift variant for hamstrings"
    },
    {
      id: 19,
      name: "Leg Curls",
      muscle_group_id: 4,
      description: "Machine for hamstring isolation"
    },
    // Shoulders (id: 5)
    {
      id: 20,
      name: "Overhead Press",
      muscle_group_id: 5,
      description: "Press weight overhead"
    },
    {
      id: 21,
      name: "Lateral Raises",
      muscle_group_id: 5,
      description: "Raise dumbbells to sides"
    },
    {
      id: 22,
      name: "Front Raises",
      muscle_group_id: 5,
      description: "Raise weight to front"
    },
    {
      id: 23,
      name: "Reverse Flyes",
      muscle_group_id: 5,
      description: "Rear delt fly motion"
    },
    {
      id: 24,
      name: "Upright Rows",
      muscle_group_id: 5,
      description: "Pull barbell up to chin"
    },
    {
      id: 25,
      name: "Arnold Press",
      muscle_group_id: 5,
      description: "Rotating dumbbell press"
    },
    {
      id: 26,
      name: "Shrugs",
      muscle_group_id: 5,
      description: "Shoulder shrugging motion"
    },
    // Biceps (id: 6)
    {
      id: 27,
      name: "Bicep Curls",
      muscle_group_id: 6,
      description: "Standard bicep curl"
    },
    {
      id: 28,
      name: "Hammer Curls",
      muscle_group_id: 6,
      description: "Neutral grip bicep curl"
    },
    {
      id: 29,
      name: "Preacher Curls",
      muscle_group_id: 6,
      description: "Bicep curls on preacher bench"
    },
    {
      id: 30,
      name: "Concentration Curls",
      muscle_group_id: 6,
      description: "Seated single arm curl"
    },
    // Triceps (id: 7)
    {
      id: 31,
      name: "Tricep Extensions",
      muscle_group_id: 7,
      description: "Overhead tricep extension"
    },
    {
      id: 32,
      name: "Tricep Pushdowns",
      muscle_group_id: 7,
      description: "Cable pushdown for triceps"
    },
    {
      id: 33,
      name: "Skull Crushers",
      muscle_group_id: 7,
      description: "Lying tricep extension"
    },
    // Core (id: 8)
    {
      id: 34,
      name: "Crunches",
      muscle_group_id: 8,
      description: "Basic ab crunch"
    },
    {
      id: 35,
      name: "Planks",
      muscle_group_id: 8,
      description: "Static core hold"
    },
    {
      id: 36,
      name: "Russian Twists",
      muscle_group_id: 8,
      description: "Seated twisting motion"
    },
    {
      id: 37,
      name: "Leg Raises",
      muscle_group_id: 8,
      description: "Lying leg raise"
    },
    {
      id: 38,
      name: "Ab Wheel Rollouts",
      muscle_group_id: 8,
      description: "Rolling ab exercise"
    },
    {
      id: 39,
      name: "Wood Chops",
      muscle_group_id: 8,
      description: "Cable chopping motion"
    },
    {
      id: 40,
      name: "Cable Crunches",
      muscle_group_id: 8,
      description: "Kneeling cable crunch"
    }
  ];
}

// Export for use in AddExerciseScreen and elsewhere
export { STATIC_EXERCISES, STATIC_MUSCLE_GROUPS };

export const initDatabase = async () => {
  console.log("Initializing exercise database...");
  
  if (Platform.OS === "web") {
    // On web, always resolve successfully and ensure static data is loaded
    console.log("Web platform detected, using static data");
    return true;
  }
  
  try {
    // Open database if not already open (sync for expo-sqlite 11.x)
    if (!db) {
      console.log("Opening SQLite database...");
      db = SQLite.openDatabase("workouts.db");
    }
    
    // Check if database needs to be initialized
    const result = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='exercises';",
          [],
          (_, { rows: { _array } }) => {
            console.log("Database tables check result:", _array.length > 0);
            resolve(_array.length > 0);
          },
          (_, error) => {
            console.error("Database check error:", error);
            reject(error);
          }
        );
      });
    });
    
    if (!result) {
      console.log("Database needs initialization, creating tables...");
      // Use embedded SQL from database.native.js
      const { initDatabase: initNativeDB } = require("./database.native");
      await initNativeDB();
    }
    
    console.log("Exercise database initialization complete");
    return true;
  } catch (error) {
    console.error("Error initializing exercise database:", error);
    console.log("Falling back to static data only");
    return false;
  }
};

export const getMuscleGroups = () => {
  if (Platform.OS === 'web') {
    return Promise.resolve(STATIC_MUSCLE_GROUPS);
  }
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM muscle_groups;',
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getExercises = (muscleGroup = null) => {
  if (Platform.OS === 'web') {
    if (!muscleGroup || muscleGroup === "All") return Promise.resolve(STATIC_EXERCISES);
    let groupId = muscleGroup;
    if (typeof muscleGroup === 'string') {
      const found = STATIC_MUSCLE_GROUPS.find(g => g.name === muscleGroup);
      groupId = found ? found.id : null;
    }
    // Ensure groupId is a number before filtering
    return Promise.resolve(
      STATIC_EXERCISES.filter(e => e.muscle_group_id === Number(groupId))
    );
  }
  return new Promise((resolve, reject) => {
    const query = muscleGroup
      ? `SELECT e.* FROM exercises e 
         JOIN muscle_groups m ON e.muscle_group_id = m.id 
         WHERE m.name = ?;`
      : "SELECT * FROM exercises;";

    const params = muscleGroup ? [muscleGroup] : [];

    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export default db;

console.log("database.js loaded (end)");
