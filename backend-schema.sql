-- TFC Training Frequency Calculator Backend Database Schema
-- Supports user authentication, workout tracking, social features, and ranking system

-- Enhanced Users table with profile and stats
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    
    -- Profile information
    display_name VARCHAR(100),
    bio TEXT,
    profile_picture_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    fitness_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
    
    -- Privacy settings
    profile_visibility VARCHAR(20) DEFAULT 'public', -- public, friends, private
    workout_visibility VARCHAR(20) DEFAULT 'public',
    stats_visibility VARCHAR(20) DEFAULT 'public',
    
    -- Account status
    is_verified BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    deleted_at TIMESTAMP -- soft delete
);

-- User statistics for ranking system
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    muscle_balance_score DECIMAL(3,2), -- 0-1 score for balanced training
    
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

-- Enhanced workouts table with detailed tracking
CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic workout info
    name VARCHAR(200) NOT NULL,
    description TEXT,
    workout_type VARCHAR(50), -- strength, cardio, flexibility, mixed
    
    -- Timing
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    
    -- Location and environment
    location VARCHAR(200),
    gym_name VARCHAR(200),
    workout_buddy_user_id UUID REFERENCES users(id),
    
    -- Metrics
    total_volume_kg DECIMAL(10,2), -- total weight lifted
    calories_burned INTEGER,
    avg_heart_rate INTEGER,
    max_heart_rate INTEGER,
    
    -- Recovery data
    pre_workout_energy INTEGER CHECK (pre_workout_energy >= 1 AND pre_workout_energy <= 10),
    post_workout_energy INTEGER CHECK (post_workout_energy >= 1 AND post_workout_energy <= 10),
    muscle_soreness_level INTEGER CHECK (muscle_soreness_level >= 1 AND muscle_soreness_level <= 10),
    
    -- Social features
    is_public BOOLEAN DEFAULT true,
    allow_comments BOOLEAN DEFAULT true,
    
    -- Notes and tags
    notes TEXT,
    tags TEXT[], -- array of tags like 'push-day', 'pr-attempt', 'deload'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detailed exercise tracking within workouts
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL, -- references your existing exercise data
    exercise_name VARCHAR(200) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    
    -- Exercise order and grouping
    exercise_order INTEGER NOT NULL,
    superset_group INTEGER, -- for tracking supersets
    
    -- Performance data
    sets_completed INTEGER NOT NULL,
    target_sets INTEGER,
    
    -- Notes and modifications
    notes TEXT,
    form_rating INTEGER CHECK (form_rating >= 1 AND form_rating <= 5),
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual set tracking for detailed progression
CREATE TABLE exercise_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
    
    set_number INTEGER NOT NULL,
    set_type VARCHAR(20) DEFAULT 'working', -- working, warmup, dropset, failure
    
    -- Performance metrics
    weight_kg DECIMAL(6,2),
    reps INTEGER,
    duration_seconds INTEGER, -- for time-based exercises
    distance_meters DECIMAL(8,2), -- for cardio
    rest_seconds INTEGER,
    
    -- Effort metrics
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
    rir INTEGER CHECK (rir >= 0 AND rir <= 10), -- Reps in Reserve
    
    -- Performance indicators
    is_personal_record BOOLEAN DEFAULT false,
    is_failed_rep BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social following system
CREATE TABLE user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Workout posts for social feed
CREATE TABLE workout_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    
    -- Post content
    caption TEXT,
    media_urls TEXT[], -- array of photo/video URLs
    
    -- Engagement metrics
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    
    -- Visibility
    is_public BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post interactions (likes, shares)
CREATE TABLE post_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES workout_posts(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL, -- like, share, save
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, post_id, interaction_type)
);

-- Comments on workout posts
CREATE TABLE post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES workout_posts(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES post_comments(id), -- for replies
    
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Leaderboards for various metrics
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    metric_type VARCHAR(50) NOT NULL, -- streak, total_workouts, max_bench, etc.
    time_period VARCHAR(20) NOT NULL, -- all_time, monthly, weekly, daily
    
    -- Leaderboard settings
    is_active BOOLEAN DEFAULT true,
    min_workouts_required INTEGER DEFAULT 1,
    muscle_group_filter VARCHAR(50), -- optional filter by muscle group
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard entries (updated periodically)
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    rank_position INTEGER NOT NULL,
    metric_value DECIMAL(12,2) NOT NULL,
    
    -- Additional context
    workout_count INTEGER,
    last_workout_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(leaderboard_id, user_id)
);

-- Muscle groups reference table
CREATE TABLE muscle_groups (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises reference table
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    muscle_group_id INTEGER REFERENCES muscle_groups(id),
    description TEXT,
    equipment VARCHAR(100),
    difficulty_level VARCHAR(20) DEFAULT 'intermediate', -- beginner, intermediate, advanced
    is_compound BOOLEAN DEFAULT false,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert muscle groups data
INSERT INTO muscle_groups (id, name, description) VALUES
(1, 'Chest', 'Pectoral muscles'),
(2, 'Biceps', 'Front arm muscles'),
(3, 'Triceps', 'Back arm muscles'),
(4, 'Back', 'Latissimus dorsi, rhomboids, and trapezius'),
(5, 'Shoulders', 'Deltoid muscles'),
(6, 'Quadriceps', 'Front thigh muscles'),
(7, 'Hamstrings', 'Back thigh muscles'),
(8, 'Core', 'Abdominal and core stabilizing muscles');

-- Workout templates/presets
CREATE TABLE workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- push, pull, legs, full_body, cardio
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    estimated_duration_minutes INTEGER,
    
    -- Template settings
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    uses_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises within workout templates
CREATE TABLE template_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES workout_templates(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL,
    exercise_name VARCHAR(200) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    
    exercise_order INTEGER NOT NULL,
    target_sets INTEGER,
    target_reps_min INTEGER,
    target_reps_max INTEGER,
    target_weight_kg DECIMAL(6,2),
    rest_seconds INTEGER,
    
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements and badges
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_icon_url TEXT,
    
    -- Achievement criteria
    criteria_type VARCHAR(50) NOT NULL, -- streak, total_workouts, weight_milestone, etc.
    criteria_value DECIMAL(10,2) NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User earned achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    workout_id UUID REFERENCES workouts(id), -- workout that triggered the achievement
    
    UNIQUE(user_id, achievement_id)
);

-- Indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_started_at ON workouts(started_at);
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_exercise_sets_workout_exercise_id ON exercise_sets(workout_exercise_id);
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_workout_posts_user_id ON workout_posts(user_id);
CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_leaderboard_entries_leaderboard ON leaderboard_entries(leaderboard_id, rank_position);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
