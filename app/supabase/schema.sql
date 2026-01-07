-- CodeFocus Database Schema para Supabase
-- Execute este script no SQL Editor do Supabase

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(50) DEFAULT 'email',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_code VARCHAR(6),
    verification_code_expires TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Tabela de Configurações do Usuário
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Configurações do Timer
    focus_time INTEGER DEFAULT 25,
    short_break_time INTEGER DEFAULT 5,
    long_break_time INTEGER DEFAULT 15,
    cycles_before_long_break INTEGER DEFAULT 4,
    
    -- Configurações de Comportamento
    auto_start_breaks BOOLEAN DEFAULT false,
    auto_start_pomodoros BOOLEAN DEFAULT false,
    sound_enabled BOOLEAN DEFAULT true,
    notifications_enabled BOOLEAN DEFAULT true,
    
    -- Configurações de Git
    auto_commit BOOLEAN DEFAULT false,
    auto_push BOOLEAN DEFAULT false,
    git_commit_template VARCHAR(255) DEFAULT 'feat: {cycle_name} ({duration}min)',
    
    -- Configurações de Tema
    theme VARCHAR(50) DEFAULT 'dark',
    accent_color VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Configurações de Notificações
    notification_sound VARCHAR(50) DEFAULT 'default',
    notification_volume INTEGER DEFAULT 50,
    
    -- Configurações de Relatórios
    auto_generate_reports BOOLEAN DEFAULT true,
    report_format VARCHAR(10) DEFAULT 'txt',
    
    -- Configurações OAuth
    oauth_preferences JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Ciclos
CREATE TABLE IF NOT EXISTS cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    duration INTEGER NOT NULL,
    phase VARCHAR(50) NOT NULL, -- focus, shortBreak, longBreak
    completed BOOLEAN DEFAULT false,
    interrupted BOOLEAN DEFAULT false,
    git_commit TEXT,
    git_files TEXT, -- JSON string
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para cycles
CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_cycles_start_time ON cycles(start_time);
CREATE INDEX IF NOT EXISTS idx_cycles_phase ON cycles(phase);

-- Tabela de Relatórios
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    report_type VARCHAR(50) NOT NULL, -- daily, weekly, monthly, custom
    report_date TIMESTAMPTZ NOT NULL,
    
    -- Estatísticas
    total_cycles INTEGER DEFAULT 0,
    completed_cycles INTEGER DEFAULT 0,
    interrupted_cycles INTEGER DEFAULT 0,
    total_focus_time INTEGER DEFAULT 0,
    total_break_time INTEGER DEFAULT 0,
    
    -- Dados detalhados
    cycles_data JSONB DEFAULT '[]',
    productivity_score INTEGER DEFAULT 0,
    
    -- Configurações do relatório
    include_git_data BOOLEAN DEFAULT true,
    include_statistics BOOLEAN DEFAULT true,
    include_charts BOOLEAN DEFAULT true,
    
    -- Arquivo gerado
    file_path TEXT,
    file_size INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para reports
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_date ON reports(report_date);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (usuários só podem ver/editar seus próprios dados)
-- Nota: Você pode usar Supabase Auth para políticas mais avançadas

-- Política para users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Política para user_settings
CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para cycles
CREATE POLICY "Users can view own cycles" ON cycles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cycles" ON cycles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cycles" ON cycles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cycles" ON cycles
    FOR DELETE USING (auth.uid() = user_id);

-- Política para reports
CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON reports
    FOR DELETE USING (auth.uid() = user_id);

