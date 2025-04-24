// Native-only database logic for TFC
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import axios from "axios";

let db = null;

export const initDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync("workouts.db");
  }
  try {
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
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM muscle_groups;",
        [],
        (_, { rows: { _array } }) => resolve(_array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getExercises = (muscleGroup = null) => {
  return new Promise((resolve, reject) => {
    let query = "SELECT * FROM exercises";
    let params = [];
    if (muscleGroup && muscleGroup !== "All") {
      query += " WHERE muscle_group_id = ?";
      params.push(muscleGroup);
    }
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

// Export db if needed
export default db;
