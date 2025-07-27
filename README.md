# CodeFocus

Sistema de produtividade para desenvolvedores com foco em gestão de tempo e organização de tarefas.

## 🚀 Tecnologias

### Frontend
- **React** - Interface do usuário
- **Tailwind CSS** - Estilização
- **Context API** - Gerenciamento de estado

### Backend
- **Python** - Linguagem do servidor
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para banco de dados
- **SQLite** - Banco de dados (fácil para desenvolvimento)
- **JWT** - Autenticação segura
- **bcrypt** - Criptografia de senhas

## 📁 Estrutura do Projeto

```
projetos/
├── CodeFocus/              # Frontend React
│   ├── src/               # Código React
│   │   ├── components/    # Componentes
│   │   ├── context/       # Context API
│   │   ├── services/      # Serviços (API)
│   │   └── ...
│   ├── package.json
│   └── README.md
└── CodeFocus-Backend/     # Backend Python
    ├── app/              # Aplicação FastAPI
    │   ├── routers/      # Rotas da API
    │   ├── models.py     # Modelos de dados
    │   └── database.py   # Configuração do banco
    ├── main.py           # Aplicação principal
    ├── requirements.txt  # Dependências Python
    └── start.py          # Script de inicialização
```

## 🛠️ Instalação e Configuração

### 1. Backend (Python)

```bash
# Navegar para o diretório do backend
cd CodeFocus-Backend

# Instalar dependências Python
pip install -r requirements.txt

# Iniciar o servidor
python start.py
```

**Ou no Windows:**
```bash
# Instalar dependências
install.bat

# Iniciar servidor
start.bat
```

### 2. Frontend (React)

```bash
# Navegar para o diretório do frontend
cd CodeFocus

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start
```

## 🔧 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Cadastrar usuário
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/me` - Dados do usuário atual

### Usuários
- `GET /api/users/` - Listar usuários
- `PUT /api/users/me` - Atualizar perfil
- `DELETE /api/users/me` - Deletar conta

## 📚 Documentação

- **API Docs:** http://localhost:8000/docs (Swagger UI)
- **ReDoc:** http://localhost:8000/redoc

## 🔐 Funcionalidades

### Autenticação
- ✅ Login com e-mail/senha
- ✅ Registro de usuários
- ✅ Login com Google OAuth
- ✅ Login com GitHub OAuth
- ✅ Login anônimo (desenvolvimento)
- ✅ JWT para sessões seguras
- ✅ Senhas criptografadas com bcrypt

### Usuários
- ✅ Cadastro e login
- ✅ Atualização de perfil
- ✅ Exclusão de conta
- ✅ Persistência no banco SQLite

## 🚀 Como Usar

1. **Inicie o backend:**
   ```bash
   cd CodeFocus-Backend
   python start.py
   ```

2. **Inicie o frontend:**
   ```bash
   cd CodeFocus
   npm start
   ```

3. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:8000/docs

4. **Teste o cadastro e login:**
   - Crie uma conta nova
   - Faça login com e-mail/senha
   - Teste login com Google/GitHub

## 🔧 Desenvolvimento

### Backend
- **Porta:** 8000
- **Banco:** SQLite (codefocus.db)
- **Hot Reload:** Ativado

### Frontend
- **Porta:** 3000
- **Hot Reload:** Ativado
- **API:** Conectado ao backend na porta 8000

## 📝 Próximos Passos

- [ ] Implementar sistema de tarefas
- [ ] Adicionar timer Pomodoro
- [ ] Criar dashboard de produtividade
- [ ] Implementar notificações
- [ ] Adicionar relatórios e estatísticas

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.