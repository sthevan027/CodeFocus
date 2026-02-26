# CodeFocus - Next.js + Supabase

Aplicativo de produtividade para desenvolvedores com técnica Pomodoro, integração Git e relatórios.

## 🚀 Stack Tecnológica

- **Frontend/Backend**: Next.js 14 (Pages Router)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (cookies httpOnly, OAuth GitHub/Google)
- **Validação**: Zod
- **Estilização**: Tailwind CSS

## 📁 Estrutura do Projeto

```
app/
├── pages/
│   └── api/              # API Routes (Backend)
│       ├── auth/         # Autenticação (login, register, OAuth)
│       ├── cycles/       # Ciclos Pomodoro
│       ├── settings/     # Configurações
│       ├── reports/      # Relatórios
│       └── github/       # Integração GitHub (repos, issues)
├── lib/                  # Utilitários
│   ├── supabase.js      # Cliente Supabase
│   ├── auth.js          # Autenticação (Supabase Auth + cookies)
│   └── validations.js   # Schemas Zod
├── supabase/
│   └── schema.sql       # Schema do banco de dados
└── public/              # Arquivos estáticos
```

## 🛠️ Configuração Inicial

### 1. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Vá em **SQL Editor** e execute o arquivo `supabase/schema.sql`
4. Vá em **Settings > API** e copie:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto `app/`:

```env
# Supabase (Auth + Database)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# GitHub (Integração) - Opcional
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Node
NODE_ENV=development
```

Consulte `app/env.example` para o template completo.

### 3. Instalar Dependências

```bash
cd app
pnpm install
# ou
npm install
```

### 4. Rodar Aplicação

```bash
# Desenvolvimento
pnpm dev
# ou
npm run dev

# Build para produção
pnpm build
pnpm start
```

A aplicação estará disponível em: http://localhost:3000

## 📊 Banco de Dados (Supabase)

### Tabelas Criadas

- **profiles**: Perfis de usuário
- **user_settings**: Configurações do usuário
- **cycles**: Ciclos Pomodoro
- **reports**: Relatórios de produtividade
- **tags**: Tags do usuário (gerenciador de tarefas)
- **tasks**: Tarefas do usuário (gerenciador de tarefas)

### Row Level Security (RLS)

O schema inclui políticas RLS básicas. Para usar autenticação do Supabase Auth, você precisará ajustar as políticas para usar `auth.uid()`.

### Executar Schema

1. Acesse o SQL Editor no Supabase Dashboard
2. Cole o conteúdo de `supabase/schema.sql`
3. Execute o script

## 🔐 Autenticação

O sistema usa **Supabase Auth** com cookies httpOnly. Suporta:
- Email/senha (registro e login)
- OAuth (GitHub, Google via Supabase Dashboard)
- Verificação por link de confirmação (Supabase)

### Endpoints de Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual
- `GET /api/auth/session` - Sessão atual
- `POST /api/auth/logout` - Logout
- `POST /api/auth/send-verification` - Reenviar link de verificação

## 📡 API Routes

### Ciclos
- `GET /api/cycles` - Listar ciclos
- `POST /api/cycles` - Criar ciclo
- `GET /api/cycles/[id]` - Obter ciclo
- `PUT /api/cycles/[id]` - Atualizar ciclo
- `DELETE /api/cycles/[id]` - Deletar ciclo
- `GET /api/cycles/stats/overview` - Estatísticas gerais

### Configurações
- `GET /api/settings` - Obter configurações
- `PUT /api/settings` - Atualizar configurações
- `POST /api/settings/reset` - Resetar configurações

### Relatórios
- `POST /api/reports/generate` - Gerar relatório
- `GET /api/reports` - Listar relatórios
- `GET /api/reports/[id]` - Obter relatório
- `DELETE /api/reports/[id]` - Deletar relatório

### Tags
- `GET /api/tags` - Listar tags
- `POST /api/tags` - Criar tag
- `DELETE /api/tags/[id]` - Deletar tag

### Tarefas
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks/[id]` - Atualizar tarefa
- `DELETE /api/tasks/[id]` - Deletar tarefa

### GitHub (Integração)
- `GET /api/github/repos` - Listar repositórios do usuário
- `GET /api/github/issues` - Listar issues de um repositório
- `POST /api/github/select-repo` - Selecionar repositório

### Utilitários
- `GET /api/health` - Healthcheck
- `GET /api/status` - Status do sistema

## 🔧 Desenvolvimento

### Estrutura de API Routes

Cada rota de API é um arquivo em `pages/api/` que exporta uma função `handler`:

```javascript
export default async function handler(req, res) {
  // req.method: GET, POST, PUT, DELETE
  // req.body: Dados do corpo da requisição
  // req.query: Query parameters
  // res.status().json(): Resposta
}
```

### Autenticação em Rotas

```javascript
import { requireAuth } from '../../../lib/auth'

export default async function handler(req, res) {
  try {
    const { userId } = await requireAuth(req)
    // userId contém o ID do usuário autenticado (Supabase auth.uid())
  } catch (error) {
    return res.status(401).json({ error: error.message })
  }
}
```

### Validação com Zod

```javascript
import { registerSchema } from '../../../lib/validations'

const validatedData = registerSchema.parse(req.body)
```

## 📝 Próximos Passos

- [ ] Implementar onboarding básico
- [ ] Integrar envio de emails (Resend ou outro serviço)
- [ ] Adicionar testes
- [ ] Rate limiting em endpoints de auth
- [ ] Deploy na Vercel

## 📚 Documentação Adicional

- `app/docs/GITHUB_CONNECT.md` - Configurar integração GitHub (callback OAuth)
- `TODO.md` - Checklist do projeto e roadmap

## 📄 Licença

MIT
