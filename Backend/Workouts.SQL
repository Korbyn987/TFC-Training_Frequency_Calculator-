-- SQLite-compatible Workouts.SQL

-- Drop tables if they exist
DROP TABLE IF EXISTS WeightHistory;
DROP TABLE IF EXISTS ExerciseGoals;
DROP TABLE IF EXISTS GoalTemplates;
DROP TABLE IF EXISTS Exercises;
DROP TABLE IF EXISTS WorkoutCategories;

-- Create categories table
CREATE TABLE WorkoutCategories (
    CategoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    CategoryName TEXT NOT NULL UNIQUE
);

-- Create exercises table
CREATE TABLE Exercises (
    ExerciseID INTEGER PRIMARY KEY AUTOINCREMENT,
    CategoryID INTEGER,
    ExerciseName TEXT NOT NULL,
    Description TEXT,
    CreatedDate TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (CategoryID) REFERENCES WorkoutCategories(CategoryID)
);

-- Create weight history table
CREATE TABLE WeightHistory (
    HistoryID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ExerciseID INTEGER,
    Weight REAL NOT NULL,
    Reps INTEGER NOT NULL,
    Sets INTEGER NOT NULL,
    WorkoutDate TEXT DEFAULT (datetime('now')),
    CompletedReps INTEGER,
    RatingOfPerceived INTEGER,
    Notes TEXT,
    FOREIGN KEY (ExerciseID) REFERENCES Exercises(ExerciseID)
);

-- Create exercise goals table
CREATE TABLE ExerciseGoals (
    GoalID INTEGER PRIMARY KEY AUTOINCREMENT,
    UserID INTEGER NOT NULL,
    ExerciseID INTEGER,
    TargetWeight REAL NOT NULL,
    TargetDate TEXT,
    StartWeight REAL,
    StartDate TEXT DEFAULT (datetime('now')),
    WeeklyIncrement REAL,
    Status TEXT DEFAULT 'In Progress',
    Notes TEXT,
    FOREIGN KEY (ExerciseID) REFERENCES Exercises(ExerciseID)
);

-- Create goal templates table
CREATE TABLE GoalTemplates (
    TemplateID INTEGER PRIMARY KEY AUTOINCREMENT,
    TemplateName TEXT NOT NULL,
    Description TEXT,
    CategoryID INTEGER,
    DurationWeeks INTEGER NOT NULL,
    WeeklyIncrement REAL NOT NULL,
    PercentageIncrease REAL,
    IsPublic INTEGER DEFAULT 0,
    CreatedBy INTEGER NOT NULL,
    CreatedDate TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (CategoryID) REFERENCES WorkoutCategories(CategoryID)
);

-- Insert workout categories
INSERT INTO WorkoutCategories (CategoryName)
VALUES 
    ('Chest'),
    ('Bicep'),
    ('Tricep'),
    ('Back'),
    ('Shoulders'),
    ('Legs'),
    ('Core');

-- Insert some default goal templates
INSERT INTO GoalTemplates (TemplateName, Description, CategoryID, DurationWeeks, WeeklyIncrement, PercentageIncrease, IsPublic, CreatedBy)
VALUES 
    ('Beginner Strength', 'Steady progression for beginners', 1, 12, 2.5, NULL, 1, 1),
    ('Intermediate Push', 'Moderate progression for chest/shoulders', 1, 8, 5.0, NULL, 1, 1),
    ('Advanced Percentage', 'Percentage-based progression', 1, 6, 0, 2.5, 1, 1),
    ('Slow & Steady', 'Conservative progression for injury prevention', 1, 16, 1.25, NULL, 1, 1),
    ('Power Builder', 'Aggressive progression for compound lifts', 1, 4, 10.0, NULL, 1, 1);

-- Insert chest exercises
INSERT INTO Exercises (CategoryID, ExerciseName, Description)
VALUES 
    (1, 'Dips', 'Bodyweight exercise targeting lower chest and triceps'),
    (1, 'Pushups', 'Fundamental bodyweight exercise for chest development'),
    (1, 'Bench Press', 'Classic barbell exercise for overall chest development'),
    (1, 'Cable Fly: High to Low', 'Cable exercise targeting lower chest'),
    (1, 'Cable Fly: Low to High', 'Cable exercise targeting upper chest'),
    (1, 'Chest Press', 'Machine-based pressing movement for chest'),
    (1, 'Dumbbell Bench Press', 'Free weight variation of bench press using dumbbells'),
    (1, 'Incline Bench Press', 'Barbell press targeting upper chest'),
    (1, 'Decline Bench Press', 'Barbell press targeting lower chest'),
    (1, 'Dumbbell Fly', 'Isolation exercise for chest with dumbbells'),
    (1, 'Dumbbell Incline Press', 'Upper chest focused dumbbell press'),
    (1, 'Incline Dumbbell Fly', 'Upper chest focused fly movement'),
    (1, 'Smith Machine Bench Press', 'Guided barbell press for chest'),
    (1, 'Landmine Press', 'Single-arm press using barbell and landmine'),
    (1, 'Floor Press', 'Bench press variation performed on floor'),
    (1, 'Resistance Band Press', 'Chest press using resistance bands'),
    (1, 'Machine Fly', 'Pec deck machine for isolation'),
    (1, 'Incline Dumbbell Pullover', 'Upper chest and lat exercise'),
    (1, 'Svend Press', 'Plate squeeze press for inner chest'),
    (1, 'Decline Push-Up', 'Feet elevated push-up variation'),
    (1, 'Incline Push-Up', 'Hands elevated push-up variation'),
    (1, 'Around The World', 'Dynamic dumbbell movement for chest'),
    (1, 'Single-Arm Cable Press', 'Unilateral chest press with cable'),
    (1, 'Hammer Strength Press', 'Machine press for chest development'),
    (1, 'Alternating Dumbbell Press', 'Alternating chest press with dumbbells'),
    (1, 'Spoto Press', 'Bench press with pause above chest'),
    (1, 'Guillotine Press', 'Wide-grip press to neck area');

-- Insert bicep exercises
INSERT INTO Exercises (CategoryID, ExerciseName, Description)
VALUES 
    (2, 'Barbell Curl', 'Classic bicep exercise using a straight barbell'),
    (2, 'Dumbbell Curl', 'Basic bicep curl performed with dumbbells'),
    (2, 'Hammer Curl', 'Neutral grip curl targeting the brachialis'),
    (2, 'Preacher Curl', 'Isolation exercise performed on preacher bench'),
    (2, 'Incline Dumbbell Curl', 'Curl variation with extended range of motion'),
    (2, 'Cable Curl', 'Constant tension curl using cable machine'),
    (2, 'Concentration Curl', 'Seated isolation curl for peak contraction'),
    (2, 'EZ Bar Curl', 'Curl using curved bar for comfort'),
    (2, 'Spider Curl', 'Prone curl performed on incline bench'),
    (2, 'Reverse Curl', 'Curl with pronated grip targeting brachialis'),
    (2, 'Zottman Curl', 'Combination of regular and reverse curl'),
    (2, '21s', 'Partial range of motion curl sequence');

-- Insert tricep exercises
INSERT INTO Exercises (CategoryID, ExerciseName, Description)
VALUES 
    (3, 'Tricep Pushdown', 'Cable exercise targeting all three heads of triceps'),
    (3, 'Skull Crushers', 'Lying tricep extension with barbell or EZ bar'),
    (3, 'Overhead Tricep Extension', 'Single or double-handed extension above head'),
    (3, 'Close Grip Bench Press', 'Compound movement emphasizing triceps'),
    (3, 'Diamond Push-Ups', 'Bodyweight exercise with close hand placement'),
    (3, 'Rope Pushdown', 'Cable exercise with rope attachment for better contraction'),
    (3, 'Dumbbell Tricep Extension', 'Single-arm overhead extension with dumbbell'),
    (3, 'Tricep Kickback', 'Isolation exercise performed bent over'),
    (3, 'Bench Dips', 'Bodyweight exercise using bench for support'),
    (3, 'JM Press', 'Hybrid of close grip bench and skull crusher'),
    (3, 'Cable Overhead Extension', 'Cable variation of overhead extension'),
    (3, 'Reverse Grip Pushdown', 'Underhand grip variation of tricep pushdown');

-- Insert back exercises
INSERT INTO Exercises (CategoryID, ExerciseName, Description)
VALUES 
    (4, 'Deadlift', 'Compound movement targeting entire posterior chain'),
    (4, 'Pull-Ups', 'Bodyweight exercise for upper back and lats'),
    (4, 'Bent Over Row', 'Barbell row targeting middle back'),
    (4, 'Lat Pulldown', 'Cable exercise mimicking pull-up movement'),
    (4, 'T-Bar Row', 'Supported row variation for middle back'),
    (4, 'Face Pull', 'Cable exercise for rear deltoids and upper back'),
    (4, 'Seated Cable Row', 'Cable row targeting middle back'),
    (4, 'Single-Arm Dumbbell Row', 'Unilateral row with dumbbell'),
    (4, 'Meadows Row', 'Landmine variation of single-arm row'),
    (4, 'Straight Arm Pulldown', 'Lat isolation exercise'),
    (4, 'Pendlay Row', 'Explosive barbell row from floor'),
    (4, 'Good Morning', 'Hip-hinge movement for lower back'),
    (4, 'Hyperextension', 'Lower back isolation exercise'),
    (4, 'Rack Pull', 'Partial deadlift from elevated position'),
    (4, 'Chest Supported Row', 'Row variation with torso supported'),
    (4, 'Chin-Ups', 'Underhand grip pull-up variation'),
    (4, 'Neutral Grip Pull-Ups', 'Pull-ups with palms facing each other'),
    (4, 'Machine Row', 'Machine-based rowing movement'),
    (4, 'Reverse Grip Lat Pulldown', 'Underhand grip lat pulldown'),
    (4, 'Close Grip Lat Pulldown', 'Narrow grip variation targeting inner lats'),
    (4, 'Rower Machine', 'Cardio-focused back exercise'),
    (4, 'Smith Machine Row', 'Guided barbell row variation'),
    (4, 'Cable Face Pull', 'Rear delt and upper back isolation'),
    (4, 'Inverted Row', 'Bodyweight horizontal pulling exercise'),
    (4, 'Dumbbell Pullover', 'Upper body exercise targeting lats and serratus'),
    (4, 'Barbell Shrug', 'Trapezius isolation exercise'),
    (4, 'Dumbbell Shrug', 'Unilateral trap exercise with dumbbells');

-- Insert shoulder exercises
INSERT INTO Exercises (CategoryID, ExerciseName, Description)
VALUES 
    (5, 'Overhead Press', 'Standing barbell press for overall shoulder development'),
    (5, 'Military Press', 'Strict overhead press with feet together'),
    (5, 'Dumbbell Shoulder Press', 'Overhead press using dumbbells'),
    (5, 'Arnold Press', 'Rotational dumbbell press for all three deltoid heads'),
    (5, 'Lateral Raise', 'Dumbbell raise targeting lateral deltoids'),
    (5, 'Front Raise', 'Anterior deltoid isolation exercise'),
    (5, 'Bent Over Reverse Fly', 'Posterior deltoid isolation with dumbbells'),
    (5, 'Cable Lateral Raise', 'Machine variation of lateral raise'),
    (5, 'Upright Row', 'Compound movement for shoulders and traps'),
    (5, 'Push Press', 'Explosive overhead press with leg drive'),
    (5, 'Machine Shoulder Press', 'Guided overhead pressing movement'),
    (5, 'Smith Machine Shoulder Press', 'Guided barbell press'),
    (5, 'Face Pull', 'Cable exercise for rear deltoids'),
    (5, 'Plate Front Raise', 'Front raise variation using weight plate'),
    (5, 'Cable Front Raise', 'Cable variation of front raise'),
    (5, 'Cable Reverse Fly', 'Cable variation for rear deltoids'),
    (5, 'Landmine Press', 'Single-arm pressing using barbell and landmine'),
    (5, 'Behind the Neck Press', 'Advanced overhead press variation'),
    (5, 'Seated Dumbbell Press', 'Shoulder press performed seated for stability'),
    (5, 'Single-Arm Lateral Raise', 'Unilateral lateral deltoid exercise'),
    (5, 'Incline Reverse Fly', 'Rear delt exercise on incline bench'),
    (5, 'Bradford Press', 'Alternating front and back press'),
    (5, 'Z Press', 'Seated floor press for strict form'),
    (5, 'Cuban Press', 'Compound movement combining upright row and press'),
    (5, 'Lateral Raise Machine', 'Machine-based lateral deltoid isolation'),
    (5, 'Reverse Pec Deck', 'Machine for posterior deltoid development'),
    (5, '3-Way Raises', 'Front, lateral, and rear raise combination'),
    (5, 'Kettlebell Press', 'Overhead press using kettlebell'),
    (5, 'Bottoms-Up Press', 'Stability-focused kettlebell press'),
    (5, 'Handstand Push-Up', 'Advanced bodyweight shoulder exercise');

-- Insert leg exercises
INSERT INTO Exercises (CategoryID, ExerciseName, Description)
VALUES 
    (6, 'Back Squat', 'Fundamental compound movement for lower body'),
    (6, 'Front Squat', 'Quad-focused squat variation'),
    (6, 'Romanian Deadlift', 'Hip-hinge movement targeting hamstrings'),
    (6, 'Leg Press', 'Machine-based compound leg exercise'),
    (6, 'Bulgarian Split Squat', 'Unilateral squat variation'),
    (6, 'Walking Lunges', 'Dynamic lunge variation'),
    (6, 'Leg Extension', 'Isolation exercise for quadriceps'),
    (6, 'Leg Curl', 'Isolation exercise for hamstrings'),
    (6, 'Calf Raise', 'Standing calf exercise'),
    (6, 'Seated Calf Raise', 'Isolation for soleus muscle'),
    (6, 'Hack Squat', 'Machine-based squat variation'),
    (6, 'Step-Ups', 'Unilateral exercise using platform'),
    (6, 'Goblet Squat', 'Squat variation using dumbbell or kettlebell'),
    (6, 'Hip Thrust', 'Glute-focused hip extension exercise'),
    (6, 'Box Jumps', 'Explosive lower body movement'),
    (6, 'Sissy Squat', 'Advanced quad-focused movement'),
    (6, 'Nordic Hamstring Curl', 'Bodyweight hamstring exercise'),
    (6, 'Glute Bridge', 'Basic glute activation exercise'),
    (6, 'Standing Hip Abduction', 'Cable exercise for outer thighs'),
    (6, 'Sumo Deadlift', 'Wide-stance deadlift variation'),
    (6, 'Pistol Squat', 'Single-leg bodyweight squat'),
    (6, 'Jefferson Deadlift', 'Staggered stance deadlift variation'),
    (6, 'Reverse Lunge', 'Stationary lunge stepping backward'),
    (6, 'Side Lunge', 'Lateral lunge movement'),
    (6, 'Smith Machine Squat', 'Guided barbell squat'),
    (6, 'Donkey Calf Raise', 'Bent-over calf raise variation'),
    (6, 'Leg Press Calf Raise', 'Calf raise on leg press machine'),
    (6, 'Good Morning', 'Hip-hinge movement for posterior chain'),
    (6, 'Single-Leg Romanian Deadlift', 'Unilateral hamstring exercise'),
    (6, 'Curtsy Lunge', 'Cross-body lunge variation'),
    (6, 'Kettlebell Swing', 'Dynamic hip-hinge movement'),
    (6, 'Banded Hip Thrust', 'Band-resisted glute exercise'),
    (6, 'Jump Squat', 'Plyometric squat variation'),
    (6, 'Single-Leg Leg Press', 'Unilateral leg press'),
    (6, 'Standing Leg Curl', 'Single-leg hamstring isolation'),
    (6, 'Adductor Machine', 'Inner thigh isolation exercise'),
    (6, 'Abductor Machine', 'Outer thigh isolation exercise'),
    (6, 'Zercher Squat', 'Front-loaded elbow squat'),
    (6, 'Belt Squat', 'Hip-loaded squat variation'),
    (6, 'Deficit Deadlift', 'Deadlift from elevated platform');

-- Insert core exercises
INSERT INTO Exercises (CategoryID, ExerciseName, Description)
VALUES 
    (7, 'Plank', 'Fundamental core stability exercise'),
    (7, 'Crunch', 'Basic abdominal flexion movement'),
    (7, 'Russian Twist', 'Rotational core exercise'),
    (7, 'Dead Bug', 'Anti-extension core stability exercise'),
    (7, 'Bird Dog', 'Contralateral limb stability exercise'),
    (7, 'Ab Wheel Rollout', 'Dynamic core stability movement'),
    (7, 'Hanging Leg Raise', 'Advanced lower ab exercise'),
    (7, 'Cable Wood Chop', 'Diagonal rotational movement'),
    (7, 'Pallof Press', 'Anti-rotation core exercise'),
    (7, 'Side Plank', 'Lateral core stability exercise'),
    (7, 'Mountain Climber', 'Dynamic core and cardio movement'),
    (7, 'Reverse Crunch', 'Lower abdominal focused exercise'),
    (7, 'Dragon Flag', 'Advanced full-body core exercise'),
    (7, 'Farmers Walk', 'Loaded carry for core stability'),
    (7, 'Turkish Get-Up', 'Complex core and shoulder stability'),
    (7, 'Windshield Wiper', 'Advanced oblique exercise'),
    (7, 'Copenhagen Plank', 'Advanced side plank variation'),
    (7, 'Suitcase Carry', 'Unilateral loaded carry'),
    (7, 'Cable Core Press', 'Standing anti-extension exercise'),
    (7, 'Hollow Body Hold', 'Gymnastics-based core exercise'),
    (7, 'V-Up', 'Upper and lower ab coordination'),
    (7, 'L-Sit', 'Static gymnastics hold'),
    (7, 'Decline Bench Crunch', 'Weighted ab flexion exercise'),
    (7, 'Toes to Bar', 'Advanced hanging core movement'),
    (7, 'Renegade Row', 'Plank with rowing motion'),
    (7, 'Cable Rotation', 'Standing rotational core exercise'),
    (7, 'Plank to Downward Dog', 'Dynamic plank variation'),
    (7, 'Side Bend', 'Lateral flexion for obliques'),
    (7, 'Landmine Rotation', 'Standing anti-rotation with barbell'),
    (7, 'Plank Shoulder Taps', 'Anti-rotation plank variation'),
    (7, 'Ab Crunch Machine', 'Machine-based spinal flexion'),
    (7, 'Stability Ball Pike', 'Advanced core stability exercise'),
    (7, 'Stability Ball Rollout', 'Alternative to ab wheel'),
    (7, 'Medicine Ball Slam', 'Explosive core movement'),
    (7, 'Kneeling Cable Crunch', 'Weighted spinal flexion'),
    (7, 'Plank Hip Dips', 'Oblique-focused plank variation'),
    (7, 'Standing Band Rotation', 'Rotational movement with resistance band'),
    (7, 'Hanging Windshield Wiper', 'Advanced hanging oblique exercise'),
    (7, 'Dragon Walk', 'Dynamic core stability movement'),
    (7, 'Barbell Rollout', 'Advanced variation of ab wheel'),
    (7, 'Side Plank with Hip Lift', 'Advanced lateral core exercise'),
    (7, 'Reverse Plank', 'Posterior chain activation'),
    (7, 'Decline Russian Twist', 'Weighted rotational movement'),
    (7, 'Standing Gate Opener', 'Dynamic hip mobility and core'),
    (7, 'Plank Walk', 'Dynamic stability exercise');
