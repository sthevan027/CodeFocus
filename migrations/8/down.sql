-- Reverter as alterações da tabela cycles
ALTER TABLE cycles ADD COLUMN type TEXT;
ALTER TABLE cycles ADD COLUMN is_completed BOOLEAN DEFAULT 0;

-- Restaurar dados originais
UPDATE cycles SET 
  type = CASE 
    WHEN phase = 'focus' THEN 'focus'
    WHEN phase = 'shortBreak' THEN 'short_break'
    WHEN phase = 'longBreak' THEN 'long_break'
    ELSE 'focus'
  END,
  is_completed = completed;

-- Remover colunas adicionadas
ALTER TABLE cycles DROP COLUMN duration;
ALTER TABLE cycles DROP COLUMN phase;
ALTER TABLE cycles DROP COLUMN completed;
ALTER TABLE cycles DROP COLUMN interrupted;
ALTER TABLE cycles DROP COLUMN git_commit;
ALTER TABLE cycles DROP COLUMN git_files;
ALTER TABLE cycles DROP COLUMN start_time;
ALTER TABLE cycles DROP COLUMN end_time;

-- Restaurar nomes originais
ALTER TABLE cycles RENAME COLUMN planned_duration_minutes TO duration_minutes; 