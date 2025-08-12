# CodeFocus Backend

## Configuração do Sistema de Email (Resend)

### 1. Configurar Resend

1. Acesse [resend.com](https://resend.com) e crie uma conta
2. Obtenha sua API Key no dashboard
3. Configure um domínio verificado (ou use o domínio de teste do Resend)

### 2. Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:

```env
# Configurações do Banco de Dados
DATABASE_URL=sqlite:///./codefocus.db

# Configurações de Segurança
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configurações da Aplicação
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Configurações do Resend (Email)
RESEND_API_KEY=your-resend-api-key-here
MAIL_FROM=noreply@yourdomain.com
```

### 3. Instalação das Dependências

```bash
pip install -r requirements.txt
```

### 4. Executar o Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Funcionalidades de Email

- **Verificação de Email**: Envio automático de código de verificação
- **Email de Boas-vindas**: Enviado após verificação do email
- **Templates HTML**: Emails com design responsivo e profissional

## Endpoints de Autenticação

- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Login
- `POST /auth/send-verification` - Reenviar código de verificação
- `POST /auth/verify-email` - Verificar código de email
- `GET /auth/me` - Obter dados do usuário atual 