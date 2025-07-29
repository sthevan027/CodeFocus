-- =====================================================
-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO BANCO DE DADOS
-- CodeFocus - Produtividade Dev no Ritmo do Código
-- =====================================================

-- Migração 1: Tabela cycles
CREATE TABLE IF NOT EXISTS cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('focus', 'short_break', 'long_break')),
  duration_minutes INTEGER NOT NULL,
  planned_duration_minutes INTEGER NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT 0,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migração 2: Tabela daily_reports
CREATE TABLE IF NOT EXISTS daily_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_date DATE NOT NULL UNIQUE,
  total_focus_time INTEGER NOT NULL DEFAULT 0,
  completed_cycles INTEGER NOT NULL DEFAULT 0,
  interrupted_cycles INTEGER NOT NULL DEFAULT 0,
  report_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migração 3: Adicionar user_id nas tabelas existentes
ALTER TABLE cycles ADD COLUMN user_id TEXT;
ALTER TABLE daily_reports ADD COLUMN user_id TEXT;

-- Migração 4: Tabela spotify_tokens
CREATE TABLE IF NOT EXISTS spotify_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migração 5: Tabela users
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  username TEXT UNIQUE,
  full_name TEXT,
  hashed_password TEXT,
  avatar_url TEXT,
  provider TEXT DEFAULT 'email',
  provider_id TEXT,
  is_active BOOLEAN DEFAULT 1,
  is_verified BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Migração 6: Tabela user_settings
CREATE TABLE IF NOT EXISTS user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  focus_time INTEGER DEFAULT 25,
  short_break_time INTEGER DEFAULT 5,
  long_break_time INTEGER DEFAULT 15,
  auto_start_breaks BOOLEAN DEFAULT 0,
  auto_start_pomodoros BOOLEAN DEFAULT 0,
  sound_enabled BOOLEAN DEFAULT 1,
  notifications_enabled BOOLEAN DEFAULT 1,
  auto_commit BOOLEAN DEFAULT 0,
  auto_push BOOLEAN DEFAULT 0,
  git_commit_template TEXT DEFAULT 'feat: {cycle_name} ({duration}min)',
  theme TEXT DEFAULT 'dark',
  accent_color TEXT DEFAULT '#3B82F6',
  notification_sound TEXT DEFAULT 'default',
  notification_volume INTEGER DEFAULT 50,
  auto_generate_reports BOOLEAN DEFAULT 1,
  report_format TEXT DEFAULT 'txt',
  oauth_preferences TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migração 7: Tabela reports
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  report_type TEXT NOT NULL,
  report_date DATETIME NOT NULL,
  total_cycles INTEGER DEFAULT 0,
  completed_cycles INTEGER DEFAULT 0,
  interrupted_cycles INTEGER DEFAULT 0,
  total_focus_time INTEGER DEFAULT 0,
  total_break_time INTEGER DEFAULT 0,
  cycles_data TEXT DEFAULT '[]',
  productivity_score INTEGER DEFAULT 0,
  include_git_data BOOLEAN DEFAULT 1,
  include_statistics BOOLEAN DEFAULT 1,
  include_charts BOOLEAN DEFAULT 1,
  file_path TEXT,
  file_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Migração 8: Atualizar tabela cycles para alinhar com SQLAlchemy
ALTER TABLE cycles ADD COLUMN duration INTEGER;
ALTER TABLE cycles ADD COLUMN phase TEXT;
ALTER TABLE cycles ADD COLUMN completed BOOLEAN DEFAULT 0;
ALTER TABLE cycles ADD COLUMN interrupted BOOLEAN DEFAULT 0;
ALTER TABLE cycles ADD COLUMN git_commit TEXT;
ALTER TABLE cycles ADD COLUMN git_files TEXT;
ALTER TABLE cycles ADD COLUMN start_time DATETIME;
ALTER TABLE cycles ADD COLUMN end_time DATETIME;

-- Migração 9: Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_cycles_created_at ON cycles(created_at);
CREATE INDEX IF NOT EXISTS idx_cycles_started_at ON cycles(started_at);

CREATE INDEX IF NOT EXISTS idx_daily_reports_user_id ON daily_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_reports_report_date ON daily_reports(report_date);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);

CREATE INDEX IF NOT EXISTS idx_spotify_tokens_user_id ON spotify_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_tokens_expires_at ON spotify_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider_id ON users(provider_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- =====================================================
-- INSERIR DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir usuário de teste (opcional)
-- INSERT OR IGNORE INTO users (email, username, full_name, provider, is_verified) 
-- VALUES ('admin@codefocus.dev', 'admin', 'Administrador', 'email', 1);

-- =====================================================
-- VERIFICAR ESTRUTURA FINAL
-- =====================================================

-- Listar todas as tabelas criadas
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Verificar estrutura da tabela users
PRAGMA table_info(users);

-- Verificar estrutura da tabela cycles
PRAGMA table_info(cycles);

-- Verificar estrutura da tabela user_settings
PRAGMA table_info(user_settings);

-- Verificar estrutura da tabela reports
PRAGMA table_info(reports);

-- Verificar estrutura da tabela spotify_tokens
PRAGMA table_info(spotify_tokens); 