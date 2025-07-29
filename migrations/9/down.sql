-- Remover índices adicionados
DROP INDEX idx_cycles_user_id;
DROP INDEX idx_cycles_created_at;
DROP INDEX idx_cycles_started_at;

DROP INDEX idx_daily_reports_user_id;
DROP INDEX idx_daily_reports_report_date;

DROP INDEX idx_reports_user_id;
DROP INDEX idx_reports_report_date;

DROP INDEX idx_spotify_tokens_user_id;
DROP INDEX idx_spotify_tokens_expires_at;

DROP INDEX idx_users_email;
DROP INDEX idx_users_provider_id;
DROP INDEX idx_users_created_at; 