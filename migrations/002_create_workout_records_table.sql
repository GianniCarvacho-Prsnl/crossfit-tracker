-- Create workout_records table
CREATE TABLE workout_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id),
  weight_lbs DECIMAL(6,2) NOT NULL,
  repetitions INTEGER NOT NULL CHECK (repetitions > 0),
  calculated_1rm DECIMAL(6,2) NOT NULL,
  is_calculated BOOLEAN NOT NULL DEFAULT false,
  original_unit VARCHAR(3) NOT NULL CHECK (original_unit IN ('lbs', 'kg')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for optimization
CREATE INDEX idx_workout_records_user_id ON workout_records(user_id);
CREATE INDEX idx_workout_records_exercise_id ON workout_records(exercise_id);
CREATE INDEX idx_workout_records_created_at ON workout_records(created_at DESC);
CREATE INDEX idx_workout_records_user_exercise ON workout_records(user_id, exercise_id);

-- Enable RLS on workout_records table
ALTER TABLE workout_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_records
-- Users can view their own workout records
CREATE POLICY "Users can view own workout records" ON workout_records
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own workout records
CREATE POLICY "Users can insert own workout records" ON workout_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own workout records
CREATE POLICY "Users can update own workout records" ON workout_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own workout records
CREATE POLICY "Users can delete own workout records" ON workout_records
  FOR DELETE USING (auth.uid() = user_id);