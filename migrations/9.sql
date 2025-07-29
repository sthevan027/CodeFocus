-- Adicionar índices para melhorar performance
CREATE INDEX idx_cycles_user_id ON cycles(user_id);
CREATE INDEX idx_cycles_created_at ON cycles(created_at);
CREATE INDEX idx_cycles_started_at ON cycles(started_at);

CREATE INDEX idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX idx_daily_reports_report_date ON daily_reports(report_date);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_report_date ON reports(report_date);

CREATE INDEX idx_spotify_tokens_user_id ON spotify_tokens(user_id);
CREATE INDEX idx_spotify_tokens_expires_at ON spotify_tokens(expires_at);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider_id ON users(provider_id);
CREATE INDEX idx_users_created_at ON users(created_at); 