# TFC Ranking System & Social Features

## Ranking Algorithms

### 1. Workout Streak Ranking

**Primary Metric**: Current consecutive workout days
**Secondary Metrics**: Longest streak, workout consistency

```sql
-- Calculate current streak for all users
WITH user_workout_days AS (
  SELECT
    user_id,
    DATE(started_at) as workout_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY DATE(started_at) DESC) as day_rank
  FROM workouts
  WHERE completed_at IS NOT NULL
),
streak_calculation AS (
  SELECT
    user_id,
    workout_date,
    workout_date - INTERVAL '1 day' * (day_rank - 1) as streak_group
  FROM user_workout_days
),
current_streaks AS (
  SELECT
    user_id,
    COUNT(*) as current_streak,
    MAX(workout_date) as last_workout_date
  FROM streak_calculation
  WHERE streak_group = (
    SELECT MAX(streak_group)
    FROM streak_calculation s2
    WHERE s2.user_id = streak_calculation.user_id
  )
  GROUP BY user_id, streak_group
)
UPDATE user_stats
SET current_streak = cs.current_streak,
    last_workout_date = cs.last_workout_date
FROM current_streaks cs
WHERE user_stats.user_id = cs.user_id;
```

### 2. Total Volume Ranking

**Formula**: `Total Weight Lifted × Exercise Difficulty Multiplier`

```javascript
// Exercise difficulty multipliers
const EXERCISE_MULTIPLIERS = {
  compound: 1.5, // Squat, Deadlift, Bench Press
  isolation: 1.0, // Bicep Curls, Leg Extensions
  bodyweight: 1.2, // Pull-ups, Push-ups
  cardio: 0.8 // Running, Cycling
};

function calculateVolumeScore(workout) {
  let totalScore = 0;

  workout.exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      const baseVolume = set.weight_kg * set.reps;
      const multiplier = EXERCISE_MULTIPLIERS[exercise.type] || 1.0;
      const rpeBonus = (set.rpe || 5) / 10; // RPE bonus (0.1-1.0)

      totalScore += baseVolume * multiplier * (1 + rpeBonus);
    });
  });

  return Math.round(totalScore);
}
```

### 3. Balanced Training Score

**Measures**: How evenly user trains all muscle groups

```javascript
function calculateBalanceScore(userStats) {
  const muscleGroups = [
    "chest",
    "back",
    "shoulders",
    "biceps",
    "triceps",
    "quads",
    "hamstrings",
    "calves",
    "abs"
  ];
  const workoutCounts = {};

  // Count workouts per muscle group (last 30 days)
  muscleGroups.forEach((muscle) => {
    workoutCounts[muscle] = userStats[`${muscle}_workouts_30d`] || 0;
  });

  const values = Object.values(workoutCounts);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    values.length;
  const standardDeviation = Math.sqrt(variance);

  // Lower standard deviation = more balanced training
  const balanceScore = Math.max(0, 1 - standardDeviation / mean);
  return Math.round(balanceScore * 100) / 100;
}
```

### 4. Progressive Overload Ranking

**Tracks**: Consistent strength/volume increases over time

```sql
-- Calculate progressive overload score
WITH exercise_progression AS (
  SELECT
    w.user_id,
    we.exercise_id,
    DATE_TRUNC('week', w.started_at) as week,
    MAX(es.weight_kg * es.reps) as max_volume
  FROM workouts w
  JOIN workout_exercises we ON w.id = we.workout_id
  JOIN exercise_sets es ON we.id = es.workout_exercise_id
  WHERE w.started_at >= NOW() - INTERVAL '12 weeks'
  GROUP BY w.user_id, we.exercise_id, week
),
progression_trends AS (
  SELECT
    user_id,
    exercise_id,
    REGR_SLOPE(max_volume, EXTRACT(EPOCH FROM week)) as progression_rate
  FROM exercise_progression
  GROUP BY user_id, exercise_id
  HAVING COUNT(*) >= 4 -- Minimum 4 weeks of data
)
SELECT
  user_id,
  AVG(GREATEST(0, progression_rate)) as avg_progression_score
FROM progression_trends
GROUP BY user_id;
```

## Social Features Implementation

### 1. Workout Feed Algorithm

**Prioritizes**: Recent workouts from followed users, trending posts, similar fitness levels

```javascript
function generateWorkoutFeed(userId, limit = 20) {
  const feedQuery = `
    WITH user_follows AS (
      SELECT following_id FROM user_follows WHERE follower_id = $1
    ),
    feed_posts AS (
      SELECT 
        wp.*,
        u.username,
        u.display_name,
        u.profile_picture_url,
        w.name as workout_name,
        w.duration_minutes,
        w.total_volume_kg,
        -- Engagement score for ranking
        (wp.likes_count * 3 + wp.comments_count * 5 + wp.shares_count * 2) as engagement_score,
        -- Recency score (higher for recent posts)
        EXTRACT(EPOCH FROM (NOW() - wp.created_at)) / 3600 as hours_ago
      FROM workout_posts wp
      JOIN users u ON wp.user_id = u.id
      JOIN workouts w ON wp.workout_id = w.id
      WHERE (
        wp.user_id IN (SELECT following_id FROM user_follows) -- Following
        OR wp.is_public = true -- Public posts
      )
      AND wp.created_at >= NOW() - INTERVAL '7 days'
    )
    SELECT *,
      -- Feed ranking algorithm
      (engagement_score / (1 + hours_ago/24)) as feed_score
    FROM feed_posts
    ORDER BY feed_score DESC, created_at DESC
    LIMIT $2
  `;

  return db.query(feedQuery, [userId, limit]);
}
```

### 2. User Comparison System

```javascript
function compareUsers(userId1, userId2) {
  const metrics = [
    "current_streak",
    "total_workouts",
    "total_workout_time_minutes",
    "max_bench_press_kg",
    "max_squat_kg",
    "max_deadlift_kg",
    "followers_count",
    "muscle_balance_score"
  ];

  const comparison = {};

  metrics.forEach((metric) => {
    const user1Value = user1Stats[metric] || 0;
    const user2Value = user2Stats[metric] || 0;

    comparison[metric] = {
      user1: user1Value,
      user2: user2Value,
      winner:
        user1Value > user2Value
          ? "user1"
          : user2Value > user1Value
          ? "user2"
          : "tie",
      difference: Math.abs(user1Value - user2Value),
      percentageDiff:
        user2Value > 0
          ? Math.round(((user1Value - user2Value) / user2Value) * 100)
          : 0
    };
  });

  return comparison;
}
```

### 3. Achievement System

```javascript
const ACHIEVEMENTS = [
  {
    id: "first_workout",
    name: "Getting Started",
    description: "Complete your first workout",
    criteria: { type: "total_workouts", value: 1 },
    badge_icon: "🏃‍♂️"
  },
  {
    id: "week_streak",
    name: "Week Warrior",
    description: "Maintain a 7-day workout streak",
    criteria: { type: "current_streak", value: 7 },
    badge_icon: "🔥"
  },
  {
    id: "bench_100kg",
    name: "Century Club",
    description: "Bench press 100kg",
    criteria: { type: "max_bench_press_kg", value: 100 },
    badge_icon: "💪"
  },
  {
    id: "balanced_trainer",
    name: "Balanced Beast",
    description: "Achieve 0.8+ muscle balance score",
    criteria: { type: "muscle_balance_score", value: 0.8 },
    badge_icon: "⚖️"
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Get 100 followers",
    criteria: { type: "followers_count", value: 100 },
    badge_icon: "🦋"
  }
];

function checkAchievements(userId, userStats) {
  const newAchievements = [];

  ACHIEVEMENTS.forEach((achievement) => {
    const userValue = userStats[achievement.criteria.type] || 0;

    if (userValue >= achievement.criteria.value) {
      // Check if user already has this achievement
      const hasAchievement = db.query(
        "SELECT id FROM user_achievements WHERE user_id = $1 AND achievement_id = $2",
        [userId, achievement.id]
      );

      if (!hasAchievement.length) {
        // Award achievement
        db.query(
          "INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2)",
          [userId, achievement.id]
        );

        newAchievements.push(achievement);
      }
    }
  });

  return newAchievements;
}
```

### 4. Leaderboard Update Schedule

```javascript
// Cron job configurations
const LEADERBOARD_SCHEDULES = {
  daily_streaks: "0 0 * * *", // Daily at midnight
  weekly_volume: "0 0 * * 0", // Weekly on Sunday
  monthly_progress: "0 0 1 * *", // Monthly on 1st
  real_time_workouts: "*/5 * * * *" // Every 5 minutes
};

async function updateLeaderboards(leaderboardType) {
  const queries = {
    current_streak: `
      INSERT INTO leaderboard_entries (leaderboard_id, user_id, rank_position, metric_value)
      SELECT 
        $1,
        user_id,
        ROW_NUMBER() OVER (ORDER BY current_streak DESC, last_workout_date DESC),
        current_streak
      FROM user_stats
      WHERE current_streak > 0
      ON CONFLICT (leaderboard_id, user_id) 
      DO UPDATE SET 
        rank_position = EXCLUDED.rank_position,
        metric_value = EXCLUDED.metric_value
    `,

    total_volume: `
      INSERT INTO leaderboard_entries (leaderboard_id, user_id, rank_position, metric_value)
      SELECT 
        $1,
        w.user_id,
        ROW_NUMBER() OVER (ORDER BY SUM(w.total_volume_kg) DESC),
        SUM(w.total_volume_kg)
      FROM workouts w
      WHERE w.started_at >= NOW() - INTERVAL '30 days'
      GROUP BY w.user_id
      ON CONFLICT (leaderboard_id, user_id)
      DO UPDATE SET 
        rank_position = EXCLUDED.rank_position,
        metric_value = EXCLUDED.metric_value
    `
  };

  return db.query(queries[leaderboardType], [leaderboardId]);
}
```

## Real-time Notifications

```javascript
// WebSocket notification system
function sendNotification(userId, notification) {
  const wsClients = getConnectedClients(userId);

  wsClients.forEach((client) => {
    client.send(
      JSON.stringify({
        type: notification.type,
        data: notification.data,
        timestamp: new Date().toISOString()
      })
    );
  });

  // Also store in database for offline users
  db.query(
    "INSERT INTO notifications (user_id, type, data, created_at) VALUES ($1, $2, $3, NOW())",
    [userId, notification.type, JSON.stringify(notification.data)]
  );
}

// Notification triggers
const NOTIFICATION_TYPES = {
  NEW_FOLLOWER: "new_follower",
  WORKOUT_LIKED: "workout_liked",
  WORKOUT_COMMENTED: "workout_commented",
  ACHIEVEMENT_UNLOCKED: "achievement_unlocked",
  RANK_IMPROVED: "rank_improved",
  FRIEND_WORKOUT: "friend_workout"
};
```
