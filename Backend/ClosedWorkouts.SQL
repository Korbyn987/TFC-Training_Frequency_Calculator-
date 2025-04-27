-- SQL schema for storing closed (completed) workouts in the TFC database
-- Each closed workout is associated with a user and stores key workout details

CREATE TABLE IF NOT EXISTS closed_workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    workout_name TEXT NOT NULL,
    exercises TEXT NOT NULL, -- JSON string of exercises, sets, reps, etc.
    start_time TEXT NOT NULL, -- ISO timestamp
    end_time TEXT NOT NULL,   -- ISO timestamp
    duration INTEGER,         -- Duration in seconds
    notes TEXT,               -- Optional notes for the workout
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Optional: Add an index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_closed_workouts_user_id ON closed_workouts(user_id);
