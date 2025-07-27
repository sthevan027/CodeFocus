# CodeFocus

Sistema de produtividade para desenvolvedores com foco em gestão de tempo e organização de tarefas.

## 🎯 Sobre o Projeto

CodeFocus é uma aplicação desktop completa que combina técnicas de produtividade (Pomodoro) com integração Git para desenvolvedores. O sistema oferece:

- ⏱️ **Timer Pomodoro** com ciclos personalizáveis
- 🔄 **Integração Git** para commits automáticos
- 📊 **Relatórios e estatísticas** de produtividade
- 🎨 **Interface moderna** com tema escuro/claro
- 🔐 **Autenticação segura** com JWT e OAuth
- 💾 **Banco de dados SQLite** para persistência local

## 🚀 Tecnologias

### Frontend
- **React** - Interface do usuário
- **Tailwind CSS** - Estilização
- **Context API** - Gerenciamento de estado

### Backend
- **Python 3.11+** - Linguagem do servidor
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy 2.0** - ORM para banco de dados
- **SQLite** - Banco de dados local (codefocus.db)
- **JWT** - Autenticação segura
- **bcrypt** - Criptografia de senhas
- **Alembic** - Migrações de banco de dados
- **Pydantic** - Validação de dados
- **httpx** - Cliente HTTP para OAuth

## 📁 Estrutura do Projeto

```
CodeFocus-main/
├── src/                    # Frontend React
│   ├── components/        # Componentes React
│   ├── context/          # Context API (Auth, Timer, Theme)
│   ├── services/         # Serviços de API
│   ├── utils/            # Utilitários (Git, Export, Notifications)
│   └── config/           # Configurações OAuth
├── backend/              # Backend FastAPI
│   ├── app/
│   │   ├── api/         # Endpoints da API
│   │   ├── auth/        # Autenticação e segurança
│   │   ├── models/      # Modelos SQLAlchemy
│   │   ├── schemas/     # Schemas Pydantic
│   │   ├── services/    # Serviços OAuth
│   │   ├── config.py    # Configurações
│   │   ├── database.py  # Configuração do banco
│   │   └── main.py      # Aplicação principal
│   ├── alembic/         # Migrações de banco
│   ├── requirements.txt # Dependências Python
│   └── codefocus.db     # Banco SQLite
├── docs/                # Documentação completa
├── public/              # Arquivos estáticos
└── package.json         # Dependências Node.js
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **Users** - Usuários do Sistema
```sql
- id: INTEGER (Primary Key)
- email: VARCHAR (Unique)
- username: VARCHAR (Unique)
- hashed_password: VARCHAR
- full_name: VARCHAR
- is_active: BOOLEAN
- created_at: DATETIME
- updated_at: DATETIME
```

#### 2. **Cycles** - Ciclos Pomodoro
```sql
- id: INTEGER (Primary Key)
- user_id: INTEGER (Foreign Key)
- start_time: DATETIME
- end_time: DATETIME
- duration: INTEGER (segundos)
- cycle_type: VARCHAR (work/break)
- status: VARCHAR (completed/interrupted)
- notes: TEXT
- created_at: DATETIME
```

#### 3. **UserSettings** - Configurações do Usuário
```sql
- id: INTEGER (Primary Key)
- user_id: INTEGER (Foreign Key)
- work_duration: INTEGER (padrão: 1500s)
- break_duration: INTEGER (padrão: 300s)
- long_break_duration: INTEGER (padrão: 900s)
- auto_start_breaks: BOOLEAN
- auto_start_pomodoros: BOOLEAN
- sound_enabled: BOOLEAN
- notifications_enabled: BOOLEAN
- theme: VARCHAR (light/dark)
- created_at: DATETIME
- updated_at: DATETIME
```

#### 4. **Reports** - Relatórios de Produtividade
```sql
- id: INTEGER (Primary Key)
- user_id: INTEGER (Foreign Key)
- report_date: DATE
- total_work_time: INTEGER (segundos)
- total_breaks: INTEGER
- completed_cycles: INTEGER
- interrupted_cycles: INTEGER
- productivity_score: FLOAT
- notes: TEXT
- created_at: DATETIME
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- **Python 3.11+**
- **Node.js 16+**
- **Git**

### 1. Backend (Python)

```bash
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual (opcional)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

# Instalar dependências Python
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp env.example .env
# Editar .env com suas configurações

# Iniciar o servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend (React)

```bash
# Instalar dependências Node.js
npm install

# Iniciar servidor de desenvolvimento
npm start
```

### 3. Banco de Dados

O banco SQLite será criado automaticamente na primeira execução:
```bash
# O arquivo codefocus.db será criado em backend/
```

## 🔧 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastrar usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/oauth/google` - Login com Google
- `POST /api/auth/oauth/github` - Login com GitHub
- `GET /api/auth/me` - Dados do usuário atual
- `POST /api/auth/refresh` - Renovar token

### Ciclos Pomodoro
- `GET /api/cycles/` - Listar ciclos do usuário
- `POST /api/cycles/` - Criar novo ciclo
- `GET /api/cycles/{id}` - Obter ciclo específico
- `PUT /api/cycles/{id}` - Atualizar ciclo
- `DELETE /api/cycles/{id}` - Deletar ciclo
- `GET /api/cycles/stats` - Estatísticas dos ciclos

### Configurações
- `GET /api/settings/` - Obter configurações do usuário
- `PUT /api/settings/` - Atualizar configurações
- `POST /api/settings/` - Criar configurações

### Relatórios
- `GET /api/reports/` - Listar relatórios
- `POST /api/reports/` - Criar relatório
- `GET /api/reports/{id}` - Obter relatório específico
- `POST /api/reports/generate` - Gerar relatório automático

## 📚 Documentação

### API e Desenvolvimento
- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **ReDoc:** http://localhost:8000/redoc

### Documentação Completa
- **📋 [PROJETO_ESCOPO.md](docs/PROJETO_ESCOPO.md)** - Escopo e funcionalidades
- **🔧 [DOCUMENTACAO_TECNICA.md](docs/DOCUMENTACAO_TECNICA.md)** - Arquitetura técnica
- **⚙️ [DOCUMENTACAO_BACKEND.md](docs/DOCUMENTACAO_BACKEND.md)** - Backend e API
- **🎨 [DOCUMENTACAO_FRONTEND.md](docs/DOCUMENTACAO_FRONTEND.md)** - Frontend e UI
- **🗄️ [BANCO_DE_DADOS.md](BANCO_DE_DADOS.md)** - Estrutura do banco de dados
- **🚀 [SETUP_FINAL.md](SETUP_FINAL.md)** - Guia de instalação e execução

### Configuração OAuth
- **🔐 [OAUTH_SETUP.md](docs/OAUTH_SETUP.md)** - Configuração Google/GitHub
- **🛠️ [GOOGLE_OAUTH_FIX.md](docs/GOOGLE_OAUTH_FIX.md)** - Solução de problemas OAuth

## 🔐 Funcionalidades

### Autenticação
- ✅ Login com e-mail/senha
- ✅ Registro de usuários
- ✅ Login com Google OAuth
- ✅ Login com GitHub OAuth
- ✅ JWT para sessões seguras
- ✅ Senhas criptografadas com bcrypt
- ✅ Refresh tokens

### Timer Pomodoro
- ✅ Ciclos de trabalho personalizáveis
- ✅ Pausas curtas e longas
- ✅ Auto-start de ciclos
- ✅ Notificações sonoras
- ✅ Histórico de ciclos
- ✅ Estatísticas de produtividade

### Banco de Dados
- ✅ 4 tabelas principais (Users, Cycles, Settings, Reports)
- ✅ Relacionamentos SQLAlchemy
- ✅ Migrações com Alembic
- ✅ Validação com Pydantic
- ✅ Persistência SQLite local

### Frontend
- ✅ Interface React moderna
- ✅ Tema escuro/claro
- ✅ Context API para estado
- ✅ Integração com backend
- ✅ Responsivo e acessível

## 🚀 Como Usar

1. **Inicie o backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Inicie o frontend:**
   ```bash
   npm start
   ```

3. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

4. **Teste as funcionalidades:**
   - Cadastre uma conta nova
   - Configure suas preferências de timer
   - Inicie um ciclo Pomodoro
   - Visualize relatórios de produtividade

## 🔧 Desenvolvimento

### Backend
- **Porta:** 8000
- **Banco:** SQLite (codefocus.db)
- **Hot Reload:** Ativado
- **CORS:** Configurado para frontend

### Frontend
- **Porta:** 3000
- **Hot Reload:** Ativado
- **API:** Conectado ao backend na porta 8000
- **Electron:** Configurado para desktop

### Variáveis de Ambiente
```bash
# Backend (.env)
DATABASE_URL=sqlite:///./codefocus.db
SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GITHUB_CLIENT_ID=your-github-client-id
```

## 📝 Próximos Passos

- [ ] Implementar integração Git completa
- [ ] Adicionar sistema de notificações desktop
- [ ] Criar dashboard avançado de produtividade
- [ ] Implementar exportação de relatórios (PDF/Excel)
- [ ] Adicionar sincronização com calendário
- [ ] Implementar modo offline
- [ ] Adicionar suporte a múltiplos projetos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.