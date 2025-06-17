
-- Add planned_day_of_week column to workout_sessions table
ALTER TABLE public.workout_sessions 
ADD COLUMN planned_day_of_week INTEGER; -- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday

-- Add a comment to clarify the day numbering
COMMENT ON COLUMN public.workout_sessions.planned_day_of_week IS 'Day of week: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';

-- Add an index for better performance when querying by planned day
CREATE INDEX idx_workout_sessions_planned_day ON public.workout_sessions(planned_day_of_week);

-- Add an index for querying current week workouts efficiently
CREATE INDEX idx_workout_sessions_user_date ON public.workout_sessions(user_id, workout_date);
