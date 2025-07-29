-- Atualizar a tabela cycles para alinhar com o modelo SQLAlchemy
ALTER TABLE cycles ADD COLUMN duration INTEGER;
ALTER TABLE cycles ADD COLUMN phase TEXT;
ALTER TABLE cycles ADD COLUMN completed BOOLEAN DEFAULT 0;
ALTER TABLE cycles ADD COLUMN interrupted BOOLEAN DEFAULT 0;
ALTER TABLE cycles ADD COLUMN git_commit TEXT;
ALTER TABLE cycles ADD COLUMN git_files TEXT;
ALTER TABLE cycles ADD COLUMN start_time DATETIME;
ALTER TABLE cycles ADD COLUMN end_time DATETIME;

-- Renomear colunas existentes para manter compatibilidade
ALTER TABLE cycles RENAME COLUMN duration_minutes TO planned_duration_minutes;
ALTER TABLE cycles RENAME COLUMN type TO cycle_type;
ALTER TABLE cycles RENAME COLUMN is_completed TO is_completed_old;

-- Atualizar dados existentes
UPDATE cycles SET 
  duration = planned_duration_minutes,
  phase = CASE 
    WHEN cycle_type = 'focus' THEN 'focus'
    WHEN cycle_type = 'short_break' THEN 'shortBreak'
    WHEN cycle_type = 'long_break' THEN 'longBreak'
    ELSE 'focus'
  END,
  completed = is_completed_old,
  start_time = started_at,
  end_time = completed_at;

-- Remover colunas antigas
ALTER TABLE cycles DROP COLUMN cycle_type;
ALTER TABLE cycles DROP COLUMN is_completed_old; 