# Conectar GitHub (Selecionar repositório)

Ao clicar em "Selecionar projeto GitHub" no Timer, o app redireciona para o GitHub OAuth para pedir permissão de leitura aos seus repositórios.

## Erro: "redirect_uri is not associated with this application"

Esse erro aparece quando a **Authorization callback URL** do seu OAuth App no GitHub não está correta.

### Passo a passo para corrigir

1. Acesse [GitHub Developer Settings – OAuth Apps](https://github.com/settings/developers)
2. Clique no OAuth App que está usando (ou crie um novo)
3. Em **Authorization callback URL**, adicione **exatamente**:
   - Desenvolvimento: `http://localhost:3000/api/github/callback`
   - Produção: `https://seu-dominio.com/api/github/callback`
4. Clique em **Update application**

### Verificações

- A URL deve ser **idêntica** (incluindo http/https, porta, ausência de barra no final)
- Em desenvolvimento, use `http://` (não `https://`)
- Em produção, use `https://`

### Variáveis no .env.local

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
GITHUB_CLIENT_ID=seu-client-id
GITHUB_CLIENT_SECRET=seu-client-secret
```

Se `NEXT_PUBLIC_APP_URL` não estiver definido, o app usa `http://localhost:3000` como padrão.
