# CodeFocus 🚀

Sistema de produtividade para desenvolvedores com foco em gestão de tempo e organização de tarefas.

## 🎯 Sobre o Projeto

CodeFocus é uma aplicação web completa que combina técnicas de produtividade (Pomodoro) com integração Git para desenvolvedores. O sistema oferece:

- ⏱️ **Timer Pomodoro** com ciclos personalizáveis
- 🎵 **Integração Spotify** para música ambiente
- 📊 **Dashboard completo** de produtividade
- 🎨 **Interface moderna** com tema escuro
- 🔐 **Autenticação segura** com verificação por email
- 📧 **Sistema de email profissional** com Resend
- 💾 **Persistência local** com localStorage

## 🚀 Tecnologias

### Frontend
- **React** - Interface do usuário
- **Tailwind CSS** - Estilização
- **Context API** - Gerenciamento de estado

### Frontend
- **React** - Interface do usuário
- **Tailwind CSS** - Estilização moderna
- **Context API** - Gerenciamento de estado
- **localStorage** - Persistência local de dados

### Backend
- **Python 3.11+** - Linguagem do servidor
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy 2.0** - ORM para banco de dados
- **SQLite** - Banco de dados local (codefocus.db)
- **JWT** - Autenticação segura
- **bcrypt** - Criptografia de senhas
- **Alembic** - Migrações de banco de dados
- **Pydantic** - Validação de dados
- **Resend** - Sistema de email profissional
- **httpx** - Cliente HTTP para OAuth

## 📁 Estrutura do Projeto

```
CodeFocus/
├── src/                    # Frontend React
│   ├── components/        # Componentes React
│   ├── context/          # Context API (Auth, Timer, Theme)
│   ├── services/         # Serviços de API
│   ├── utils/            # Utilitários (Export, Notifications)
│   └── config/           # Configurações OAuth
├── backend/              # Backend FastAPI
│   ├── app/
│   │   ├── api/         # Endpoints da API
│   │   ├── auth/        # Autenticação e segurança
│   │   ├── models/      # Modelos SQLAlchemy
│   │   ├── schemas/     # Schemas Pydantic
│   │   ├── services/    # Serviços (email, OAuth)
│   │   ├── config.py    # Configurações
│   │   ├── database.py  # Configuração do banco
│   │   └── main.py      # Aplicação principal
│   ├── alembic/         # Migrações de banco
│   ├── requirements.txt # Dependências Python
│   ├── env.example      # Exemplo de variáveis
│   ├── setup_env.py     # Script de configuração
│   └── SETUP.md         # Documentação detalhada
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
- is_verified: BOOLEAN (Email verificado)
- verification_code: VARCHAR (Código de verificação)
- verification_code_expires: DATETIME (Expiração do código)
- verified_at: DATETIME (Data de verificação)
- created_at: DATETIME
- updated_at: DATETIME
- last_login: DATETIME
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

#### **Configuração Automática (Recomendado)**
```bash
# Navegar para o diretório do backend
cd backend

# Executar script de configuração
python setup_env.py
```

#### **Configuração Manual**
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
pnpm install  # ou npm install

# Iniciar servidor de desenvolvimento
pnpm start    # ou npm start
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
- `POST /api/auth/send-verification` - Reenviar código de verificação
- `POST /api/auth/verify-email` - Verificar código de email
- `POST /api/auth/oauth/google` - Login com Google

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
- **📧 [SETUP.md](backend/SETUP.md)** - Configuração do sistema de email

### Configuração OAuth
- **🔐 [GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)** - Configuração Google OAuth
- **🎵 [SPOTIFY_SETUP.md](docs/SPOTIFY_SETUP.md)** - Configuração Spotify
- **🔧 [ENV_VARIABLES.md](docs/ENV_VARIABLES.md)** - Variáveis de ambiente

## 🔐 Funcionalidades

### Autenticação
- ✅ Login com e-mail/senha
- ✅ Registro de usuários com verificação obrigatória
- ✅ Verificação de email via Resend
- ✅ Códigos de verificação com expiração (5 min)
- ✅ Email de boas-vindas após verificação
- ✅ Login com Google OAuth
- ✅ Backend-first com localStorage fallback
- ✅ Senhas criptografadas com bcrypt
- ✅ JWT para sessões seguras (backend)
- ✅ Templates de email profissionais

### Timer Pomodoro
- ✅ Ciclos de trabalho personalizáveis
- ✅ Pausas curtas e longas
- ✅ Auto-start de ciclos
- ✅ Notificações sonoras
- ✅ Histórico de ciclos
- ✅ Estatísticas de produtividade
- ✅ Tags e notas para sessões
- ✅ Dashboard completo

### Banco de Dados
- ✅ 4 tabelas principais (Users, Cycles, Settings, Reports)
- ✅ Relacionamentos SQLAlchemy
- ✅ Migrações com Alembic
- ✅ Validação com Pydantic
- ✅ Persistência SQLite local (backend)
- ✅ localStorage para persistência local (frontend)

### Frontend
- ✅ Interface React moderna
- ✅ Tema escuro
- ✅ Context API para estado
- ✅ Integração com backend (opcional)
- ✅ Responsivo e acessível
- ✅ Integração Spotify
- ✅ Dashboard de produtividade

## 🚀 Como Usar

### **Configuração Rápida (Recomendado)**

```bash
# Execute o configurador automático
python configure.py
```

O script irá configurar automaticamente:
- ✅ Backend com Resend
- ✅ Frontend com variáveis corretas
- ✅ Chaves de segurança
- ✅ URLs da aplicação

### **Configuração Manual**

#### 1. Backend
```bash
cd backend
python setup_env.py  # Configuração automática
# ou
cp env.example .env  # Configuração manual
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

#### 2. Frontend
```bash
cp env.example .env
pnpm install
pnpm start
```

#### 3. Acesse
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs

### **Configuração do Email (Resend)**

1. **Criar conta**: [resend.com](https://resend.com)
2. **Obter API Key**: Dashboard > API Keys
3. **Configurar domínio**: 
   - Desenvolvimento: `onboarding@resend.dev`
   - Produção: `noreply@seudominio.com`

### **Teste o Sistema**

1. **Registrar usuário** na aplicação
2. **Verificar email** recebido
3. **Inserir código** de verificação
4. **Receber boas-vindas** e acessar sistema

## 🔧 Desenvolvimento

### Backend
- **Porta:** 8000
- **Banco:** SQLite (codefocus.db)
- **Hot Reload:** Ativado
- **CORS:** Configurado para frontend

### Frontend
- **Porta:** 3000
- **Hot Reload:** Ativado
- **API:** Conectado ao backend na porta 8000 (opcional)
- **localStorage:** Persistência local de dados

### Variáveis de Ambiente

#### **Frontend (.env)**
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_SPOTIFY_CLIENT_ID=your-spotify-client-id
```

#### **Backend (.env)**
```bash
# Banco de Dados
DATABASE_URL=sqlite:///./codefocus.db

# Segurança
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=noreply@yourdomain.com
```

## 📝 Próximos Passos

- [x] ✅ Sistema de autenticação com verificação por email
- [x] ✅ Integração com Resend para envio de emails
- [x] ✅ Templates de email profissionais
- [x] ✅ Scripts de configuração automática
- [ ] Implementar integração Git completa
- [ ] Adicionar sistema de notificações web
- [ ] Implementar exportação de relatórios (PDF/Excel)
- [ ] Adicionar sincronização com calendário
- [ ] Implementar modo offline
- [ ] Adicionar suporte a múltiplos projetos
- [ ] Implementar push automático para Git

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📧 Sistema de Email

### **Resend Integration**
- ✅ **Verificação obrigatória** de email no registro
- ✅ **Templates HTML responsivos** e profissionais
- ✅ **Códigos de verificação** com expiração (5 minutos)
- ✅ **Email de boas-vindas** após verificação
- ✅ **Reenvio automático** de códigos
- ✅ **Logs detalhados** de envio

### **Templates Incluídos**
- **Email de Verificação**: Design moderno com código destacado
- **Email de Boas-vindas**: Mensagem personalizada com funcionalidades

### **Configuração**
```bash
# 1. Criar conta em resend.com
# 2. Obter API Key no dashboard
# 3. Configurar domínio (desenvolvimento: onboarding@resend.dev)
# 4. Adicionar variáveis no .env
```

## 📄 Licença

Este projeto está sob a licença MIT.

---

<div align="center">
  <p>Feito com ❤️ para desenvolvedores</p>
  <p><strong>CodeFocus</strong> - Produtividade Dev no Ritmo do Código</p>
  <p>⚡ Configure em segundos • 📧 Emails profissionais • 🔐 Autenticação segura</p>
</div>