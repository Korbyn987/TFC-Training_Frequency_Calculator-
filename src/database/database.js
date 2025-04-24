import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import axios from "axios";
import { Platform } from "react-native";

// Platform-specific SQLite imports
let db = null;

// Declare at top-level for export
let STATIC_MUSCLE_GROUPS = [];
let STATIC_EXERCISES = [];

if (Platform.OS === 'web') {
  const staticData = require('./staticExercises');
  STATIC_MUSCLE_GROUPS = staticData.STATIC_MUSCLE_GROUPS;
  STATIC_EXERCISES = staticData.STATIC_EXERCISES;
} else {
  // Fallback for native (if needed)
  STATIC_MUSCLE_GROUPS = [
    { id: 1, name: 'Chest' },
    { id: 2, name: 'Back' },
    { id: 3, name: 'Legs' },
    { id: 4, name: 'Shoulders' },
    { id: 5, name: 'Arms' },
    { id: 6, name: 'Abs' },
  ];
  STATIC_EXERCISES = [
    // Chest (id: 1)
    { id: 1, name: 'Bench Press', muscle_group_id: 1, description: 'Lie on a flat bench and press barbell up and down' },
    { id: 2, name: 'Incline Bench Press', muscle_group_id: 1, description: 'Bench press on an inclined bench' },
    { id: 3, name: 'Decline Bench Press', muscle_group_id: 1, description: 'Bench press on a declined bench' },
    { id: 4, name: 'Dumbbell Flys', muscle_group_id: 1, description: 'Lie flat and perform flye motion with dumbbells' },
    { id: 5, name: 'Push-Ups', muscle_group_id: 1, description: 'Classic bodyweight chest exercise' },
    { id: 6, name: 'Cable Flys', muscle_group_id: 1, description: 'Standing cable flye motion' },
    { id: 7, name: 'Dips', muscle_group_id: 1, description: 'Bodyweight dips for lower chest' },
    // Back (id: 2)
    { id: 8, name: 'Pull-Ups', muscle_group_id: 2, description: 'Bodyweight pulling exercise' },
    { id: 9, name: 'Lat Pulldowns', muscle_group_id: 2, description: 'Cable pulldown targeting lats' },
    { id: 10, name: 'Barbell Rows', muscle_group_id: 2, description: 'Bent over barbell row' },
    { id: 11, name: 'Seated Cable Rows', muscle_group_id: 2, description: 'Seated row on cable machine' },
    { id: 12, name: 'Face Pulls', muscle_group_id: 2, description: 'Cable pull to face for rear delts' },
    { id: 13, name: 'Deadlifts', muscle_group_id: 2, description: 'Compound lift for back and legs' },
    // Legs (id: 3)
    { id: 14, name: 'Squats', muscle_group_id: 3, description: 'Compound leg exercise with barbell' },
    { id: 15, name: 'Leg Press', muscle_group_id: 3, description: 'Machine press for legs' },
    { id: 16, name: 'Lunges', muscle_group_id: 3, description: 'Walking or stationary lunges' },
    { id: 17, name: 'Romanian Deadlifts', muscle_group_id: 3, description: 'Deadlift variant for hamstrings' },
    { id: 18, name: 'Leg Extensions', muscle_group_id: 3, description: 'Machine for quad isolation' },
    { id: 19, name: 'Leg Curls', muscle_group_id: 3, description: 'Machine for hamstring isolation' },
    { id: 20, name: 'Calf Raises', muscle_group_id: 3, description: 'Standing or seated calf exercise' },
    // Shoulders (id: 4)
    { id: 21, name: 'Overhead Press', muscle_group_id: 4, description: 'Press weight overhead' },
    { id: 22, name: 'Lateral Raises', muscle_group_id: 4, description: 'Raise dumbbells to sides' },
    { id: 23, name: 'Front Raises', muscle_group_id: 4, description: 'Raise weight to front' },
    { id: 24, name: 'Reverse Flyes', muscle_group_id: 4, description: 'Rear delt fly motion' },
    { id: 25, name: 'Upright Rows', muscle_group_id: 4, description: 'Pull barbell up to chin' },
    { id: 26, name: 'Arnold Press', muscle_group_id: 4, description: 'Rotating dumbbell press' },
    { id: 27, name: 'Shrugs', muscle_group_id: 4, description: 'Shoulder shrugging motion' },
    // Arms (id: 5)
    { id: 28, name: 'Bicep Curls', muscle_group_id: 5, description: 'Standard bicep curl' },
    { id: 29, name: 'Hammer Curls', muscle_group_id: 5, description: 'Neutral grip bicep curl' },
    { id: 30, name: 'Tricep Extensions', muscle_group_id: 5, description: 'Overhead tricep extension' },
    { id: 31, name: 'Tricep Pushdowns', muscle_group_id: 5, description: 'Cable pushdown for triceps' },
    { id: 32, name: 'Preacher Curls', muscle_group_id: 5, description: 'Bicep curls on preacher bench' },
    { id: 33, name: 'Skull Crushers', muscle_group_id: 5, description: 'Lying tricep extension' },
    { id: 34, name: 'Concentration Curls', muscle_group_id: 5, description: 'Seated single arm curl' },
    // Core (id: 6)
    { id: 35, name: 'Crunches', muscle_group_id: 6, description: 'Basic ab crunch' },
    { id: 36, name: 'Planks', muscle_group_id: 6, description: 'Static core hold' },
    { id: 37, name: 'Russian Twists', muscle_group_id: 6, description: 'Seated twisting motion' },
    { id: 38, name: 'Leg Raises', muscle_group_id: 6, description: 'Lying leg raise' },
    { id: 39, name: 'Ab Wheel Rollouts', muscle_group_id: 6, description: 'Rolling ab exercise' },
    { id: 40, name: 'Wood Chops', muscle_group_id: 6, description: 'Cable chopping motion' },
    { id: 41, name: 'Cable Crunches', muscle_group_id: 6, description: 'Kneeling cable crunch' },
  ];
}

// Export for use in AddExerciseScreen and elsewhere
export { STATIC_MUSCLE_GROUPS, STATIC_EXERCISES };

export const initDatabase = async () => {
  if (Platform.OS === 'web') {
    // On web, always resolve successfully (no-op)
    return true;
  }
  try {
    // Open database if not already open (async for expo-sqlite >=11)
    if (!db) {
      db = await SQLite.openDatabaseAsync("workouts.db");
    }
    // Check if database needs to be initialized
    const result = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='exercises';",
          [],
          (_, { rows: { _array } }) => resolve(_array.length > 0),
          (_, error) => reject(error)
        );
      });
    });
    if (!result) {
      // Read SQL file content
      const sqlContent = await FileSystem.readAsStringAsync(
        require.resolve("./Workouts.sql"),
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      // Split SQL into individual statements
      const statements = sqlContent.split(';').map(stmt => stmt.trim()).filter(Boolean);
      db.transaction(tx => {
        statements.forEach(statement => {
          tx.executeSql(statement);
        });
      });
    }
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
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
