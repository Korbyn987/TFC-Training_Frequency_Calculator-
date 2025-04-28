-- PresetWorkouts.sql
-- This SQL file creates tables for saving user-specific preset workouts in the tfc_database.

-- Drop tables if they already exist (for development/testing)
DROP TABLE IF EXISTS preset_workouts;
DROP TABLE IF EXISTS preset_workout_exercises;

-- Table to store user-created preset workouts
CREATE TABLE preset_workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Table to store exercises associated with each preset workout
CREATE TABLE preset_workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    preset_workout_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    set_type TEXT,
    reps INTEGER,
    weight REAL,
    notes TEXT,
    position INTEGER, -- Order of exercise in the preset
    FOREIGN KEY (preset_workout_id) REFERENCES preset_workouts(id),
    FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);

-- Example insert for testing (remove in production)
-- INSERT INTO preset_workouts (user_id, name) VALUES (1, 'Push Day');
-- INSERT INTO preset_workout_exercises (preset_workout_id, exercise_id, set_type, reps, weight, notes, position) VALUES (1, 2, 'numbered', 10, 135, 'Bench Press', 1);

-- This schema allows users to create, save, and later load preset workouts with full exercise details.
