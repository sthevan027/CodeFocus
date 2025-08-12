# 🚀 Configuração do CodeFocus Backend

## 📋 Configuração Rápida

### 1. **Configuração Automática (Recomendado)**

```bash
cd backend
python setup_env.py
```

O script irá:
- ✅ Gerar uma chave secreta segura
- ✅ Solicitar configurações do Resend
- ✅ Criar o arquivo `.env` automaticamente
- ✅ Mostrar próximos passos

### 2. **Configuração Manual**

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar configurações
nano .env
```

## 📧 Configuração do Resend

### **Passo 1: Criar Conta**
1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita (3.000 emails/mês)
3. Confirme seu email

### **Passo 2: Obter API Key**
1. Acesse o Dashboard
2. Vá em "API Keys"
3. Clique em "Create API Key"
4. Copie a chave (começa com `re_`)

### **Passo 3: Configurar Domínio**

**Para Desenvolvimento:**
```env
MAIL_FROM=onboarding@resend.dev
```

**Para Produção:**
1. Vá em "Domains" no dashboard
2. Adicione seu domínio
3. Configure os registros DNS
4. Use: `MAIL_FROM=noreply@seudominio.com`

## 🔧 Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=sqlite:///./codefocus.db

# Segurança
SECRET_KEY=sua-chave-secreta-aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# URLs
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MAIL_FROM=noreply@yourdomain.com
```

## 🏃‍♂️ Executar o Projeto

### **1. Instalar Dependências**
```bash
pip install -r requirements.txt
```

### **2. Executar Servidor**
```bash
# Desenvolvimento
python -m uvicorn app.main:app --reload

# Ou simplesmente
uvicorn app.main:app --reload
```

### **3. Acessar Documentação**
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testar Sistema de Email

### **Registrar Usuário**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "username": "teste",
    "full_name": "Usuário Teste",
    "password": "senha123"
  }'
```

### **Verificar Email**
```bash
curl -X POST "http://localhost:8000/auth/verify-email" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "code": "123456"
  }'
```

## 🔍 Solução de Problemas

### **Erro: Resend API Key Inválida**
- ✅ Verifique se a chave começa com `re_`
- ✅ Confirme que copiou corretamente
- ✅ Verifique se a conta Resend está ativa

### **Erro: Email não enviado**
- ✅ Verifique o `MAIL_FROM` no `.env`
- ✅ Para desenvolvimento, use `onboarding@resend.dev`
- ✅ Verifique logs do servidor

### **Erro: Banco de dados**
- ✅ SQLite será criado automaticamente
- ✅ Verifique permissões da pasta
- ✅ Para reset: delete `codefocus.db`

## 📊 Monitoramento

### **Logs de Email**
```bash
# No terminal onde rodou uvicorn
✅ Email de verificação enviado para user@example.com via Resend
📧 ID do email: abc123...
```

### **Verificar Saúde da API**
```bash
curl http://localhost:8000/health
```

## 🔐 Segurança

### **Desenvolvimento**
- ✅ SQLite local
- ✅ Domínio de teste Resend
- ✅ Chave secreta gerada

### **Produção**
- ⚠️ Use PostgreSQL
- ⚠️ Configure domínio próprio
- ⚠️ Use HTTPS
- ⚠️ Rotacione chaves regularmente

## 📞 Suporte

- **Resend Docs**: https://resend.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Issues**: Reporte problemas no repositório
