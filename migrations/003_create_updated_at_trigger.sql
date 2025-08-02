-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for workout_records table
CREATE TRIGGER update_workout_records_updated_at 
    BEFORE UPDATE ON workout_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();