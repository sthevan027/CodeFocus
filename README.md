# AutoDash.ia - Dashboard Automático com IA

Um Micro-SaaS que gera dashboards automáticos a partir de dados fornecidos pelo usuário usando IA.

## 🚀 Funcionalidades

- **Autenticação Segura**: Login/Registro com Supabase Auth
- **Upload de Dados**: Suporte para arquivos CSV e Excel (até 10MB)
- **Geração Automática**: IA analisa dados e sugere visualizações
- **Dashboards Interativos**: Gráficos modernos com Chart.js
- **Sistema de Planos**: Free, Pro e Plus com diferentes limites
- **Interface Moderna**: Design glassmorphism com animações

## 📁 Estrutura do Projeto

```
autodash-ia/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── package.json
│   └── .env.example
└── docker-compose.yml
```

## 🛠️ Tecnologias

### Backend
- FastAPI
- PostgreSQL (Supabase)
- SQLAlchemy
- OpenAI API
- Pandas

### Frontend
- React 18
- TypeScript
- TailwindCSS
- Chart.js
- Framer Motion
- Axios

## 📋 Pré-requisitos

- Node.js 18+
- Python 3.10+
- PostgreSQL (ou conta Supabase)
- Conta OpenAI API
- Conta Stripe (para pagamentos futuros)

## 🔧 Instalação

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Configure as variáveis de ambiente no .env
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
```

## 🚀 Executando o Projeto

### Desenvolvimento

Backend:
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm run dev
```

### Produção

Use Docker Compose:
```bash
docker-compose up -d
```

## 🌐 Deploy

### Frontend (Vercel)

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Backend (Railway/Render)

1. Crie um novo projeto
2. Conecte o repositório
3. Configure as variáveis de ambiente
4. Configure o start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## 📊 Planos

| Recurso | Free | Pro | Plus |
|---------|------|-----|------|
| Dashboards Ativos | 2 | 4 | 8 |
| Total de Dashboards | 3 | 8 | 12 |
| Upload de Dados | ✓ | ✓ | ✓ |
| Exportação | - | ✓ | ✓ |
| Templates Premium | - | - | ✓ |
| Suporte | Email | Prioritário | Dedicado |

## 🔐 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
OPENAI_API_KEY=sk-...
JWT_SECRET_KEY=...
STRIPE_API_KEY=sk_...
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=...
```

## 📅 Roadmap MVP (7 dias)

- [x] Dia 1: Estrutura do projeto e configuração
- [ ] Dia 2: Autenticação e modelos de dados
- [ ] Dia 3: Upload e processamento de arquivos
- [ ] Dia 4: Integração com OpenAI
- [ ] Dia 5: Frontend - páginas principais
- [ ] Dia 6: Dashboard e visualizações
- [ ] Dia 7: Testes e deploy

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT.