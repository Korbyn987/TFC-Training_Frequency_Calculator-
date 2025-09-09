// Native-only database logic for TFC
import * as SQLite from "expo-sqlite";

let db = null;

// Embedded SQL statements for database initialization
const CREATE_TABLES_SQL = `
-- Create muscle groups table
DROP TABLE IF EXISTS muscle_groups;
CREATE TABLE muscle_groups (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

-- Create exercises table
DROP TABLE IF EXISTS exercises;
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    muscle_group_id INTEGER,
    description TEXT,
    CONSTRAINT fk_muscle_group
        FOREIGN KEY (muscle_group_id) 
        REFERENCES muscle_groups(id)
);

-- Insert muscle groups
INSERT INTO muscle_groups (name) VALUES
    ('Chest'),
    ('Back'),
    ('Quadriceps'),
    ('Hamstrings'),
    ('Shoulders'),
    ('Biceps'),
    ('Triceps'),
    ('Core');

-- Insert exercises
INSERT INTO exercises (name, muscle_group_id, description) VALUES
    -- Chest exercises
    ('Bench Press', 1, 'Lie on a flat bench and press barbell up and down'),
    ('Incline Bench Press', 1, 'Bench press on an inclined bench'),
    ('Decline Bench Press', 1, 'Bench press on a declined bench'),
    ('Dumbbell Flys', 1, 'Lie flat and perform flye motion with dumbbells'),
    ('Push-Ups', 1, 'Classic bodyweight chest exercise'),
    ('Cable Flys', 1, 'Standing cable flye motion'),
    ('Dips', 1, 'Bodyweight dips for lower chest'),

    -- Back exercises
    ('Pull-Ups', 2, 'Bodyweight pulling exercise'),
    ('Lat Pulldowns', 2, 'Cable pulldown targeting lats'),
    ('Barbell Rows', 2, 'Bent over rowing with barbell'),
    ('Dumbbell Rows', 2, 'Single arm rowing with dumbbell'),
    ('T-Bar Rows', 2, 'Rowing using t-bar setup'),
    ('Face Pulls', 2, 'Cable pull to face for rear delts'),
    ('Deadlifts', 2, 'Compound lift for back and legs'),

    -- Quadriceps exercises
    ('Squats', 3, 'Compound leg exercise with barbell'),
    ('Leg Press', 3, 'Machine press for legs'),
    ('Lunges', 3, 'Walking or stationary lunges'),
    ('Leg Extensions', 3, 'Machine for quad isolation'),

    -- Hamstrings exercises
    ('Romanian Deadlifts', 4, 'Deadlift variant for hamstrings'),
    ('Leg Curls', 4, 'Machine for hamstring isolation'),
    ('Calf Raises', 4, 'Standing or seated calf exercise'),

    -- Shoulder exercises
    ('Overhead Press', 5, 'Press weight overhead'),
    ('Lateral Raises', 5, 'Raise dumbbells to sides'),
    ('Front Raises', 5, 'Raise weight to front'),
    ('Reverse Flyes', 5, 'Rear delt fly motion'),
    ('Upright Rows', 5, 'Pull barbell up to chin'),
    ('Arnold Press', 5, 'Rotating dumbbell press'),
    ('Shrugs', 5, 'Shoulder shrugging motion'),

    -- Biceps exercises
    ('Bicep Curls', 6, 'Standard bicep curl'),
    ('Hammer Curls', 6, 'Neutral grip bicep curl'),
    ('Preacher Curls', 6, 'Bicep curls on preacher bench'),
    ('Concentration Curls', 6, 'Seated single arm curl'),

    -- Triceps exercises
    ('Tricep Extensions', 7, 'Overhead tricep extension'),
    ('Tricep Pushdowns', 7, 'Cable pushdown for triceps'),
    ('Skull Crushers', 7, 'Lying tricep extension'),

    -- Core exercises
    ('Crunches', 8, 'Basic ab crunch'),
    ('Planks', 8, 'Static core hold'),
    ('Russian Twists', 8, 'Seated twisting motion'),
    ('Leg Raises', 8, 'Lying leg raise'),
    ('Ab Wheel Rollouts', 8, 'Rolling ab exercise'),
    ('Wood Chops', 8, 'Cable chopping motion'),
    ('Cable Crunches', 8, 'Kneeling cable crunch');
`;

export const initDatabase = async () => {
  if (!db) {
    db = SQLite.openDatabase("workouts.db");
  }
  try {
    // Check if database has the new muscle group structure
    const result = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT name FROM muscle_groups WHERE name IN ('Quadriceps', 'Hamstrings', 'Biceps', 'Triceps');",
          [],
          (_, { rows: { _array } }) => resolve(_array.length >= 4),
          (_, error) => {
            // If muscle_groups table doesn't exist, we need to initialize
            resolve(false);
          }
        );
      });
    });
    if (!result) {
      // Split SQL into individual statements and execute
      const statements = CREATE_TABLES_SQL.split(";")
        .map((stmt) => stmt.trim())
        .filter(Boolean);
      await new Promise((resolve, reject) => {
        db.transaction(
          (tx) => {
            statements.forEach((statement) => {
              tx.executeSql(statement);
            });
          },
          reject,
          resolve
        );
      });
    }
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
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
