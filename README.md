# CodeFocus - Next.js + Supabase

Aplicativo de produtividade para desenvolvedores com técnica Pomodoro, integração Git e relatórios.

## 🚀 Stack Tecnológica

- **Frontend/Backend**: Next.js 14 (App Router)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT + Supabase
- **Validação**: Zod
- **Estilização**: Tailwind CSS
- **Email**: Resend

## 📁 Estrutura do Projeto

```
app/
├── pages/
│   └── api/              # API Routes (Backend)
│       ├── auth/         # Autenticação
│       ├── cycles/       # Ciclos Pomodoro
│       ├── settings/     # Configurações
│       └── reports/      # Relatórios
├── lib/                  # Utilitários
│   ├── supabase.js      # Cliente Supabase
│   ├── auth.js          # Autenticação JWT
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
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# JWT Configuration
JWT_SECRET=sua-chave-secreta-jwt-mude-em-producao
JWT_EXPIRES_IN=30m

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (Resend) - Opcional
RESEND_API_KEY=sua-chave-resend
MAIL_FROM=noreply@seudominio.com

# Node Environment
NODE_ENV=development
```

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

- **users**: Usuários do sistema
- **user_settings**: Configurações do usuário
- **cycles**: Ciclos Pomodoro
- **reports**: Relatórios de produtividade

### Row Level Security (RLS)

O schema inclui políticas RLS básicas. Para usar autenticação do Supabase Auth, você precisará ajustar as políticas para usar `auth.uid()`.

### Executar Schema

1. Acesse o SQL Editor no Supabase Dashboard
2. Cole o conteúdo de `supabase/schema.sql`
3. Execute o script

## 🔐 Autenticação

O sistema usa JWT para autenticação. As rotas protegidas requerem o header:

```
Authorization: Bearer <token>
```

### Endpoints de Autenticação

- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Obter usuário atual
- `POST /api/auth/send-verification` - Reenviar código de verificação
- `POST /api/auth/verify-email` - Verificar email

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
    const userId = await requireAuth(req)
    // userId contém o ID do usuário autenticado
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

- [ ] Integrar frontend React com as novas rotas Next.js
- [ ] Implementar envio de emails via Resend
- [ ] Adicionar testes
- [ ] Configurar CI/CD
- [ ] Deploy na Vercel

## 📄 Licença

MIT
