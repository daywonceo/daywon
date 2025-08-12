-- Create weekly_summaries and meal_plans tables with RLS, triggers, and indexes (idempotent)

-- 1) weekly_summaries
CREATE TABLE IF NOT EXISTS public.weekly_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  summary_text TEXT NOT NULL,
  metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT weekly_summaries_user_week_unique UNIQUE (user_id, week_start)
);

ALTER TABLE public.weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Policies (create only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='weekly_summaries' AND policyname='users_select_own_weekly_summaries'
  ) THEN
    CREATE POLICY users_select_own_weekly_summaries
    ON public.weekly_summaries
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='weekly_summaries' AND policyname='users_insert_own_weekly_summaries'
  ) THEN
    CREATE POLICY users_insert_own_weekly_summaries
    ON public.weekly_summaries
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='weekly_summaries' AND policyname='users_update_own_weekly_summaries'
  ) THEN
    CREATE POLICY users_update_own_weekly_summaries
    ON public.weekly_summaries
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='weekly_summaries' AND policyname='users_delete_own_weekly_summaries'
  ) THEN
    CREATE POLICY users_delete_own_weekly_summaries
    ON public.weekly_summaries
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_week ON public.weekly_summaries (user_id, week_start DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_weekly_summaries_updated_at'
  ) THEN
    CREATE TRIGGER trg_weekly_summaries_updated_at
    BEFORE UPDATE ON public.weekly_summaries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) meal_plans
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT,
  plan_start DATE NOT NULL,
  plan_end DATE NOT NULL,
  goals JSONB,
  preferences JSONB,
  total_daily_targets JSONB,
  meals JSONB NOT NULL,
  shopping_list JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='users_select_own_meal_plans'
  ) THEN
    CREATE POLICY users_select_own_meal_plans
    ON public.meal_plans
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='users_insert_own_meal_plans'
  ) THEN
    CREATE POLICY users_insert_own_meal_plans
    ON public.meal_plans
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='users_update_own_meal_plans'
  ) THEN
    CREATE POLICY users_update_own_meal_plans
    ON public.meal_plans
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='meal_plans' AND policyname='users_delete_own_meal_plans'
  ) THEN
    CREATE POLICY users_delete_own_meal_plans
    ON public.meal_plans
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_start ON public.meal_plans (user_id, plan_start DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_meal_plans_updated_at'
  ) THEN
    CREATE TRIGGER trg_meal_plans_updated_at
    BEFORE UPDATE ON public.meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
