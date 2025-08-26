-- Add default_tracking_type to habits table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'habits' AND column_name = 'default_tracking_type'
    ) THEN
        ALTER TABLE public.habits 
        ADD COLUMN default_tracking_type TEXT DEFAULT 'DAILY' 
        CHECK (default_tracking_type IN ('DAILY', 'N_PER_PERIOD', 'SELECTED_DAYS'));
    END IF;
END $$;

-- Create user_habits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_habits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    tracking_type TEXT NOT NULL DEFAULT 'DAILY' CHECK (tracking_type IN ('DAILY', 'N_PER_PERIOD', 'SELECTED_DAYS')),
    period TEXT CHECK (period IN ('WEEK', 'MONTH')),
    target_count INTEGER,
    selected_days INTEGER[] CHECK (array_length(selected_days, 1) IS NULL OR (array_length(selected_days, 1) > 0 AND selected_days <@ ARRAY[0,1,2,3,4,5,6])),
    min_rest_days INTEGER DEFAULT 0,
    time_window_start TIME,
    time_window_end TIME,
    reminder_time TIME,
    reminder_channel TEXT[] DEFAULT '{}',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, habit_id)
);

-- Create habit_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.habit_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_habit_id UUID NOT NULL REFERENCES public.user_habits(id) ON DELETE CASCADE,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    value NUMERIC DEFAULT 1,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'automatic', 'import')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_habits
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_habits' AND policyname = 'Users can manage their own habit configs'
    ) THEN
        CREATE POLICY "Users can manage their own habit configs" 
        ON public.user_habits 
        FOR ALL 
        USING (auth.uid() = user_id) 
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- RLS policies for habit_events
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'habit_events' AND policyname = 'Users can manage their own habit events'
    ) THEN
        CREATE POLICY "Users can manage their own habit events" 
        ON public.habit_events 
        FOR ALL 
        USING (EXISTS (
            SELECT 1 FROM public.user_habits 
            WHERE user_habits.id = habit_events.user_habit_id 
            AND user_habits.user_id = auth.uid()
        )) 
        WITH CHECK (EXISTS (
            SELECT 1 FROM public.user_habits 
            WHERE user_habits.id = habit_events.user_habit_id 
            AND user_habits.user_id = auth.uid()
        ));
    END IF;
END $$;

-- Add updated_at trigger for user_habits
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_user_habits_updated_at'
    ) THEN
        CREATE TRIGGER update_user_habits_updated_at
        BEFORE UPDATE ON public.user_habits
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;

-- Helper function to calculate streak for flexible frequencies
CREATE OR REPLACE FUNCTION public.calculate_habit_streak(
    p_user_habit_id UUID,
    p_as_of_date DATE DEFAULT CURRENT_DATE
) RETURNS INTEGER AS $$
DECLARE
    habit_config RECORD;
    current_streak INTEGER := 0;
    check_date DATE;
    period_start DATE;
    period_end DATE;
    events_in_period INTEGER;
    target_met BOOLEAN;
BEGIN
    -- Get habit configuration
    SELECT uh.tracking_type, uh.period, uh.target_count, uh.selected_days, uh.start_date
    INTO habit_config
    FROM public.user_habits uh
    WHERE uh.id = p_user_habit_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    check_date := p_as_of_date;
    
    -- Calculate streak based on tracking type
    WHILE check_date >= habit_config.start_date LOOP
        target_met := false;
        
        CASE habit_config.tracking_type
            WHEN 'DAILY' THEN
                -- Check if event exists for this day
                SELECT EXISTS (
                    SELECT 1 FROM public.habit_events he
                    WHERE he.user_habit_id = p_user_habit_id
                    AND DATE(he.occurred_at) = check_date
                ) INTO target_met;
                
                check_date := check_date - INTERVAL '1 day';
                
            WHEN 'N_PER_PERIOD' THEN
                -- Calculate period boundaries
                IF habit_config.period = 'WEEK' THEN
                    period_start := check_date - (EXTRACT(DOW FROM check_date))::INTEGER;
                    period_end := period_start + INTERVAL '6 days';
                ELSE -- MONTH
                    period_start := DATE_TRUNC('month', check_date);
                    period_end := (period_start + INTERVAL '1 month - 1 day')::DATE;
                END IF;
                
                -- Count events in period
                SELECT COUNT(*)
                INTO events_in_period
                FROM public.habit_events he
                WHERE he.user_habit_id = p_user_habit_id
                AND DATE(he.occurred_at) BETWEEN period_start AND period_end;
                
                target_met := events_in_period >= habit_config.target_count;
                
                -- Move to previous period
                IF habit_config.period = 'WEEK' THEN
                    check_date := period_start - INTERVAL '1 day';
                ELSE
                    check_date := period_start - INTERVAL '1 day';
                END IF;
                
            WHEN 'SELECTED_DAYS' THEN
                -- Check if today is a selected day and has event
                IF EXTRACT(DOW FROM check_date) = ANY(habit_config.selected_days) THEN
                    SELECT EXISTS (
                        SELECT 1 FROM public.habit_events he
                        WHERE he.user_habit_id = p_user_habit_id
                        AND DATE(he.occurred_at) = check_date
                    ) INTO target_met;
                ELSE
                    -- Skip non-selected days
                    target_met := true;
                END IF;
                
                check_date := check_date - INTERVAL '1 day';
        END CASE;
        
        IF target_met THEN
            current_streak := current_streak + 1;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    
    RETURN current_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get weekly summary for user habits
CREATE OR REPLACE FUNCTION public.get_weekly_habit_summary(
    p_user_id UUID,
    p_week_start DATE DEFAULT (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER)
) RETURNS TABLE(
    habit_name TEXT,
    target_description TEXT,
    completed_count INTEGER,
    target_count INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.name,
        CASE uh.tracking_type
            WHEN 'DAILY' THEN '7 times this week'
            WHEN 'N_PER_PERIOD' THEN 
                CASE uh.period
                    WHEN 'WEEK' THEN uh.target_count || ' times this week'
                    WHEN 'MONTH' THEN uh.target_count || ' times this month'
                END
            WHEN 'SELECTED_DAYS' THEN array_length(uh.selected_days, 1) || ' selected days'
        END,
        (
            SELECT COUNT(*)::INTEGER
            FROM public.habit_events he
            WHERE he.user_habit_id = uh.id
            AND DATE(he.occurred_at) BETWEEN p_week_start AND p_week_start + INTERVAL '6 days'
        ),
        CASE uh.tracking_type
            WHEN 'DAILY' THEN 7
            WHEN 'N_PER_PERIOD' THEN 
                CASE uh.period
                    WHEN 'WEEK' THEN uh.target_count
                    WHEN 'MONTH' THEN uh.target_count
                END
            WHEN 'SELECTED_DAYS' THEN array_length(uh.selected_days, 1)
        END,
        ROUND(
            (SELECT COUNT(*)::NUMERIC
             FROM public.habit_events he
             WHERE he.user_habit_id = uh.id
             AND DATE(he.occurred_at) BETWEEN p_week_start AND p_week_start + INTERVAL '6 days'
            ) / CASE uh.tracking_type
                WHEN 'DAILY' THEN 7
                WHEN 'N_PER_PERIOD' THEN 
                    CASE uh.period
                        WHEN 'WEEK' THEN uh.target_count
                        WHEN 'MONTH' THEN uh.target_count
                    END
                WHEN 'SELECTED_DAYS' THEN array_length(uh.selected_days, 1)
            END * 100, 1
        )
    FROM public.user_habits uh
    JOIN public.habits h ON h.id = uh.habit_id
    WHERE uh.user_id = p_user_id
    AND uh.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;