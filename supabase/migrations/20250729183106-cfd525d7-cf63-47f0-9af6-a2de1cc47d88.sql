-- Remove all habits and related data that are in all caps
-- First remove habit activities for all-caps habits
DELETE FROM habit_activities WHERE habit_name ~ '^[A-Z\s]+$';

-- Remove habit photos for all-caps habits  
DELETE FROM habit_photos WHERE habit_name ~ '^[A-Z\s]+$';

-- Remove the all-caps habits themselves
DELETE FROM habits WHERE name ~ '^[A-Z\s]+$';