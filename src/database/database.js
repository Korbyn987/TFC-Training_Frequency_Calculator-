import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { Asset } from "expo-asset";
import axios from "axios";
import { Platform } from "react-native";

let db = null;
if (Platform.OS !== "web") {
  db = SQLite.openDatabase("workouts.db");
} else {
  // Optional: Provide a fallback or warning for web
  console.warn(
    "SQLite is not supported on web. Database features are disabled."
  );
}
export const initDatabase = async () => {
  if (!db) {
    // Handle the web case: skip DB logic, or provide a fallback
    console.warn("Database not initialized: running on web.");
    return;
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
      const statements = sqlContent
        .split(";")
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

      // Execute each statement
      await new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            statements.forEach((statement) => {
              tx.executeSql(
                statement,
                [],
                () => {},
                (_, error) => {
                  console.error("SQL Error:", error);
                  reject(error);
                }
              );
            });
          },
          reject,
          resolve
        );
      });
    }

    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
};

export const getExercises = (muscleGroup = null) => {
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

export default db;
