-- Fix Muscle Group Assignments for TFC Database
-- Run this in your Supabase SQL Editor to fix miscategorized exercises

-- Move all exercises currently in 'Core' group to 'Cardio' group (ID 9)
UPDATE exercises 
SET muscle_group_id = 9 
WHERE muscle_group_id = (
  SELECT id FROM muscle_groups WHERE name = 'Core'
);

-- Alternative approach if the above doesn't work - move specific core exercises to cardio
UPDATE exercises SET muscle_group_id = 8 
WHERE name IN (
  'Plank',
  'Side Plank', 
  'Russian Twists',
  'Bicycle Crunches',
  'Dead Bug',
  'Bird Dog',
  'Plank Jacks',
  'Crunches',
  'Sit-ups',
  'Ab Wheel',
  'Hanging Knee Raises',
  'Mountain Climbers',
  'Leg Raises'
);

-- Also ensure other cardio exercises are properly categorized
UPDATE exercises SET muscle_group_id = 9 
WHERE name IN (
  'Burpees',
  'Jumping Jacks',
  'High Knees',
  'Butt Kickers',
  'Jump Rope',
  'Battle Ropes',
  'Treadmill Running',
  'Stationary Bike',
  'Rowing Machine',
  'Elliptical',
  'Stair Climber',
  'Sprint Intervals',
  'Bear Crawls',
  'Inchworms',
  'Tuck Jumps',
  'Star Jumps'
);

-- Hamstring/Leg exercises that should be in Legs group (assuming ID 6)
UPDATE exercises SET muscle_group_id = 7 
WHERE name IN (
  'Romanian Deadlift',
  'Hamstring Curls',
  'Good Mornings',
  'Stiff Leg Deadlift',
  'Nordic Curls',
  'Single Leg RDL',
  'Jump Squats',
  'Jumping Lunges',
  'Box Jumps',
  'Wall Sits',
  'Squats',
  'Lunges',
  'Deadlifts'
);

-- Check results
SELECT mg.name as muscle_group, COUNT(*) as exercise_count
FROM exercises e 
JOIN muscle_groups mg ON e.muscle_group_id = mg.id 
GROUP BY mg.name 
ORDER BY mg.name;
