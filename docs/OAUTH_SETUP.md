# 🔐 Guia de Configuração OAuth - CodeFocus

## 📋 Pré-requisitos

Para usar autenticação real com Google e GitHub, você precisa:

1. **Conta Google** (para Google OAuth)
2. **Conta GitHub** (para GitHub OAuth)
3. **Acesso à internet** (para autorização)

## 🚀 Configuração Rápida

### 1. Criar Arquivo .env

Copie o arquivo `env.example` para `.env`:

```bash
cp env.example .env
```

### 2. Configurar Google OAuth

#### Passo a Passo:

1. **Acesse o Google Cloud Console**
   - Vá para: https://console.cloud.google.com
   - Faça login com sua conta Google

2. **Criar/Selecionar Projeto**
   - Clique no seletor de projetos no topo
   - Clique em "Novo Projeto" ou selecione um existente

3. **Habilitar APIs**
   - Vá para "APIs & Services" > "Library"
   - Procure por "Google+ API" e habilite

4. **Criar Credenciais OAuth**
   - Vá para "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "OAuth 2.0 Client IDs"
   - Selecione "Web application"

5. **Configurar OAuth**
   - **Nome**: CodeFocus
   - **URIs de redirecionamento autorizadas**:
     ```
     http://localhost:3000
     http://localhost:3000/
     ```
   - **JavaScript origins**:
     ```
     http://localhost:3000
     ```

6. **Copiar Credenciais**
   - Anote o **Client ID** e **Client Secret**
   - Adicione ao arquivo `.env`

### 3. Configurar GitHub OAuth

#### Passo a Passo:

1. **Acesse GitHub Developers**
   - Vá para: https://github.com/settings/developers
   - Faça login com sua conta GitHub

2. **Criar OAuth App**
   - Clique em "New OAuth App"
   - Preencha os dados:
     - **Application name**: CodeFocus
     - **Homepage URL**: `http://localhost:3000`
     - **Application description**: App de produtividade para desenvolvedores
     - **Authorization callback URL**: `http://localhost:3000`

3. **Copiar Credenciais**
   - Anote o **Client ID** e **Client Secret**
   - Adicione ao arquivo `.env`

### 4. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
REACT_APP_GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000

# GitHub OAuth
REACT_APP_GITHUB_CLIENT_ID=abcdef123456789
REACT_APP_GITHUB_CLIENT_SECRET=abcdef123456789abcdef123456789
REACT_APP_GITHUB_REDIRECT_URI=http://localhost:3000
```

### 5. Reiniciar o App

```bash
npm start
```

## 🔧 Configuração para Produção

### Google OAuth (Produção):

1. **Adicionar URIs de Produção**
   - No Google Cloud Console, adicione:
     ```
     https://seudominio.com
     https://seudominio.com/
     ```

2. **Atualizar .env**
   ```env
   REACT_APP_GOOGLE_REDIRECT_URI=https://seudominio.com
   ```

### GitHub OAuth (Produção):

1. **Atualizar OAuth App**
   - No GitHub, edite o OAuth App
   - **Homepage URL**: `https://seudominio.com`
   - **Authorization callback URL**: `https://seudominio.com`

2. **Atualizar .env**
   ```env
   REACT_APP_GITHUB_REDIRECT_URI=https://seudominio.com
   ```

## 🛠️ Solução de Problemas

### Erro: "OAuth não configurado"

**Causa**: Variáveis de ambiente não configuradas
**Solução**: 
1. Verifique se o arquivo `.env` existe
2. Confirme se as credenciais estão corretas
3. Reinicie o app

### Erro: "redirect_uri_mismatch"

**Causa**: URI de redirecionamento não configurada
**Solução**:
1. Verifique se a URI está correta no Google/GitHub
2. Confirme se está igual no `.env`

### Erro: "invalid_client"

**Causa**: Client ID ou Secret incorretos
**Solução**:
1. Verifique se copiou as credenciais corretamente
2. Confirme se não há espaços extras

## 🔒 Segurança

### ✅ Boas Práticas:

- ✅ Nunca commite o arquivo `.env`
- ✅ Use variáveis de ambiente em produção
- ✅ Mantenha as chaves secretas seguras
- ✅ Configure URIs de redirecionamento corretas

### ❌ Evite:

- ❌ Commitar credenciais no Git
- ❌ Usar credenciais de desenvolvimento em produção
- ❌ Compartilhar chaves secretas
- ❌ Usar URIs de redirecionamento incorretas

## 📱 Testando

1. **Inicie o app**: `npm start`
2. **Clique em "Continuar com Google"**
3. **Autorize o app no Google**
4. **Verifique se o login funcionou**

## 🎯 Status Atual

- ✅ **Estrutura OAuth**: Implementada
- ✅ **Interface**: Pronta
- ✅ **Configuração**: Documentada
- ⚠️ **Credenciais**: Precisam ser configuradas
- ⚠️ **Backend**: Opcional para produção

## 📞 Suporte

Se encontrar problemas:

1. Verifique se todas as credenciais estão corretas
2. Confirme se as URIs de redirecionamento estão configuradas
3. Teste com o modo anônimo primeiro
4. Verifique os logs do console para erros

---

**Nota**: Este guia assume que você está usando o app em desenvolvimento (`localhost:3000`). Para produção, substitua as URLs pelos seus domínios reais. 