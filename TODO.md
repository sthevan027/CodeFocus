# TODO – Checklist para lançar o CodeFocus e gerar renda

> Objetivo: colocar o CodeFocus no ar como um **MVP estável**, com **onboarding**, **métricas** e um **fluxo de pagamento** (freemium → upgrade), para começar a faturar o quanto antes.

## Diagnóstico rápido (o que mais trava “lançamento” hoje)

- **Frontend ↔ Backend estão desalinhados**:
  - `src/services/apiService.js` usa **URL fixa** (`http://localhost:8000/api`) e não usa `REACT_APP_API_URL`.
  - O cadastro no frontend envia `{ name, email, password }`, mas o backend espera `UserCreate` com campos diferentes (`username`, `full_name`, etc).
  - Frontend chama rotas que **não existem** no backend (`/users/me`, `/users/{id}`, callbacks OAuth).
  - O `AuthContext` tem **fallback localStorage** pesado; isso é bom pro “demo/offline”, mas em produção precisa ser uma escolha clara e consistente.
- **Bug de expiração do código de verificação** no backend: a regra atual faz o código “durar mais do que deveria”.
- **CORS e URLs** estão hardcoded para `localhost` no backend.
- README referencia uma pasta `docs/` e arquivos que **não estão no repositório** (ou não aparecem na estrutura atual) → confunde deploy e usuários.

---

## P0 – Bloqueadores (precisa antes de colocar em produção)

### Produto / experiência mínima
- [ ] **Definir MVP de lançamento (escopo mínimo)**:
  - [ ] “Timer + histórico + dashboard simples + conta + verificação de email”
  - [ ] Decidir: “modo offline/localStorage” vai existir no MVP? (se sim, com aviso claro)
- [ ] **Fluxo de onboarding** (primeiro login):
  - [ ] Tela “bem-vindo” com 3 passos: configurar tempos, criar 1ª tag/projeto, iniciar 1º ciclo
  - [ ] Empty states em Dashboard/Histórico (sem dados)

### Contrato de API (frontend + backend)
- [ ] **Padronizar URL da API no frontend**:
  - [ ] `apiService` ler de `process.env.REACT_APP_API_URL` e montar `/api`
  - [ ] Remover `localhost` hardcoded
- [ ] **Alinhar payloads e nomes de campos**:
  - [ ] Frontend: decidir se vai usar `username` e/ou `full_name`
  - [ ] Backend: aceitar o payload do frontend (ou ajustar o frontend)
- [ ] **Corrigir fluxo de autenticação/estado do usuário**:
  - [ ] Backend retorna `user.is_verified` (snake_case) e frontend hoje usa `emailVerified` em alguns pontos
  - [ ] Definir um “User shape” único no frontend (normalização)
- [ ] **Remover/limitar fallback local em produção**:
  - [ ] Criar flag (`REACT_APP_OFFLINE_MODE=true/false`) e deixar claro quando está ativo
  - [ ] Se OFFLINE=false: não criar usuários no localStorage como fallback silencioso
- [ ] **Implementar ou remover rotas inexistentes**:
  - [ ] Se quiser perfil: criar `PUT /api/users/me` no backend (ou ajustar frontend para usar apenas `/auth/me`)
  - [ ] Ajustar `oauthCallback()` (hoje aponta para endpoints que não existem)

### Segurança e confiabilidade
- [ ] **Corrigir expiração do código de verificação** (backend)
- [ ] **CORS configurável por ambiente**:
  - [ ] Ler `FRONTEND_URL` (e possivelmente uma lista) do `.env` no backend
- [ ] **Tokens e segurança do frontend**:
  - [ ] Revisar uso de `localStorage` para JWT (risco XSS). Se ficar no MVP, reforçar hardening.
  - [ ] Planejar refresh token / sessão (mesmo que não implemente agora, evitar “gambiarras”)
- [ ] **Rate limit básico** em endpoints de auth (login, resend code, verify)
- [ ] **Logs** no backend (erros de email, auth, exceptions) com formato consistente

### Banco de dados / migrações / produção
- [ ] **Escolher banco de produção** (Postgres recomendado) e padronizar:
  - [ ] Docker compose já tem Postgres, mas o app ainda cria tabelas via `metadata.create_all()` no startup
  - [ ] Deixar **Alembic como fonte de verdade** e remover criação automática no startup
- [ ] **Revisar unidades de tempo** (segundos vs minutos):
  - [ ] `Cycle.duration` e somatórios (no backend e no TXT do relatório) precisam bater com o que o Timer grava

### Deploy (primeiro “no ar”)
- [ ] **Definir stack de deploy** (simples e barata):
  - [ ] Backend: Render/Fly/Railway (ou VPS)
  - [ ] Banco: Postgres gerenciado
  - [ ] Frontend: Vercel/Netlify/Cloudflare Pages
- [ ] **Configurar domínios**:
  - [ ] `app.seudominio.com` (frontend) e `api.seudominio.com` (backend)
  - [ ] HTTPS obrigatório
- [ ] **Variáveis de ambiente** em produção (sem placeholders):
  - [ ] `SECRET_KEY` forte
  - [ ] `RESEND_API_KEY` real
  - [ ] `MAIL_FROM` com domínio verificado
  - [ ] `FRONTEND_URL` e `BACKEND_URL`
- [ ] **Build e healthcheck**:
  - [ ] endpoint `/health` já existe – usar no provedor

---

## P1 – Pronto para vender (qualidade e “cara de produto”)

### Landing page + posicionamento
- [ ] **Landing page separada** (ou uma rota pública) com:
  - [ ] Promessa clara (“Pomodoro + métricas + rotina dev”)
  - [ ] Prints/GIFs
  - [ ] CTA: “Começar grátis”
  - [ ] Seção de preços
  - [ ] Depoimentos/roadmap
- [ ] **Copy e diferenciais** (o que te faz diferente do “pomodoro genérico”):
  - [ ] “relatórios e evolução”
  - [ ] “rotina de foco para dev”
  - [ ] “integração com Git” (só se for real no MVP)

### Monetização (mínimo)
- [ ] **Definir planos** (exemplo):
  - [ ] Free: timer + histórico básico
  - [ ] Pro (R$): relatórios, exportação, tags ilimitadas, metas, backups/sync
- [ ] **Integrar pagamentos**:
  - [ ] Stripe (assinatura) ou MercadoPago (se preferir BR)
  - [ ] Checkout + webhook + estado de assinatura no backend
  - [ ] Portal do cliente (cancelar/atualizar cartão)
- [ ] **Feature gating no frontend** (bloquear recursos Pro com paywall)
- [ ] **Página de conta**: plano atual, faturas, gerenciar assinatura

### Métricas e feedback
- [ ] **Analytics** (pelo menos eventos básicos):
  - [ ] cadastro, verificação, 1º ciclo, retorno D1/D7, upgrade, churn
- [ ] **Canal de feedback**:
  - [ ] botão “reportar bug / sugerir” (link para formulário)

### Legal e confiança
- [ ] **Política de privacidade** e **Termos de uso**
- [ ] **LGPD** (mínimo): quais dados guarda, como remover conta, contato
- [ ] **Página de status** (mesmo simples) ou pelo menos um endpoint público

---

## P2 – Escala do produto (melhorias que aumentam conversão e retenção)

### Recursos com alto ROI (para vender Pro)
- [ ] **Exportação de relatórios** (CSV/PDF) + share link
- [ ] **Metas semanais** (ex.: 10 pomodoros) + streak
- [ ] **Multi-projeto** (tags/projetos com métricas por projeto)
- [ ] **Backup/sincronização** (o que “justifica assinatura”)

### Integrações (só depois que o core estiver redondo)
- [ ] **Integração Git real** (definir exatamente o que é possível via web)
  - [ ] Se for desktop/CLI: criar um “CodeFocus CLI” (mais realista para Git)
- [ ] **Spotify**: confirmar se está completo (auth + player) e se vale para MVP
- [ ] Google Calendar (planejar)

---

## P3 – Crescimento (para achar clientes e aumentar receita)

- [ ] **Página pública de changelog** (ou release notes)
- [ ] **SEO básico** na landing (metatags, OG images, sitemap)
- [ ] **Conteúdo** (posts curtos):
  - [ ] “Como devs usam pomodoro sem se frustrar”
  - [ ] “Como medir foco sem virar refém de métricas”
- [ ] **Oferta de lançamento** (ex.: 50% por 3 meses pros primeiros 100)
- [ ] **Programa de indicação** (1 mês Pro grátis por indicação paga)

---

## Checklists rápidos (para você ir ticando)

### “MVP no ar em 48–72h” (foco total)
- [ ] API e payloads alinhados (cadastro/login/verificação funcionando 100%)
- [ ] URL da API via `.env` no frontend
- [ ] CORS por ambiente
- [ ] Deploy do backend + Postgres + domínio + HTTPS
- [ ] Deploy do frontend + domínio + HTTPS
- [ ] Landing mínima com CTA

### “Primeira venda”
- [ ] Preços e planos definidos
- [ ] Stripe/MercadoPago com checkout + confirmação
- [ ] Página “Conta/Plano”
- [ ] Paywall em 1 feature Pro (ex.: relatórios/export)

