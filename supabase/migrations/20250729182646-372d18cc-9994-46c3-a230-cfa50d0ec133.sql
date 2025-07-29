-- Remove duplicate habit activities, keeping only the most recent one for each user/habit/date combination
DELETE FROM habit_activities 
WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, habit_id, activity_date) id
    FROM habit_activities
    ORDER BY user_id, habit_id, activity_date, created_at DESC
);

-- Now add the unique constraint to prevent future duplicates
ALTER TABLE habit_activities 
ADD CONSTRAINT habit_activities_user_habit_date_unique 
UNIQUE (user_id, habit_id, activity_date);