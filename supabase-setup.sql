-- TFC Supabase Database Setup
-- Run this in your Supabase SQL Editor: https://gldsfwwccrnjgkmpfpkq.supabase.co/project/default/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (enhanced from your existing local table)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    
    -- Profile information
    display_name VARCHAR(100),
    bio TEXT,
    profile_picture_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    fitness_level VARCHAR(20) DEFAULT 'beginner',
    
    -- Privacy settings
    profile_visibility VARCHAR(20) DEFAULT 'public',
    workout_visibility VARCHAR(20) DEFAULT 'public',
    stats_visibility VARCHAR(20) DEFAULT 'public',
    
    -- Account status
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    -- Link to Supabase Auth
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- User statistics for ranking system
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Workout streaks
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_workout_date DATE,
    
    -- Workout totals
    total_workouts INTEGER DEFAULT 0,
    total_workout_time_minutes INTEGER DEFAULT 0,
    total_exercises_completed INTEGER DEFAULT 0,
    
    -- Weight progression
    max_bench_press_kg DECIMAL(6,2),
    max_squat_kg DECIMAL(6,2),
    max_deadlift_kg DECIMAL(6,2),
    max_overhead_press_kg DECIMAL(6,2),
    
    -- Recovery metrics
    avg_recovery_time_hours DECIMAL(5,2),
    muscle_balance_score DECIMAL(3,2),
    
    -- Social metrics
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    
    -- Rankings
    global_rank INTEGER,
    weekly_rank INTEGER,
    monthly_rank INTEGER,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enhanced workouts table
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic workout info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    workout_type VARCHAR(50) DEFAULT 'strength',
    
    -- Timing
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Location and environment
    location VARCHAR(200),
    gym_name VARCHAR(200),
    
    -- Metrics
    total_volume_kg DECIMAL(10,2),
    calories_burned INTEGER,
    
    -- Recovery data
    pre_workout_energy INTEGER CHECK (pre_workout_energy >= 1 AND pre_workout_energy <= 10),
    post_workout_energy INTEGER CHECK (post_workout_energy >= 1 AND post_workout_energy <= 10),
    muscle_soreness_level INTEGER CHECK (muscle_soreness_level >= 1 AND muscle_soreness_level <= 10),
    
    -- Social features
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    
    -- Notes and tags
    notes TEXT,
    tags TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout exercises
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL,
    exercise_name VARCHAR(200) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    
    exercise_order INTEGER NOT NULL,
    sets_completed INTEGER NOT NULL,
    target_sets INTEGER,
    
    notes TEXT,
    form_rating INTEGER CHECK (form_rating >= 1 AND form_rating <= 5),
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercise sets
CREATE TABLE exercise_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
    
    set_number INTEGER NOT NULL,
    set_type VARCHAR(20) DEFAULT 'working',
    
    weight_kg DECIMAL(6,2),
    reps INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
    rir INTEGER CHECK (rir >= 0 AND rir <= 10),
    
    is_personal_record BOOLEAN DEFAULT false,
    is_failed_rep BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social following system
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Workout posts for social feed
CREATE TABLE workout_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    
    caption TEXT,
    media_urls TEXT[],
    
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    is_public BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Muscle groups reference table
CREATE TABLE muscle_groups (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert muscle groups data
INSERT INTO muscle_groups (id, name, description) VALUES
(1, 'Chest', 'Pectoral muscles'),
(2, 'Biceps', 'Front arm muscles'),
(3, 'Triceps', 'Back arm muscles'),
(4, 'Back', 'Latissimus dorsi, rhomboids, and trapezius'),
(5, 'Shoulders', 'Deltoid muscles'),
(6, 'Legs', 'Quadriceps and leg muscles'),
(7, 'Core', 'Abdominal and core stabilizing muscles')
ON CONFLICT (id) DO NOTHING;

-- Exercises table
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    muscle_group_id INTEGER REFERENCES muscle_groups(id),
    description TEXT,
    equipment VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    is_compound BOOLEAN DEFAULT false,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supabase Exercise Data Migration Script
-- Run this in Supabase SQL Editor to populate exercises

-- Insert all exercises from staticExercises.js
INSERT INTO exercises (id, name, muscle_group_id, description) VALUES
-- Chest (1)
(1, 'Dips', 1, 'Bodyweight exercise targeting lower chest and triceps'),
(2, 'Pushups', 1, 'Fundamental bodyweight exercise for chest development'),
(3, 'Bench Press', 1, 'Classic barbell exercise for overall chest development'),
(4, 'Cable Fly: High to Low', 1, 'Cable exercise targeting lower chest'),
(5, 'Cable Fly: Low to High', 1, 'Cable exercise targeting upper chest'),
(6, 'Chest Press', 1, 'Machine-based pressing movement for chest'),
(7, 'Dumbbell Bench Press', 1, 'Free weight variation of bench press using dumbbells'),
(8, 'Incline Bench Press', 1, 'Barbell press targeting upper chest'),
(9, 'Decline Bench Press', 1, 'Barbell press targeting lower chest'),
(10, 'Dumbbell Fly', 1, 'Isolation exercise for chest with dumbbells'),
(11, 'Dumbbell Incline Press', 1, 'Upper chest focused dumbbell press'),
(12, 'Incline Dumbbell Fly', 1, 'Upper chest focused fly movement'),
(13, 'Smith Machine Bench Press', 1, 'Guided barbell press for chest'),
(14, 'Landmine Press', 1, 'Single-arm press using barbell and landmine'),
(15, 'Floor Press', 1, 'Bench press variation performed on floor'),
(16, 'Resistance Band Press', 1, 'Chest press using resistance bands'),
(17, 'Machine Fly', 1, 'Pec deck machine for isolation'),
(18, 'Incline Dumbbell Pullover', 1, 'Upper chest and lat exercise'),
(19, 'Svend Press', 1, 'Plate squeeze press for inner chest'),
(20, 'Decline Push-Up', 1, 'Feet elevated push-up variation'),
(21, 'Incline Push-Up', 1, 'Hands elevated push-up variation'),
(22, 'Around The World', 1, 'Dynamic dumbbell movement for chest'),
(23, 'Single-Arm Cable Press', 1, 'Unilateral chest press with cable'),
(24, 'Hammer Strength Press', 1, 'Machine press for chest development'),
(25, 'Alternating Dumbbell Press', 1, 'Alternating chest press with dumbbells'),
(26, 'Spoto Press', 1, 'Bench press with pause above chest'),

-- Biceps (2)
(28, 'Barbell Curl', 2, 'Classic bicep exercise using a straight barbell'),
(29, 'Dumbbell Curl', 2, 'Basic bicep curl performed with dumbbells'),
(30, 'Hammer Curl', 2, 'Neutral grip curl targeting the brachialis'),
(31, 'Preacher Curl', 2, 'Isolation exercise performed on preacher bench'),
(32, 'Incline Dumbbell Curl', 2, 'Curl variation with extended range of motion'),
(33, 'Cable Curl', 2, 'Constant tension curl using cable machine'),
(34, 'Concentration Curl', 2, 'Seated isolation curl for peak contraction'),
(35, 'EZ Bar Curl', 2, 'Curl using curved bar for comfort'),
(36, 'Spider Curl', 2, 'Prone curl performed on incline bench'),
(37, 'Reverse Curl', 2, 'Curl with pronated grip targeting brachialis'),
(38, 'Zottman Curl', 2, 'Combination of regular and reverse curl'),
(39, '21s', 2, 'Partial range of motion curl sequence'),

-- Triceps (3)
(40, 'Tricep Pushdown', 3, 'Cable exercise targeting all three heads of triceps'),
(41, 'Skull Crushers', 3, 'Lying tricep extension with barbell or EZ bar'),
(42, 'Overhead Tricep Extension', 3, 'Single or double-handed extension above head'),
(43, 'Close Grip Bench Press', 3, 'Compound movement emphasizing triceps'),
(44, 'Diamond Push-Ups', 3, 'Bodyweight exercise with close hand placement'),
(45, 'Rope Pushdown', 3, 'Cable exercise with rope attachment for better contraction'),
(46, 'Dumbbell Tricep Extension', 3, 'Single-arm overhead extension with dumbbell'),
(47, 'Tricep Kickback', 3, 'Isolation exercise performed bent over'),
(48, 'Bench Dips', 3, 'Bodyweight exercise using bench for support'),
(49, 'JM Press', 3, 'Hybrid of close grip bench and skull crusher'),
(50, 'Cable Overhead Extension', 3, 'Cable variation of overhead extension'),
(51, 'Reverse Grip Pushdown', 3, 'Underhand grip variation of tricep pushdown'),

-- Back (4)
(52, 'Deadlift', 4, 'Compound movement targeting entire posterior chain'),
(53, 'Pull-Ups', 4, 'Bodyweight exercise for upper back and lats'),
(54, 'Bent Over Row', 4, 'Barbell row targeting middle back'),
(55, 'Lat Pulldown', 4, 'Cable exercise mimicking pull-up movement'),
(56, 'T-Bar Row', 4, 'Supported row variation for middle back'),
(57, 'Face Pull', 4, 'Cable exercise for rear deltoids and upper back'),
(58, 'Seated Cable Row', 4, 'Cable row targeting middle back'),
(59, 'Single-Arm Dumbbell Row', 4, 'Unilateral row with dumbbell'),
(60, 'Meadows Row', 4, 'Landmine variation of single-arm row'),
(61, 'Straight Arm Pulldown', 4, 'Lat isolation exercise'),
(62, 'Pendlay Row', 4, 'Explosive barbell row from floor'),
(63, 'Good Morning', 4, 'Hip-hinge movement for lower back'),
(64, 'Hyperextension', 4, 'Lower back isolation exercise'),
(65, 'Rack Pull', 4, 'Partial deadlift from elevated position'),
(66, 'Chest Supported Row', 4, 'Row variation with torso supported'),
(67, 'Chin-Ups', 4, 'Underhand grip pull-up variation'),
(68, 'Neutral Grip Pull-Ups', 4, 'Pull-ups with palms facing each other'),
(69, 'Machine Row', 4, 'Machine-based rowing movement'),
(70, 'Reverse Grip Lat Pulldown', 4, 'Underhand grip lat pulldown'),
(71, 'Close Grip Lat Pulldown', 4, 'Narrow grip variation targeting inner lats'),
(72, 'Rower Machine', 4, 'Cardio-focused back exercise'),
(73, 'Smith Machine Row', 4, 'Guided barbell row variation'),
(74, 'Cable Face Pull', 4, 'Rear delt and upper back isolation'),
(75, 'Inverted Row', 4, 'Bodyweight horizontal pulling exercise'),
(76, 'Dumbbell Pullover', 4, 'Upper body exercise targeting lats and serratus'),
(77, 'Barbell Shrug', 4, 'Trapezius isolation exercise'),
(78, 'Dumbbell Shrug', 4, 'Unilateral trap exercise with dumbbells'),

-- Shoulders (5)
(79, 'Overhead Press', 5, 'Standing barbell press for overall shoulder development'),
(80, 'Military Press', 5, 'Strict overhead press with feet together'),
(81, 'Dumbbell Shoulder Press', 5, 'Overhead press using dumbbells'),
(82, 'Arnold Press', 5, 'Rotational dumbbell press for all three deltoid heads'),
(83, 'Lateral Raise', 5, 'Dumbbell raise targeting lateral deltoids'),
(84, 'Front Raise', 5, 'Anterior deltoid isolation exercise'),
(85, 'Bent Over Reverse Fly', 5, 'Posterior deltoid isolation with dumbbells'),
(86, 'Cable Lateral Raise', 5, 'Machine variation of lateral raise'),
(87, 'Upright Row', 5, 'Compound movement for shoulders and traps'),
(88, 'Push Press', 5, 'Explosive overhead press with leg drive'),
(89, 'Machine Shoulder Press', 5, 'Guided overhead pressing movement'),
(90, 'Smith Machine Shoulder Press', 5, 'Guided barbell press'),
(91, 'Face Pull', 5, 'Cable exercise for rear deltoids'),
(92, 'Plate Front Raise', 5, 'Front raise variation using weight plate'),
(93, 'Cable Front Raise', 5, 'Cable variation of front raise'),
(94, 'Cable Reverse Fly', 5, 'Cable variation for rear deltoids'),
(95, 'Landmine Press', 5, 'Single-arm pressing using barbell and landmine'),
(97, 'Seated Dumbbell Press', 5, 'Shoulder press performed seated for stability'),
(98, 'Single-Arm Lateral Raise', 5, 'Unilateral lateral deltoid exercise'),
(99, 'Incline Reverse Fly', 5, 'Rear delt exercise on incline bench'),
(100, 'Bradford Press', 5, 'Alternating front and back press'),
(101, 'Z Press', 5, 'Seated floor press for strict form'),
(102, 'Cuban Press', 5, 'Compound movement combining upright row and press'),
(103, 'Lateral Raise Machine', 5, 'Machine-based lateral deltoid isolation'),
(104, 'Reverse Pec Deck', 5, 'Machine for posterior deltoid development'),
(105, '3-Way Raises', 5, 'Front, lateral, and rear raise combination'),
(106, 'Kettlebell Press', 5, 'Overhead press using kettlebell'),
(107, 'Bottoms-Up Press', 5, 'Stability-focused kettlebell press'),
(108, 'Handstand Push-Up', 5, 'Advanced bodyweight shoulder exercise'),

-- Quadriceps (6) - continuing with remaining exercises...
(109, 'Back Squat', 6, 'Fundamental compound movement for lower body'),
(110, 'Front Squat', 6, 'Quad-focused squat variation'),
(111, 'Leg Press', 6, 'Machine-based compound leg exercise'),
(112, 'Leg Extension', 6, 'Isolation exercise for quadriceps'),
(113, 'Bulgarian Split Squat', 6, 'Unilateral squat variation'),
(114, 'Walking Lunges', 6, 'Dynamic lunge variation'),
(115, 'Step-Ups', 6, 'Unilateral exercise using platform'),
(116, 'Goblet Squat', 6, 'Squat variation using dumbbell or kettlebell'),
(117, 'Hack Squat', 6, 'Machine-based squat variation'),
(118, 'Smith Machine Squat', 6, 'Guided barbell squat')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_started_at ON workouts(started_at);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_workout_posts_user_id ON workout_posts(user_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (
        profile_visibility = 'public' 
        OR auth.uid() = auth_user_id
    );

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- RLS Policies for workouts table
CREATE POLICY "Users can view public workouts" ON workouts
    FOR SELECT USING (
        is_public = true 
        OR user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own workouts" ON workouts
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- RLS Policies for workout_exercises table
CREATE POLICY "Users can view workout exercises" ON workout_exercises
    FOR SELECT USING (
        workout_id IN (
            SELECT id FROM workouts WHERE 
            is_public = true 
            OR user_id IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage own workout exercises" ON workout_exercises
    FOR ALL USING (
        workout_id IN (
            SELECT id FROM workouts WHERE user_id IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

-- RLS Policies for exercise_sets table
CREATE POLICY "Users can view exercise sets" ON exercise_sets
    FOR SELECT USING (
        workout_exercise_id IN (
            SELECT we.id FROM workout_exercises we
            JOIN workouts w ON we.workout_id = w.id
            WHERE w.is_public = true 
            OR w.user_id IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage own exercise sets" ON exercise_sets
    FOR ALL USING (
        workout_exercise_id IN (
            SELECT we.id FROM workout_exercises we
            JOIN workouts w ON we.workout_id = w.id
            WHERE w.user_id IN (
                SELECT id FROM users WHERE auth_user_id = auth.uid()
            )
        )
    );

-- RLS Policies for user_stats table
CREATE POLICY "Users can view public stats" ON user_stats
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE 
            stats_visibility = 'public' 
            OR auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own stats" ON user_stats
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, email, username, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    
    -- Create initial user stats
    INSERT INTO public.user_stats (user_id)
    VALUES ((SELECT id FROM public.users WHERE auth_user_id = NEW.id));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
