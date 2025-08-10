-- Create exercise_goals table for training goals
CREATE TABLE exercise_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    target_1rm_lbs DECIMAL(6,2) CHECK (target_1rm_lbs > 0 AND target_1rm_lbs <= 9999.99),
    target_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure one goal per user per exercise
    UNIQUE(user_id, exercise_id)
);

-- Enable Row Level Security
ALTER TABLE exercise_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own goals" ON exercise_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON exercise_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON exercise_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON exercise_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_exercise_goals_updated_at
    BEFORE UPDATE ON exercise_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for faster lookups
CREATE INDEX idx_exercise_goals_user_id ON exercise_goals(user_id);
CREATE INDEX idx_exercise_goals_exercise_id ON exercise_goals(exercise_id);
CREATE INDEX idx_exercise_goals_user_exercise ON exercise_goals(user_id, exercise_id);