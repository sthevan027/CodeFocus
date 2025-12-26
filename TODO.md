# TODO – Checklist para lançar o CodeFocus e gerar renda

> Objetivo: colocar o CodeFocus no ar como um **MVP estável**, com **onboarding**, **métricas** e um **fluxo de pagamento** (freemium → upgrade), para começar a faturar o quanto antes.

## ✅ O QUE JÁ FOI FEITO

### Migração de Stack (Concluído)
- [x] **Backend migrado de Python/FastAPI para Next.js API Routes**
  - [x] Todas as rotas de autenticação migradas (`/api/auth/*`)
  - [x] Rotas de ciclos migradas (`/api/cycles/*`)
  - [x] Rotas de configurações migradas (`/api/settings/*`)
  - [x] Rotas de relatórios migradas (`/api/reports/*`)
- [x] **Frontend migrado para Next.js**
  - [x] Componentes React integrados no Next.js
  - [x] Context API funcionando
  - [x] Estrutura unificada (frontend + backend no mesmo projeto)
- [x] **Banco de dados migrado para Supabase (PostgreSQL)**
  - [x] Schema SQL criado (`supabase/schema.sql`)
  - [x] Tabelas: users, user_settings, cycles, reports
  - [x] Row Level Security (RLS) configurado
  - [x] Triggers e índices criados
- [x] **Configuração para deploy**
  - [x] Vercel configurado (`vercel.json`)
  - [x] Documentação de deploy criada (`VERCEL_DEPLOY.md`)
  - [x] Variáveis de ambiente documentadas (`.env.example`)
  - [x] Guia do Supabase criado (`SUPABASE_SETUP.md`)
- [x] **Limpeza do projeto**
  - [x] Backend Python removido
  - [x] Frontend React separado removido
  - [x] Dependências desnecessárias removidas (Resend por enquanto)

---

## P0 – Bloqueadores (precisa antes de colocar em produção)

### Produto / experiência mínima
- [ ] **Definir MVP de lançamento (escopo mínimo)**:
  - [ ] "Timer + histórico + dashboard simples + conta + verificação de email"
  - [ ] Decidir: "modo offline/localStorage" vai existir no MVP? (se sim, com aviso claro)
- [ ] **Fluxo de onboarding** (primeiro login):
  - [ ] Tela "bem-vindo" com 3 passos: configurar tempos, criar 1ª tag/projeto, iniciar 1º ciclo
  - [ ] Empty states em Dashboard/Histórico (sem dados)

### Contrato de API (frontend + backend) - ⚠️ ATENÇÃO
- [x] **URL da API padronizada no frontend**:
  - [x] `apiService` usa rotas relativas `/api` (funciona em dev e produção)
  - [x] Removido `localhost` hardcoded
- [ ] **Alinhar payloads e nomes de campos**:
  - [x] Backend aceita `full_name` (convertido de `name` no frontend)
  - [ ] Verificar se todos os campos estão consistentes entre frontend e backend
  - [ ] Testar fluxo completo de registro → verificação → login
- [ ] **Corrigir fluxo de autenticação/estado do usuário**:
  - [x] Backend retorna `is_verified` (snake_case)
  - [x] Frontend atualizado para usar `is_verified`
  - [ ] Testar normalização do objeto User em todo o frontend
- [ ] **Remover/limitar fallback local em produção**:
  - [ ] Criar flag (`NEXT_PUBLIC_OFFLINE_MODE=true/false`)
  - [ ] Se OFFLINE=false: não criar usuários no localStorage como fallback silencioso
  - [ ] Adicionar aviso claro quando estiver em modo offline
- [ ] **Implementar ou remover rotas inexistentes**:
  - [ ] `PUT /api/users/me` - Atualizar perfil (criar endpoint)
  - [ ] `PUT /api/users/{id}` - Remover ou ajustar frontend
  - [ ] `oauthCallback()` - Implementar OAuth ou remover do frontend

### Segurança e confiabilidade
- [ ] **Corrigir expiração do código de verificação**:
  - [ ] Verificar lógica de expiração em `pages/api/auth/verify-email.js`
  - [ ] Testar se código expira corretamente após 5 minutos
- [x] **CORS configurável**:
  - [x] Next.js não precisa de CORS explícito (mesma origem)
  - [ ] Configurar CORS no Supabase se necessário
- [ ] **Tokens e segurança do frontend**:
  - [ ] Revisar uso de `localStorage` para JWT (risco XSS)
  - [ ] Considerar httpOnly cookies para produção
  - [ ] Planejar refresh token / sessão
- [ ] **Rate limit básico** em endpoints de auth:
  - [ ] Implementar rate limiting (usar Vercel Edge Config ou middleware)
  - [ ] Proteger: login, resend code, verify
- [ ] **Logs** no backend:
  - [ ] Configurar logging estruturado
  - [ ] Logs de erros de email, auth, exceptions
  - [ ] Integrar com serviço de logs (Vercel Logs ou externo)

### Banco de dados / migrações / produção
- [x] **Banco de produção escolhido**: Supabase (PostgreSQL)
- [x] **Schema criado e documentado**
- [ ] **Migrações versionadas**:
  - [ ] Configurar Supabase Migrations ou versionar schema.sql
  - [ ] Criar sistema de migrações para futuras mudanças
- [ ] **Revisar unidades de tempo**:
  - [ ] Verificar se `Cycle.duration` está em minutos (consistente)
  - [ ] Confirmar que relatórios usam a mesma unidade
  - [ ] Testar cálculos de tempo total

### Deploy (primeiro "no ar")
- [x] **Stack de deploy definida**: Vercel (frontend + backend) + Supabase (banco)
- [ ] **Configurar domínios**:
  - [ ] Domínio customizado na Vercel
  - [ ] HTTPS obrigatório (automático na Vercel)
  - [ ] Atualizar `NEXT_PUBLIC_APP_URL` com URL real
- [ ] **Variáveis de ambiente em produção**:
  - [ ] Configurar todas as variáveis na Vercel
  - [ ] `JWT_SECRET` forte e único para produção
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` com URL da Vercel
- [ ] **Testar deploy completo**:
  - [ ] Deploy na Vercel
  - [ ] Testar registro de usuário
  - [ ] Testar login
  - [ ] Testar criação de ciclo
  - [ ] Verificar logs de erro
- [ ] **Healthcheck**:
  - [ ] Criar endpoint `/api/health` (ou usar `/` do Next.js)
  - [ ] Configurar monitoramento básico

---

## P1 – Pronto para vender (qualidade e "cara de produto")

### Landing page + posicionamento
- [ ] **Landing page separada** (ou rota pública `/`):
  - [ ] Promessa clara ("Pomodoro + métricas + rotina dev")
  - [ ] Screenshots/GIFs do produto
  - [ ] CTA: "Começar grátis"
  - [ ] Seção de preços
  - [ ] Depoimentos/roadmap
- [ ] **Copy e diferenciais**:
  - [ ] "Relatórios e evolução de produtividade"
  - [ ] "Rotina de foco para desenvolvedores"
  - [ ] "Integração com Git" (se implementado no MVP)

### Monetização (mínimo)
- [ ] **Definir planos** (exemplo):
  - [ ] Free: timer + histórico básico + 10 ciclos/dia
  - [ ] Pro (R$ 19,90/mês): relatórios, exportação, tags ilimitadas, metas, backups/sync
- [ ] **Integrar pagamentos**:
  - [ ] Stripe (assinatura) ou MercadoPago (se preferir BR)
  - [ ] Checkout + webhook + estado de assinatura no backend
  - [ ] Criar tabela `subscriptions` no Supabase
  - [ ] Portal do cliente (cancelar/atualizar cartão)
- [ ] **Feature gating no frontend**:
  - [ ] Bloquear recursos Pro com paywall
  - [ ] Componente de upgrade/banner
- [ ] **Página de conta**:
  - [ ] Plano atual, faturas, gerenciar assinatura
  - [ ] Histórico de pagamentos

### Métricas e feedback
- [ ] **Analytics** (eventos básicos):
  - [ ] Integrar Vercel Analytics ou Google Analytics
  - [ ] Eventos: cadastro, verificação, 1º ciclo, retorno D1/D7, upgrade, churn
- [ ] **Canal de feedback**:
  - [ ] Botão "reportar bug / sugerir" (link para formulário ou email)
  - [ ] Página de contato

### Legal e confiança
- [ ] **Política de privacidade** e **Termos de uso**
- [ ] **LGPD** (mínimo):
  - [ ] Quais dados guarda
  - [ ] Como remover conta
  - [ ] Contato do responsável
- [ ] **Página de status**:
  - [ ] Endpoint público `/api/status` ou página `/status`
  - [ ] Status do Supabase, Vercel, etc.

---

## P2 – Escala do produto (melhorias que aumentam conversão e retenção)

### Recursos com alto ROI (para vender Pro)
- [ ] **Exportação de relatórios**:
  - [ ] CSV/PDF
  - [ ] Share link (compartilhar relatório)
- [ ] **Metas semanais**:
  - [ ] Ex.: 10 pomodoros por semana
  - [ ] Streak (sequência de dias)
  - [ ] Badges/conquistas
- [ ] **Multi-projeto**:
  - [ ] Tags/projetos com métricas por projeto
  - [ ] Filtros no dashboard
- [ ] **Backup/sincronização**:
  - [ ] Exportar dados do usuário
  - [ ] Importar dados
  - [ ] Sincronização entre dispositivos

### Integrações (só depois que o core estiver redondo)
- [ ] **Integração Git real**:
  - [ ] Definir exatamente o que é possível via web
  - [ ] Se for desktop/CLI: criar "CodeFocus CLI" (mais realista para Git)
- [ ] **Email de verificação**:
  - [ ] Implementar Resend ou outro serviço
  - [ ] Templates de email
- [ ] **Google Calendar** (planejar)
- [ ] **Notificações push** (opcional)

---

## P3 – Crescimento (para achar clientes e aumentar receita)

- [ ] **Página pública de changelog** (ou release notes)
- [ ] **SEO básico**:
  - [ ] Metatags, OG images, sitemap
  - [ ] Otimização para busca
- [ ] **Conteúdo** (posts curtos):
  - [ ] "Como devs usam pomodoro sem se frustrar"
  - [ ] "Como medir foco sem virar refém de métricas"
- [ ] **Oferta de lançamento**:
  - [ ] Ex.: 50% por 3 meses pros primeiros 100
- [ ] **Programa de indicação**:
  - [ ] 1 mês Pro grátis por indicação paga

---

## Checklists rápidos (para você ir ticando)

### "MVP no ar em 48–72h" (foco total)
- [x] API migrada para Next.js
- [x] Frontend integrado no Next.js
- [x] Banco de dados configurado (Supabase)
- [ ] API e payloads alinhados (testar cadastro/login/verificação 100%)
- [ ] URL da API via `.env` no frontend (✅ já feito - usa rotas relativas)
- [ ] CORS configurado (✅ não necessário - mesma origem)
- [ ] Deploy do backend + banco + domínio + HTTPS
- [ ] Deploy do frontend + domínio + HTTPS
- [ ] Landing mínima com CTA

### "Primeira venda"
- [ ] Preços e planos definidos
- [ ] Stripe/MercadoPago com checkout + confirmação
- [ ] Página "Conta/Plano"
- [ ] Paywall em 1 feature Pro (ex.: relatórios/export)

### "Próximos passos imediatos"
- [ ] **Configurar Supabase** (seguir `SUPABASE_SETUP.md`)
  - [ ] Criar projeto
  - [ ] Executar schema.sql
  - [ ] Obter credenciais
- [ ] **Testar localmente**:
  - [ ] Criar `.env.local`
  - [ ] Rodar `pnpm dev`
  - [ ] Testar registro → verificação → login → criar ciclo
- [ ] **Fazer primeiro deploy**:
  - [ ] Push para GitHub
  - [ ] Conectar na Vercel
  - [ ] Configurar variáveis de ambiente
  - [ ] Deploy e testar

---

## Notas importantes

### Mudanças na arquitetura
- ✅ **Backend**: Python/FastAPI → Next.js API Routes
- ✅ **Banco**: SQLite → Supabase (PostgreSQL)
- ✅ **Frontend**: React separado → Next.js integrado
- ✅ **Deploy**: Separado → Vercel (tudo junto)

### Arquivos importantes
- `supabase/schema.sql` - Schema do banco de dados
- `SUPABASE_SETUP.md` - Guia de configuração do Supabase
- `VERCEL_DEPLOY.md` - Guia de deploy na Vercel
- `.env.example` - Template de variáveis de ambiente

### Próximas prioridades
1. **Configurar Supabase** e testar localmente
2. **Alinhar payloads** entre frontend e backend
3. **Testar fluxo completo** de autenticação
4. **Fazer primeiro deploy** na Vercel
5. **Implementar onboarding** básico
