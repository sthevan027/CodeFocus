-- Adds cycles_before_long_break to user_settings (v1)
ALTER TABLE IF EXISTS public.user_settings
  ADD COLUMN IF NOT EXISTS cycles_before_long_break INTEGER DEFAULT 4;

