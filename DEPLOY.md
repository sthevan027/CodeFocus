# Guia de Deploy - AutoDash.ia

Este guia detalha o processo de deploy do AutoDash.ia em produção.

## 📋 Pré-requisitos

- Conta no [Supabase](https://supabase.com)
- Conta no [Vercel](https://vercel.com) (frontend)
- Conta no [Railway](https://railway.app) ou [Render](https://render.com) (backend)
- Conta no [OpenAI](https://openai.com)
- Conta no [Stripe](https://stripe.com) (opcional)

## 🔧 Configuração do Supabase

1. Crie um novo projeto no Supabase
2. Anote as seguintes informações:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY` 
   - `SUPABASE_SERVICE_KEY`

3. Configure o banco de dados executando as migrations:

```sql
-- Criar tabelas (executar no SQL Editor do Supabase)
-- As tabelas serão criadas automaticamente pelo SQLAlchemy
```

## 🚀 Deploy do Backend

### Opção 1: Railway

1. Faça fork do repositório
2. Conecte sua conta GitHub ao Railway
3. Crie um novo projeto e selecione o repositório
4. Configure as variáveis de ambiente:

```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
SUPABASE_SERVICE_KEY=...
JWT_SECRET_KEY=...
OPENAI_API_KEY=sk-...
FRONTEND_URL=https://seu-app.vercel.app
```

5. Configure o start command:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Opção 2: Render

1. Crie um novo Web Service
2. Conecte o repositório GitHub
3. Configure:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Adicione as variáveis de ambiente

## 🌐 Deploy do Frontend

### Vercel

1. Instale a Vercel CLI:
```bash
npm i -g vercel
```

2. No diretório frontend:
```bash
cd frontend
vercel
```

3. Configure as variáveis de ambiente no dashboard da Vercel:
```
VITE_API_URL=https://seu-backend.railway.app/api/v1
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

4. Para deploys automáticos, conecte o GitHub ao Vercel

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Supabase
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe (opcional)
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# CORS
FRONTEND_URL=https://autodash-ia.vercel.app

# Redis
REDIS_URL=redis://default:password@host:6379

# Environment
ENVIRONMENT=production
```

### Frontend (.env)
```env
VITE_API_URL=https://autodash-backend.railway.app/api/v1
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 Monitoramento

### Logs
- Backend: Acesse os logs no Railway/Render
- Frontend: Vercel Functions logs

### Métricas
- Configure o Sentry para monitoramento de erros
- Use o Railway/Render metrics para performance

## 🔄 CI/CD

O projeto está configurado com GitHub Actions para deploy automático:

1. Configure os secrets no GitHub:
   - `RAILWAY_TOKEN`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - Todas as variáveis de ambiente

2. Ao fazer push para `main`, o deploy será automático

## 🐛 Troubleshooting

### Erro de CORS
- Verifique se `FRONTEND_URL` está correto no backend
- Confirme que o frontend está usando a URL correta da API

### Erro de autenticação
- Verifique as chaves do Supabase
- Confirme que o JWT_SECRET_KEY é o mesmo em todas as instâncias

### Upload não funciona
- Verifique permissões da pasta uploads
- Confirme limite de tamanho no servidor

## 🚨 Segurança

1. **Nunca commite arquivos .env**
2. Use secrets do GitHub para CI/CD
3. Ative HTTPS em produção
4. Configure rate limiting
5. Mantenha dependências atualizadas

## 📱 Domínio Customizado

### Frontend (Vercel)
1. Adicione o domínio no dashboard da Vercel
2. Configure DNS conforme instruções

### Backend (Railway/Render)
1. Adicione domínio customizado
2. Configure SSL
3. Atualize `FRONTEND_URL` e `VITE_API_URL`

## 🎯 Checklist de Deploy

- [ ] Configurar Supabase
- [ ] Deploy do backend
- [ ] Deploy do frontend
- [ ] Configurar variáveis de ambiente
- [ ] Testar autenticação
- [ ] Testar upload de arquivos
- [ ] Testar geração de dashboards
- [ ] Configurar domínios
- [ ] Ativar HTTPS
- [ ] Configurar backups
- [ ] Monitoramento ativo

## 📞 Suporte

Para dúvidas sobre deploy:
- Documentação Supabase: https://supabase.com/docs
- Documentação Vercel: https://vercel.com/docs
- Documentação Railway: https://docs.railway.app