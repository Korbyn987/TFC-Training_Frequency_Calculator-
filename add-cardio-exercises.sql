-- Add Cardio Exercises to TFC Database
-- Run this in your Supabase SQL Editor to add cardio/fat loss exercises

-- Add Cardio muscle group (using ID 9 instead of 8)
INSERT INTO muscle_groups (id, name, description) VALUES
(9, 'Cardio', 'Cardiovascular and fat burning exercises')
ON CONFLICT (id) DO NOTHING;

-- Add popular cardio/fat loss exercises that AI commonly generates
INSERT INTO exercises (id, name, muscle_group_id, description, equipment, difficulty_level, is_compound) VALUES
-- Cardio/Fat Loss Exercises (starting from ID 200 to avoid conflicts)
(200, 'Burpees', 9, 'Full body explosive movement combining squat, plank, and jump', 'Bodyweight', 'intermediate', true),
(201, 'Mountain Climbers', 9, 'High-intensity core and cardio exercise in plank position', 'Bodyweight', 'beginner', true),
(202, 'Russian Twists', 7, 'Core rotation exercise for obliques and abs', 'Bodyweight', 'beginner', false),
(203, 'Jumping Jacks', 9, 'Classic cardio exercise with arm and leg coordination', 'Bodyweight', 'beginner', true),
(204, 'High Knees', 9, 'Running in place with high knee lifts', 'Bodyweight', 'beginner', false),
(205, 'Butt Kickers', 9, 'Running in place kicking heels to glutes', 'Bodyweight', 'beginner', false),
(206, 'Jump Squats', 6, 'Explosive squat variation with jump', 'Bodyweight', 'intermediate', true),
(207, 'Plank Jacks', 7, 'Plank position with jumping jack leg movement', 'Bodyweight', 'intermediate', true),
(208, 'Bear Crawls', 9, 'Full body crawling movement', 'Bodyweight', 'intermediate', true),
(209, 'Bicycle Crunches', 7, 'Alternating elbow to knee crunches', 'Bodyweight', 'beginner', false),
(210, 'Jump Rope', 9, 'Classic cardio exercise with rope', 'Jump Rope', 'beginner', false),
(211, 'Box Jumps', 6, 'Explosive jump onto elevated platform', 'Box/Platform', 'intermediate', true),
(212, 'Battle Ropes', 9, 'High-intensity rope waves for cardio', 'Battle Ropes', 'intermediate', true),
(213, 'Kettlebell Swings', 9, 'Hip hinge movement with kettlebell', 'Kettlebell', 'intermediate', true),
(214, 'Treadmill Running', 9, 'Steady state or interval running', 'Treadmill', 'beginner', false),
(215, 'Stationary Bike', 9, 'Cycling for cardiovascular fitness', 'Stationary Bike', 'beginner', false),
(216, 'Rowing Machine', 9, 'Full body cardio with rowing motion', 'Rowing Machine', 'intermediate', true),
(217, 'Elliptical', 9, 'Low impact cardio machine', 'Elliptical', 'beginner', false),
(218, 'Stair Climber', 9, 'Climbing motion for lower body cardio', 'Stair Climber', 'beginner', false),
(219, 'Sprint Intervals', 9, 'High-intensity running intervals', 'Track/Treadmill', 'advanced', false),
(220, 'Squat Thrusts', 9, 'Burpee variation without the jump', 'Bodyweight', 'intermediate', true),
(221, 'Lateral Shuffles', 9, 'Side-to-side movement for agility', 'Bodyweight', 'beginner', false),
(222, 'Skaters', 9, 'Lateral jumping movement mimicking skating', 'Bodyweight', 'intermediate', false),
(223, 'Wall Sits', 6, 'Isometric squat hold against wall', 'Wall', 'beginner', false),
(224, 'Plank', 7, 'Isometric core hold in push-up position', 'Bodyweight', 'beginner', false),
(225, 'Side Plank', 7, 'Lateral plank for obliques', 'Bodyweight', 'intermediate', false),
(226, 'Dead Bug', 7, 'Core stability exercise lying on back', 'Bodyweight', 'beginner', false),
(227, 'Bird Dog', 7, 'Core stability on hands and knees', 'Bodyweight', 'beginner', false),
(228, 'Inchworms', 9, 'Walking hands out from standing to plank', 'Bodyweight', 'intermediate', true),
(229, 'Tuck Jumps', 9, 'Explosive jump bringing knees to chest', 'Bodyweight', 'advanced', true),
(230, 'Star Jumps', 9, 'Jumping jack variation with arms and legs wide', 'Bodyweight', 'beginner', true),
(231, 'Jumping Lunges', 6, 'Explosive alternating lunge with jump', 'Bodyweight', 'intermediate', true)
ON CONFLICT (id) DO NOTHING;

-- Update existing exercises that might be cardio-related
UPDATE exercises SET muscle_group_id = 9, is_compound = true WHERE name = 'Kettlebell Swing';
UPDATE exercises SET muscle_group_id = 9 WHERE name = 'Rower Machine';

-- Add some HIIT-style exercises
INSERT INTO exercises (id, name, muscle_group_id, description, equipment, difficulty_level, is_compound) VALUES
(232, 'Tabata Squats', 6, '20 seconds on, 10 seconds off squat intervals', 'Bodyweight', 'intermediate', true),
(233, 'Tabata Push-Ups', 1, '20 seconds on, 10 seconds off push-up intervals', 'Bodyweight', 'intermediate', true),
(234, 'HIIT Burpees', 9, 'High-intensity interval burpees', 'Bodyweight', 'advanced', true),
(235, 'Sprint Burpees', 9, 'Maximum effort burpees for short duration', 'Bodyweight', 'advanced', true),
(236, 'Cardio Circuits', 9, 'Mixed cardio exercise circuits', 'Various', 'intermediate', true)
ON CONFLICT (id) DO NOTHING;
