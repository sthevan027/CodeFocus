# 🗄️ Banco de Dados CodeFocus

Documentação completa do banco de dados do projeto CodeFocus.

## 📋 Visão Geral

O banco de dados do CodeFocus é baseado em **PostgreSQL** e utiliza **SQLAlchemy** como ORM. A estrutura foi projetada para suportar todas as funcionalidades do aplicativo de produtividade.

## 🏗️ Arquitetura

### Tecnologias Utilizadas
- **PostgreSQL 15+** - Banco de dados principal
- **SQLAlchemy 2.0** - ORM para Python
- **Alembic** - Sistema de migrações
- **FastAPI** - Framework web
- **Pydantic** - Validação de dados

### Estrutura do Banco

```
codefocus_db/
├── users                    # Usuários do sistema
├── cycles                   # Ciclos Pomodoro
├── user_settings           # Configurações dos usuários
└── reports                 # Relatórios gerados
```

## 📊 Modelos de Dados

### 1. Users (Usuários)

**Tabela**: `users`

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | INTEGER | Chave primária | PRIMARY KEY, AUTO_INCREMENT |
| `email` | VARCHAR | Email do usuário | UNIQUE, NOT NULL |
| `username` | VARCHAR | Nome de usuário | UNIQUE, NULLABLE |
| `full_name` | VARCHAR | Nome completo | NULLABLE |
| `hashed_password` | VARCHAR | Senha criptografada | NULLABLE (OAuth) |
| `avatar_url` | VARCHAR | URL do avatar | NULLABLE |
| `provider` | VARCHAR | Provedor de auth | DEFAULT 'email' |
| `provider_id` | VARCHAR | ID do provedor OAuth | NULLABLE |
| `is_active` | BOOLEAN | Status ativo | DEFAULT TRUE |
| `is_verified` | BOOLEAN | Email verificado | DEFAULT FALSE |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Data de atualização | ON UPDATE |
| `last_login` | TIMESTAMP | Último login | NULLABLE |

**Índices**:
- `idx_users_email` (email)
- `idx_users_username` (username)
- `idx_users_provider_id` (provider_id)

### 2. Cycles (Ciclos Pomodoro)

**Tabela**: `cycles`

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | INTEGER | Chave primária | PRIMARY KEY, AUTO_INCREMENT |
| `user_id` | INTEGER | Referência ao usuário | FOREIGN KEY |
| `name` | VARCHAR | Nome do ciclo | NOT NULL |
| `duration` | INTEGER | Duração em minutos | NOT NULL |
| `phase` | VARCHAR | Fase do ciclo | NOT NULL |
| `completed` | BOOLEAN | Ciclo completado | DEFAULT FALSE |
| `interrupted` | BOOLEAN | Ciclo interrompido | DEFAULT FALSE |
| `git_commit` | VARCHAR | Mensagem do commit | NULLABLE |
| `git_files` | TEXT | Arquivos modificados (JSON) | NULLABLE |
| `start_time` | TIMESTAMP | Hora de início | DEFAULT NOW() |
| `end_time` | TIMESTAMP | Hora de fim | NULLABLE |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT NOW() |

**Índices**:
- `idx_cycles_user_id` (user_id)
- `idx_cycles_start_time` (start_time)
- `idx_cycles_phase` (phase)

**Relacionamentos**:
- `user_id` → `users.id` (Muitos para Um)

### 3. UserSettings (Configurações)

**Tabela**: `user_settings`

| Campo | Tipo | Descrição | Valor Padrão |
|-------|------|-----------|--------------|
| `id` | INTEGER | Chave primária | AUTO_INCREMENT |
| `user_id` | INTEGER | Referência ao usuário | FOREIGN KEY |
| `focus_time` | INTEGER | Tempo de foco (min) | 25 |
| `short_break_time` | INTEGER | Pausa curta (min) | 5 |
| `long_break_time` | INTEGER | Pausa longa (min) | 15 |
| `auto_start_breaks` | BOOLEAN | Auto-iniciar pausas | FALSE |
| `auto_start_pomodoros` | BOOLEAN | Auto-iniciar pomodoros | FALSE |
| `sound_enabled` | BOOLEAN | Sons habilitados | TRUE |
| `notifications_enabled` | BOOLEAN | Notificações habilitadas | TRUE |
| `auto_commit` | BOOLEAN | Commit automático | FALSE |
| `auto_push` | BOOLEAN | Push automático | FALSE |
| `git_commit_template` | VARCHAR | Template de commit | "feat: {cycle_name} ({duration}min)" |
| `theme` | VARCHAR | Tema da interface | "dark" |
| `accent_color` | VARCHAR | Cor de destaque | "#3B82F6" |
| `notification_sound` | VARCHAR | Som de notificação | "default" |
| `notification_volume` | INTEGER | Volume (0-100) | 50 |
| `auto_generate_reports` | BOOLEAN | Gerar relatórios auto | TRUE |
| `report_format` | VARCHAR | Formato dos relatórios | "txt" |
| `oauth_preferences` | JSON | Preferências OAuth | {} |

**Índices**:
- `idx_user_settings_user_id` (user_id) UNIQUE

**Relacionamentos**:
- `user_id` → `users.id` (Um para Um)

### 4. Reports (Relatórios)

**Tabela**: `reports`

| Campo | Tipo | Descrição | Restrições |
|-------|------|-----------|------------|
| `id` | INTEGER | Chave primária | PRIMARY KEY, AUTO_INCREMENT |
| `user_id` | INTEGER | Referência ao usuário | FOREIGN KEY |
| `report_type` | VARCHAR | Tipo de relatório | NOT NULL |
| `report_date` | TIMESTAMP | Data do relatório | NOT NULL |
| `total_cycles` | INTEGER | Total de ciclos | DEFAULT 0 |
| `completed_cycles` | INTEGER | Ciclos completados | DEFAULT 0 |
| `interrupted_cycles` | INTEGER | Ciclos interrompidos | DEFAULT 0 |
| `total_focus_time` | INTEGER | Tempo total foco (min) | DEFAULT 0 |
| `total_break_time` | INTEGER | Tempo total pausa (min) | DEFAULT 0 |
| `productivity_score` | INTEGER | Score produtividade (0-100) | DEFAULT 0 |
| `cycles_data` | JSON | Dados dos ciclos | DEFAULT [] |
| `include_git_data` | BOOLEAN | Incluir dados Git | DEFAULT TRUE |
| `include_statistics` | BOOLEAN | Incluir estatísticas | DEFAULT TRUE |
| `include_charts` | BOOLEAN | Incluir gráficos | DEFAULT TRUE |
| `file_path` | VARCHAR | Caminho do arquivo | NULLABLE |
| `file_size` | INTEGER | Tamanho do arquivo | NULLABLE |
| `created_at` | TIMESTAMP | Data de criação | DEFAULT NOW() |

**Índices**:
- `idx_reports_user_id` (user_id)
- `idx_reports_report_date` (report_date)
- `idx_reports_report_type` (report_type)

**Relacionamentos**:
- `user_id` → `users.id` (Muitos para Um)

## 🔐 Segurança

### Criptografia de Senhas
- **Algoritmo**: bcrypt
- **Salt**: Automático
- **Rounds**: 12 (configurável)

### Tokens JWT
- **Algoritmo**: HS256
- **Duração**: 30 minutos (configurável)
- **Payload**: ID do usuário

### Validação de Dados
- **Pydantic**: Validação de schemas
- **SQLAlchemy**: Proteção contra SQL Injection
- **CORS**: Configurado para frontend

## 📈 Estatísticas e Métricas

### Cálculo de Produtividade
```python
# Score de produtividade (0-100)
completion_rate = completed_cycles / total_cycles
focus_efficiency = total_focus_time / (total_focus_time + total_break_time)
productivity_score = (completion_rate * 0.6 + focus_efficiency * 0.4) * 100
```

### Métricas Disponíveis
- **Tempo total de foco**
- **Tempo total de pausa**
- **Taxa de conclusão de ciclos**
- **Eficiência de foco**
- **Score de produtividade**
- **Padrões de trabalho**

## 🚀 Instalação e Configuração

### 1. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Baixar do site oficial
```

### 2. Criar Banco de Dados
```bash
# Conectar como superusuário
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE codefocus_db;
CREATE USER codefocus_user WITH PASSWORD 'codefocus_password';
GRANT ALL PRIVILEGES ON DATABASE codefocus_db TO codefocus_user;
\q
```

### 3. Configurar Backend
```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Executar migrações
alembic upgrade head
```

### 4. Usando Docker
```bash
# Executar com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f backend
```

## 🔧 Comandos Úteis

### Migrações
```bash
# Criar nova migração
alembic revision --autogenerate -m "descrição"

# Executar migrações
alembic upgrade head

# Reverter migração
alembic downgrade -1

# Verificar status
alembic current
alembic history
```

### Backup e Restore
```bash
# Backup
pg_dump -U codefocus_user -d codefocus_db > backup.sql

# Restore
psql -U codefocus_user -d codefocus_db < backup.sql
```

### Consultas Úteis
```sql
-- Usuários mais produtivos
SELECT 
    u.full_name,
    COUNT(c.id) as total_cycles,
    AVG(c.duration) as avg_duration,
    SUM(CASE WHEN c.completed THEN 1 ELSE 0 END) as completed_cycles
FROM users u
LEFT JOIN cycles c ON u.id = c.user_id
WHERE c.phase = 'focus'
GROUP BY u.id, u.full_name
ORDER BY completed_cycles DESC;

-- Estatísticas diárias
SELECT 
    DATE(c.start_time) as date,
    COUNT(*) as total_cycles,
    SUM(CASE WHEN c.completed THEN 1 ELSE 0 END) as completed_cycles,
    SUM(c.duration) as total_minutes
FROM cycles c
WHERE c.user_id = 1
GROUP BY DATE(c.start_time)
ORDER BY date DESC;
```

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:8000/health
```

### Métricas de Performance
- **Tempo de resposta da API**
- **Taxa de erros**
- **Uso de memória**
- **Conexões ativas no banco**

### Logs
- **Aplicação**: uvicorn logs
- **Banco**: PostgreSQL logs
- **Migrações**: Alembic logs

## 🛠️ Manutenção

### Limpeza de Dados
```sql
-- Remover ciclos antigos (mais de 1 ano)
DELETE FROM cycles 
WHERE start_time < NOW() - INTERVAL '1 year';

-- Remover relatórios antigos
DELETE FROM reports 
WHERE created_at < NOW() - INTERVAL '6 months';
```

### Otimização
```sql
-- Analisar tabelas
ANALYZE users;
ANALYZE cycles;
ANALYZE user_settings;
ANALYZE reports;

-- Reindexar
REINDEX DATABASE codefocus_db;
```

## 🔄 Backup e Recuperação

### Backup Automático
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U codefocus_user -d codefocus_db > backup_$DATE.sql
gzip backup_$DATE.sql
```

### Cron Job
```bash
# Adicionar ao crontab
0 2 * * * /path/to/backup.sh
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verificar se PostgreSQL está rodando
   - Verificar credenciais no .env
   - Verificar se o banco existe

2. **Erro de migração**
   - Verificar se Alembic está configurado
   - Verificar se o banco está acessível
   - Verificar logs do Alembic

3. **Erro de autenticação**
   - Verificar se o token JWT é válido
   - Verificar se o usuário está ativo
   - Verificar se o token não expirou

### Logs de Debug
```python
# Habilitar logs SQL
import logging
logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)
```

## 📚 Recursos Adicionais

- **Documentação FastAPI**: https://fastapi.tiangolo.com/
- **Documentação SQLAlchemy**: https://docs.sqlalchemy.org/
- **Documentação Alembic**: https://alembic.sqlalchemy.org/
- **Documentação PostgreSQL**: https://www.postgresql.org/docs/

---

*Esta documentação é atualizada conforme o projeto evolui.* 