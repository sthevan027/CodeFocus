# AutoDash.ia — MVP

Gera dashboards automáticos a partir de arquivos CSV/XLSX ou conexões com banco. Frontend em Next.js (React 18 + TS + Tailwind + Framer Motion + Chart.js) e backend em FastAPI (Python), com autenticação via Supabase Auth e armazenamento de metadados no PostgreSQL (Supabase/Render/Railway).

## Principais funcionalidades (MVP)
- Autenticação (Supabase Auth) com e‑mail/senha.
- Upload de dados até 10 MB (.csv/.xlsx) e leitura com pandas.
- Serviço de IA (OpenAI) que sugere gráficos e gera configuração Chart.js.
- Planos: Free/Pro/Plus com limites de dashboards (ativos/total).
- UI moderna com glassmorphism e animações.

## Estrutura
```
autodash-ia/
  backend/
    app/
      main.py
      config.py
      database.py
      models.py
      schemas.py
      deps.py
      routers/
        uploads.py
        dashboards.py
        plans.py
      services/
        openai_service.py
        plan_limits.py
    requirements.txt
    Dockerfile
    Procfile
  frontend/
    app/
      (páginas Next.js)
    components/
    lib/
    styles/
    package.json
    tailwind.config.ts
    tsconfig.json
    next.config.js
    postcss.config.js
  .env.example
  README.md
```

## Requisitos
- Node.js 18+
- Python 3.11+

## Variáveis de ambiente
Copie `.env.example` para `.env` e preencha.

Backend (FastAPI):
- `DATABASE_URL` (ex.: postgresql://user:pass@host:5432/db). Para dev local, pode deixar vazio (SQLite).
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (apenas no backend)
- `OPENAI_API_KEY`
- `OPENAI_MODEL` (opcional, default: gpt-4o-mini)
- `ALLOWED_ORIGINS` (ex.: https://autodash-ia.vercel.app,http://localhost:3000)
- `MAX_UPLOAD_MB` (default 10)

Frontend (Next.js):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BACKEND_URL` (URL do FastAPI)

## Setup rápido

Backend:
```
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:
```
cd frontend
npm install
npm run dev
```

## Fluxo de autenticação
- O frontend usa Supabase Auth. Após login, envia o `access_token` em `Authorization: Bearer <token>` para o backend.
- O backend valida o token via Supabase Admin (`SUPABASE_SERVICE_ROLE_KEY`).

## Upload e geração de dashboards
- Envie arquivo CSV/XLSX até 10 MB para `POST /api/uploads` com header `Authorization`.
- O backend lê o schema com pandas, chama a OpenAI para sugerir gráficos e salva um `Dashboard` com `charts_json` compatível com Chart.js.

## Limites de planos
- Free: 2 ativos / 3 total
- Pro: 4 ativos / 8 total
- Plus: 8 ativos / 12 total

A verificação ocorre no backend. Integração Stripe fica preparada para futuro.

## Deploy
- Frontend (Vercel): importe o diretório `frontend/`, configure envs e `NEXT_PUBLIC_BACKEND_URL`.
- Backend (Railway/Render): importe `backend/`, configure envs, use `Procfile` ou comando `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Restrinja CORS para domínios necessários (`ALLOWED_ORIGINS`).

## CI/CD (sugestão)
- Configure GitHub Actions para build do frontend e checagem do backend (opcional neste MVP).

## Observações
- Tabelas são criadas automaticamente no startup (SQLAlchemy). Para produção, recomenda-se Alembic.
- Para desenvolvimento local sem Postgres, o backend cai em SQLite automaticamente.

## Roadmap (7 dias)
- Dia 1: Estrutura monorepo, setup FastAPI/Next.js, Tailwind, Supabase clientes, envs.
- Dia 2: Modelos e migração inicial (auto-create), rotas de planos e status de saúde.
- Dia 3: Autenticação end-to-end (Supabase Auth no front, validação no backend), páginas login.
- Dia 4: Upload CSV/XLSX (10MB), parsing com pandas, salvar metadados, limites de plano.
- Dia 5: Serviço OpenAI e geração de charts JSON, endpoint e persistência `Dashboard`.
- Dia 6: Páginas de upload, listagem e detalhe com Chart.js + animações; UI glassmorphism.
- Dia 7: Harden de CORS, .env, deploy: Backend (Railway/Render) e Frontend (Vercel); docs finais.