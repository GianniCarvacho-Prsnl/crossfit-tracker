-- Create exercises table
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 5 initial CrossFit exercises
INSERT INTO exercises (name) VALUES 
  ('Clean'),
  ('Snatch'),
  ('Deadlift'),
  ('Front Squat'),
  ('Back Squat');

-- Enable RLS on exercises table
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read exercises
CREATE POLICY "Authenticated users can read exercises" ON exercises
  FOR SELECT TO authenticated
  USING (true);