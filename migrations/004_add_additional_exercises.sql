-- Add more common CrossFit exercises
INSERT INTO exercises (name) VALUES 
  ('Push Press'),
  ('Jerk'),
  ('Overhead Squat'),
  ('Thruster'),
  ('Bench Press'),
  ('Pull-up'),
  ('Muscle-up'),
  ('Row'),
  ('Box Jump'),
  ('Burpee');

-- Note: This migration demonstrates how easy it is to add new exercises
-- to the system without changing any code. The UI will automatically
-- pick up these new exercises from the database.