-- Add unique constraint to habit_activities table to support ON CONFLICT operations
ALTER TABLE habit_activities 
ADD CONSTRAINT habit_activities_user_habit_date_unique 
UNIQUE (user_id, habit_id, activity_date);

-- Also add a constraint for user_id, habit_name, activity_date as backup
ALTER TABLE habit_activities 
ADD CONSTRAINT habit_activities_user_name_date_unique 
UNIQUE (user_id, habit_name, activity_date);