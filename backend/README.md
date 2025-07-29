# 🚀 Backend CodeFocus

Backend da aplicação CodeFocus - Produtividade Dev no Ritmo do Código

## 📋 Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados local
- **Alembic** - Migrações de banco de dados
- **JWT** - Autenticação com tokens
- **OAuth** - Integração com Google e GitHub

## 🏗️ Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação principal
│   ├── config.py            # Configurações
│   ├── database.py          # Configuração do banco
│   ├── models/              # Modelos do banco
│   │   ├── __init__.py
│   │   ├── user.py          # Modelo de usuário
│   │   ├── cycle.py         # Modelo de ciclos
│   │   ├── settings.py      # Modelo de configurações
│   │   └── report.py        # Modelo de relatórios
│   ├── schemas/             # Schemas Pydantic
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── cycle.py
│   │   ├── settings.py
│   │   └── report.py
│   ├── auth/                # Autenticação
│   │   ├── __init__.py
│   │   ├── security.py      # Funções de segurança
│   │   └── dependencies.py  # Dependências de auth
│   ├── services/            # Serviços
│   │   ├── __init__.py
│   │   └── oauth.py         # Serviço OAuth
│   └── api/                 # Rotas da API
│       ├── __init__.py
│       ├── auth.py          # Rotas de autenticação
│       ├── cycles.py        # Rotas de ciclos
│       ├── settings.py      # Rotas de configurações
│       └── reports.py       # Rotas de relatórios
├── alembic/                 # Migrações
├── requirements.txt         # Dependências Python
├── env.example             # Exemplo de variáveis
└── README.md               # Esta documentação
```

## 🗄️ Modelos do Banco de Dados

### Users
- **id**: Chave primária
- **email**: Email único do usuário
- **username**: Nome de usuário opcional
- **full_name**: Nome completo
- **hashed_password**: Senha criptografada
- **avatar_url**: URL do avatar
- **provider**: Provedor de autenticação (email, google, github, anonymous)
- **provider_id**: ID do provedor OAuth
- **is_active**: Status ativo/inativo
- **is_verified**: Email verificado
- **created_at**: Data de criação
- **updated_at**: Data de atualização
- **last_login**: Último login

### Cycles
- **id**: Chave primária
- **user_id**: Referência ao usuário
- **name**: Nome do ciclo
- **duration**: Duração em minutos
- **phase**: Fase (focus, shortBreak, longBreak)
- **completed**: Ciclo completado
- **interrupted**: Ciclo interrompido
- **git_commit**: Mensagem do commit
- **git_files**: Arquivos modificados (JSON)
- **start_time**: Hora de início
- **end_time**: Hora de fim
- **created_at**: Data de criação

### UserSettings
- **id**: Chave primária
- **user_id**: Referência ao usuário
- **focus_time**: Tempo de foco (minutos)
- **short_break_time**: Tempo de pausa curta (minutos)
- **long_break_time**: Tempo de pausa longa (minutos)
- **auto_start_breaks**: Auto-iniciar pausas
- **auto_start_pomodoros**: Auto-iniciar pomodoros
- **sound_enabled**: Sons habilitados
- **notifications_enabled**: Notificações habilitadas
- **auto_commit**: Commit automático
- **auto_push**: Push automático
- **git_commit_template**: Template de commit
- **theme**: Tema (dark, light, auto)
- **accent_color**: Cor de destaque
- **notification_sound**: Som de notificação
- **notification_volume**: Volume das notificações
- **auto_generate_reports**: Gerar relatórios automaticamente
- **report_format**: Formato dos relatórios
- **oauth_preferences**: Preferências OAuth (JSON)

### Reports
- **id**: Chave primária
- **user_id**: Referência ao usuário
- **report_type**: Tipo de relatório (daily, weekly, monthly, custom)
- **report_date**: Data do relatório
- **total_cycles**: Total de ciclos
- **completed_cycles**: Ciclos completados
- **interrupted_cycles**: Ciclos interrompidos
- **total_focus_time**: Tempo total de foco (minutos)
- **total_break_time**: Tempo total de pausa (minutos)
- **productivity_score**: Score de produtividade (0-100)
- **cycles_data**: Dados dos ciclos (JSON)
- **include_git_data**: Incluir dados Git
- **include_statistics**: Incluir estatísticas
- **include_charts**: Incluir gráficos
- **file_path**: Caminho do arquivo gerado
- **file_size**: Tamanho do arquivo
- **created_at**: Data de criação

## 🔐 Autenticação

### Métodos Suportados
1. **Email/Senha** - Registro e login tradicional
2. **Google OAuth** - Login com conta Google
3. **GitHub OAuth** - Login com conta GitHub
4. **Anônimo** - Para desenvolvimento

### JWT Tokens
- **Duração**: 30 minutos
- **Algoritmo**: HS256
- **Payload**: ID do usuário

## 📡 Endpoints da API

### Autenticação (`/api/auth`)
- `POST /register` - Registrar usuário
- `POST /login` - Login com email/senha
- `POST /google/callback` - Callback Google OAuth
- `POST /github/callback` - Callback GitHub OAuth
- `GET /me` - Obter usuário atual

### Ciclos (`/api/cycles`)
- `POST /` - Criar ciclo
- `GET /` - Listar ciclos
- `GET /{cycle_id}` - Obter ciclo específico
- `PUT /{cycle_id}` - Atualizar ciclo
- `DELETE /{cycle_id}` - Deletar ciclo
- `GET /stats/overview` - Estatísticas gerais
- `GET /stats/daily` - Estatísticas diárias

### Configurações (`/api/settings`)
- `GET /` - Obter configurações
- `PUT /` - Atualizar configurações
- `POST /reset` - Resetar configurações

### Relatórios (`/api/reports`)
- `POST /generate` - Gerar relatório
- `GET /` - Listar relatórios
- `GET /{report_id}` - Obter relatório específico
- `DELETE /{report_id}` - Deletar relatório

## 🚀 Instalação e Configuração

### 1. Instalar Dependências
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente
```bash
cp env.example .env
# Editar .env com suas configurações
```

### 3. Configurar Banco de Dados
```bash
# Executar migrações (SQLite será criado automaticamente)
alembic upgrade head
```

### 4. Executar o Servidor
```bash
# Desenvolvimento
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 Documentação da API

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔧 Comandos Úteis

### Migrações
```bash
# Criar nova migração
alembic revision --autogenerate -m "descrição"

# Executar migrações
alembic upgrade head

# Reverter migração
alembic downgrade -1
```

### Desenvolvimento
```bash
# Verificar saúde da API
curl http://localhost:8000/health

# Testar autenticação
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=password"
```

## 🛡️ Segurança

- **Senhas**: Criptografadas com bcrypt
- **Tokens**: JWT com expiração
- **CORS**: Configurado para frontend
- **Validação**: Pydantic schemas
- **SQL Injection**: Protegido pelo SQLAlchemy

## 📊 Monitoramento

- **Health Check**: `/health`
- **Logs**: Configurados no Alembic
- **Métricas**: Endpoints de estatísticas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. 