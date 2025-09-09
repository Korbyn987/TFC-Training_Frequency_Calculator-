# TFC Training Frequency Calculator - API Endpoints Specification

## Authentication Endpoints

### POST /auth/register
Register a new user account
```json
{
  "username": "string",
  "email": "string", 
  "password": "string",
  "display_name": "string",
  "date_of_birth": "YYYY-MM-DD",
  "gender": "string",
  "height_cm": 180,
  "weight_kg": 75.5,
  "fitness_level": "beginner|intermediate|advanced"
}
```

### POST /auth/login
Authenticate user and return JWT token
```json
{
  "username_or_email": "string",
  "password": "string"
}
```

### POST /auth/refresh
Refresh JWT token
```json
{
  "refresh_token": "string"
}
```

### POST /auth/logout
Invalidate user session

### POST /auth/forgot-password
Request password reset
```json
{
  "email": "string"
}
```

## User Profile Endpoints

### GET /users/profile
Get current user's profile

### PUT /users/profile
Update user profile
```json
{
  "display_name": "string",
  "bio": "string",
  "profile_picture_url": "string",
  "weight_kg": 75.5,
  "fitness_level": "string",
  "profile_visibility": "public|friends|private",
  "workout_visibility": "public|friends|private",
  "stats_visibility": "public|friends|private"
}
```

### GET /users/{user_id}
Get public user profile

### GET /users/search?q={query}
Search users by username or display name

### GET /users/{user_id}/stats
Get user statistics and rankings

## Workout Endpoints

### POST /workouts
Create new workout
```json
{
  "name": "Push Day",
  "description": "Chest, shoulders, triceps",
  "workout_type": "strength",
  "started_at": "2024-01-15T10:00:00Z",
  "location": "Gold's Gym",
  "exercises": [
    {
      "exercise_id": 1,
      "exercise_name": "Bench Press",
      "muscle_group": "chest",
      "sets": [
        {
          "weight_kg": 80,
          "reps": 8,
          "rpe": 7,
          "rir": 3
        }
      ]
    }
  ]
}
```

### PUT /workouts/{workout_id}/complete
Complete workout and calculate metrics
```json
{
  "completed_at": "2024-01-15T11:30:00Z",
  "notes": "Great session, felt strong",
  "post_workout_energy": 8,
  "muscle_soreness_level": 3,
  "tags": ["push-day", "pr-attempt"]
}
```

### GET /workouts
Get user's workout history
- Query params: `limit`, `offset`, `muscle_group`, `date_from`, `date_to`

### GET /workouts/{workout_id}
Get detailed workout information

### DELETE /workouts/{workout_id}
Delete workout

### GET /workouts/templates
Get workout templates
- Query params: `category`, `difficulty_level`, `is_public`

### POST /workouts/templates
Create workout template

## Social Features Endpoints

### GET /social/feed
Get personalized workout feed from followed users
- Query params: `limit`, `offset`, `type=following|discover`

### POST /social/posts
Create workout post
```json
{
  "workout_id": "uuid",
  "caption": "Crushed leg day today! 💪",
  "media_urls": ["https://..."],
  "is_public": true
}
```

### GET /social/posts/{post_id}
Get workout post details

### POST /social/posts/{post_id}/like
Like/unlike workout post

### POST /social/posts/{post_id}/comments
Add comment to workout post
```json
{
  "content": "Great work! What was your squat weight?",
  "parent_comment_id": "uuid" // optional for replies
}
```

### GET /social/posts/{post_id}/comments
Get post comments

### POST /users/{user_id}/follow
Follow/unfollow user

### GET /users/{user_id}/followers
Get user's followers list

### GET /users/{user_id}/following
Get users that user follows

## Ranking & Leaderboard Endpoints

### GET /leaderboards
Get available leaderboards
```json
[
  {
    "id": "uuid",
    "name": "Current Streak Champions",
    "metric_type": "current_streak",
    "time_period": "all_time"
  }
]
```

### GET /leaderboards/{leaderboard_id}
Get leaderboard rankings
- Query params: `limit=50`, `offset=0`, `user_id` (to find user's position)

### GET /rankings/personal
Get user's personal rankings across all leaderboards

### GET /rankings/compare/{user_id}
Compare current user with another user
```json
{
  "comparison": {
    "current_streak": {"me": 15, "them": 12, "winner": "me"},
    "total_workouts": {"me": 45, "them": 67, "winner": "them"},
    "max_bench_press": {"me": 100, "them": 95, "winner": "me"}
  }
}
```

## Analytics Endpoints

### GET /analytics/progress
Get workout progress analytics
- Query params: `muscle_group`, `exercise_id`, `time_period=7d|30d|90d|1y`

### GET /analytics/recovery
Get recovery pattern analysis

### GET /analytics/volume
Get training volume trends

### GET /analytics/achievements
Get user achievements and progress toward next achievements

## Real-time Features (WebSocket)

### WS /ws/notifications
Real-time notifications for:
- New followers
- Workout post likes/comments
- Achievement unlocks
- Leaderboard position changes

### WS /ws/live-workout
Live workout tracking and sharing

## Admin Endpoints (Premium/Admin users)

### GET /admin/users
Get user management dashboard

### POST /admin/leaderboards
Create custom leaderboards

### GET /admin/analytics
Get platform-wide analytics

## Error Responses

All endpoints return consistent error format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Email already exists"
    }
  }
}
```

## Rate Limiting

- Authentication: 5 requests/minute
- General API: 100 requests/minute
- Social actions (likes, follows): 50 requests/minute
- File uploads: 10 requests/minute

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```
