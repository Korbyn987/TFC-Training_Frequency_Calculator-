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
    ('Legs'),
    ('Shoulders'),
    ('Arms'),
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

    -- Legs exercises
    ('Squats', 3, 'Compound leg exercise with barbell'),
    ('Leg Press', 3, 'Machine press for legs'),
    ('Lunges', 3, 'Walking or stationary lunges'),
    ('Romanian Deadlifts', 3, 'Deadlift variant for hamstrings'),
    ('Leg Extensions', 3, 'Machine for quad isolation'),
    ('Leg Curls', 3, 'Machine for hamstring isolation'),
    ('Calf Raises', 3, 'Standing or seated calf exercise'),

    -- Shoulder exercises
    ('Overhead Press', 4, 'Press weight overhead'),
    ('Lateral Raises', 4, 'Raise dumbbells to sides'),
    ('Front Raises', 4, 'Raise weight to front'),
    ('Reverse Flyes', 4, 'Rear delt fly motion'),
    ('Upright Rows', 4, 'Pull barbell up to chin'),
    ('Arnold Press', 4, 'Rotating dumbbell press'),
    ('Shrugs', 4, 'Shoulder shrugging motion'),

    -- Arms exercises
    ('Bicep Curls', 5, 'Standard bicep curl'),
    ('Hammer Curls', 5, 'Neutral grip bicep curl'),
    ('Tricep Extensions', 5, 'Overhead tricep extension'),
    ('Tricep Pushdowns', 5, 'Cable pushdown for triceps'),
    ('Preacher Curls', 5, 'Bicep curls on preacher bench'),
    ('Skull Crushers', 5, 'Lying tricep extension'),
    ('Concentration Curls', 5, 'Seated single arm curl'),

    -- Core exercises
    ('Crunches', 6, 'Basic ab crunch'),
    ('Planks', 6, 'Static core hold'),
    ('Russian Twists', 6, 'Seated twisting motion'),
    ('Leg Raises', 6, 'Lying leg raise'),
    ('Ab Wheel Rollouts', 6, 'Rolling ab exercise'),
    ('Wood Chops', 6, 'Cable chopping motion'),
    ('Cable Crunches', 6, 'Kneeling cable crunch');
