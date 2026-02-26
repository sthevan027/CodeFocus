# Configurar login com Google e GitHub

## Erro: "Unsupported provider: provider is not enabled"

Esse erro indica que o provedor OAuth não está habilitado no Supabase.

### Passos para habilitar o Google

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard) e selecione seu projeto.
2. Vá em **Authentication** > **Providers**.
3. Clique em **Google** e ative o toggle.
4. No [Google Cloud Console](https://console.cloud.google.com):
   - Crie um projeto (ou use um existente).
   - Vá em **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth client ID**.
   - Tipo: **Web application**.
   - **Authorized JavaScript origins:** `http://localhost:3000` e sua URL de produção.
   - **Authorized redirect URIs:** `https://SEU-PROJECT-ID.supabase.co/auth/v1/callback`
5. Copie o **Client ID** e **Client Secret** e cole no Supabase (Provider Google).

### Passos para habilitar o GitHub

1. Em **Authentication** > **Providers** no Supabase, clique em **GitHub**.
2. No [GitHub Developer Settings](https://github.com/settings/developers):
   - Crie um OAuth App.
   - **Callback URL:** `https://SEU-PROJECT-ID.supabase.co/auth/v1/callback`
3. Copie **Client ID** e **Client Secret** para o Supabase.

### Redirect URLs do app

Em **Authentication** > **URL Configuration**, adicione:

- `http://localhost:3000/auth/callback`
- `https://seu-dominio.com/auth/callback`
