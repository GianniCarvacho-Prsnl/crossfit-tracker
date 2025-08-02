# Database Migrations

This directory contains SQL migration files for the CrossFit Tracker database schema.

## Migration Files

1. **001_create_exercises_table.sql** - Creates the exercises table with 5 initial CrossFit exercises
2. **002_create_workout_records_table.sql** - Creates the workout_records table with RLS policies
3. **003_create_updated_at_trigger.sql** - Creates trigger for automatic updated_at timestamps

## Database Schema

### Tables

#### exercises
- `id` (SERIAL PRIMARY KEY) - Unique exercise identifier
- `name` (VARCHAR(50) UNIQUE) - Exercise name (Clean, Snatch, etc.)
- `created_at` (TIMESTAMP) - Record creation timestamp

#### workout_records
- `id` (UUID PRIMARY KEY) - Unique record identifier
- `user_id` (UUID) - References auth.users(id), user who created the record
- `exercise_id` (INTEGER) - References exercises(id)
- `weight_lbs` (DECIMAL(6,2)) - Weight in pounds (storage format)
- `repetitions` (INTEGER) - Number of repetitions performed
- `calculated_1rm` (DECIMAL(6,2)) - Calculated or direct 1RM value
- `is_calculated` (BOOLEAN) - True if 1RM was calculated using Epley formula
- `original_unit` (VARCHAR(3)) - Original unit entered by user ('lbs' or 'kg')
- `created_at` (TIMESTAMP) - Record creation timestamp
- `updated_at` (TIMESTAMP) - Record last update timestamp

### Indexes

- `idx_workout_records_user_id` - Optimizes queries by user
- `idx_workout_records_exercise_id` - Optimizes queries by exercise
- `idx_workout_records_created_at` - Optimizes date-based sorting
- `idx_workout_records_user_exercise` - Optimizes user + exercise queries

### Row Level Security (RLS)

#### exercises table
- All authenticated users can read exercises

#### workout_records table
- Users can only view their own records
- Users can only insert records for themselves
- Users can only update their own records
- Users can only delete their own records

## Applying Migrations

### Using Supabase CLI
```bash
# Apply all migrations
supabase db reset

# Or apply individual migrations
supabase db push
```

### Using Supabase Dashboard
1. Go to SQL Editor in your Supabase dashboard
2. Copy and paste each migration file content
3. Execute in order (001, 002, 003)

### Using MCP (if configured)
The migrations can be applied using the Supabase MCP server once properly configured with project credentials.

## Notes

- All weights are stored in pounds (lbs) for consistency
- The original unit is preserved for display purposes
- 1RM calculations use the Epley formula: `1RM = (Weight * 0.0333 * Reps) + Weight`
- RLS ensures data isolation between users
- Triggers automatically update the `updated_at` timestamp