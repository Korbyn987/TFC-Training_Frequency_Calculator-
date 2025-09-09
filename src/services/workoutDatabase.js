import * as SQLite from 'expo-sqlite';

// Open database (same as user database)
const db = SQLite.openDatabase('tfc_users.db');

// Initialize workout tables
export const initWorkoutTables = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create workouts table
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS workouts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          workout_name TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT,
          duration INTEGER,
          exercises TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`,
        [],
        () => {
          console.log('Workouts table created successfully');
          resolve();
        },
        (_, error) => {
          console.error('Error creating workouts table:', error);
          reject(error);
        }
      );
    });
  });
};

// Save workout
export const saveWorkout = async (userId, workoutData) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO workouts (user_id, workout_name, start_time, end_time, duration, exercises, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          userId,
          workoutData.name || 'Workout',
          workoutData.startTime || new Date().toISOString(),
          workoutData.endTime || new Date().toISOString(),
          workoutData.duration || 0,
          JSON.stringify(workoutData.exercises || []),
          workoutData.notes || ''
        ],
        (_, result) => {
          console.log('Workout saved successfully:', result.insertId);
          resolve({
            success: true,
            workoutId: result.insertId
          });
        },
        (_, error) => {
          console.error('Error saving workout:', error);
          reject({ success: false, message: 'Failed to save workout' });
        }
      );
    });
  });
};

// Get workouts for user
export const getUserWorkouts = async (userId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM workouts WHERE user_id = ? ORDER BY start_time DESC',
        [userId],
        (_, result) => {
          const workouts = [];
          for (let i = 0; i < result.rows.length; i++) {
            const workout = result.rows.item(i);
            workouts.push({
              id: workout.id,
              workout_name: workout.workout_name,
              start_time: workout.start_time,
              end_time: workout.end_time,
              duration: workout.duration,
              exercises: JSON.parse(workout.exercises || '[]'),
              notes: workout.notes
            });
          }
          resolve({ workouts });
        },
        (_, error) => {
          console.error('Error fetching workouts:', error);
          reject({ success: false, message: 'Failed to load workouts' });
        }
      );
    });
  });
};

// Add sample workout data for testing
export const addSampleWorkouts = async (userId) => {
  const sampleWorkouts = [
    {
      name: 'Push Day',
      startTime: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      endTime: new Date(Date.now() - 86400000 + 3600000).toISOString(),
      duration: 3600,
      exercises: [
        { name: 'Bench Press' },
        { name: 'Shoulder Press' },
        { name: 'Push-ups' }
      ],
      notes: 'Great workout!'
    },
    {
      name: 'Pull Day',
      startTime: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      endTime: new Date(Date.now() - 172800000 + 3300000).toISOString(),
      duration: 3300,
      exercises: [
        { name: 'Pull-ups' },
        { name: 'Rows' },
        { name: 'Bicep Curls' }
      ],
      notes: 'Focused on form'
    },
    {
      name: 'Leg Day',
      startTime: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      endTime: new Date(Date.now() - 259200000 + 4200000).toISOString(),
      duration: 4200,
      exercises: [
        { name: 'Squats' },
        { name: 'Deadlifts' },
        { name: 'Lunges' }
      ],
      notes: 'Challenging but rewarding'
    }
  ];

  for (const workout of sampleWorkouts) {
    try {
      await saveWorkout(userId, workout);
    } catch (error) {
      console.error('Error adding sample workout:', error);
    }
  }
};
