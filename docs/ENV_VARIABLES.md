# 🔧 Variáveis de Ambiente - CodeFocus

## 📋 **Visão Geral**
Este documento descreve todas as variáveis de ambiente necessárias para configurar o CodeFocus corretamente.

## 🚀 **Configuração Rápida**

### **1. Copiar o arquivo de exemplo**
```bash
cp env.example .env
```

### **2. Editar as variáveis**
```bash
# Edite o arquivo .env com suas credenciais
nano .env
```

## 📝 **Variáveis de Ambiente**

### **🔗 Configurações da API**
```env
# URL da API backend (opcional - app funciona sem backend)
REACT_APP_API_URL=http://localhost:8000
```

### **🔐 OAuth - Google**
```env
# Client ID do Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here

# Client Secret do Google OAuth
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# URI de redirecionamento do Google
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
```

### **🎵 OAuth - Spotify**
```env
# Client ID do Spotify
REACT_APP_SPOTIFY_CLIENT_ID=your-spotify-client-id-here

# Client Secret do Spotify
REACT_APP_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret-here

# URI de redirecionamento do Spotify
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify/callback
```

### **🗄️ Backend (Opcional)**
```env
# URL do banco de dados PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/codefocus_db

# Chave secreta para JWT
SECRET_KEY=your-secret-key-here

# Algoritmo de criptografia
ALGORITHM=HS256

# Tempo de expiração do token (minutos)
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### **🌐 URLs da Aplicação**
```env
# URL do backend
BACKEND_URL=http://localhost:8000

# URL do frontend
FRONTEND_URL=http://localhost:3000
```

## 🔧 **Configuração por Funcionalidade**

### **✅ Funcionalidades que Funcionam SEM Backend**
- ✅ Login com email/senha (localStorage)
- ✅ Registro de usuário (localStorage)
- ✅ Timer Pomodoro
- ✅ Dashboard de produtividade
- ✅ Tags e notas
- ✅ Configurações do usuário

### **🔐 Funcionalidades que Precisam de OAuth**
- 🔐 **Google OAuth**: Login com Google
- 🎵 **Spotify OAuth**: Integração com Spotify

### **🗄️ Funcionalidades que Precisam de Backend**
- 🗄️ **Backend**: Login/registro com banco de dados
- 🗄️ **Backend**: Sincronização de dados
- 🗄️ **Backend**: Autenticação JWT

## 🎯 **Configuração Mínima**

### **Para usar apenas o frontend:**
```env
# Apenas estas variáveis são necessárias
REACT_APP_API_URL=http://localhost:8000
```

### **Para usar Google OAuth:**
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_GOOGLE_CLIENT_SECRET=your-google-client-secret-here
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
```

### **Para usar Spotify:**
```env
REACT_APP_SPOTIFY_CLIENT_ID=your-spotify-client-id-here
REACT_APP_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret-here
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify/callback
```

## 🚨 **Troubleshooting**

### **Erro: "Google OAuth não configurado"**
```env
# Adicione estas variáveis
REACT_APP_GOOGLE_CLIENT_ID=seu_client_id_aqui
REACT_APP_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
```

### **Erro: "Spotify não configurado"**
```env
# Adicione estas variáveis
REACT_APP_SPOTIFY_CLIENT_ID=seu_spotify_client_id_aqui
REACT_APP_SPOTIFY_CLIENT_SECRET=seu_spotify_client_secret_aqui
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify/callback
```

### **Erro: "Backend não disponível"**
```env
# O app funciona sem backend, mas se quiser usar:
REACT_APP_API_URL=http://localhost:8000
```

## 📚 **Guias de Configuração**

### **Google OAuth:**
- 📖 [Guia Google OAuth](docs/GOOGLE_OAUTH_SETUP.md)

### **Spotify OAuth:**
- 📖 [Guia Spotify OAuth](docs/SPOTIFY_SETUP.md)

### **Backend:**
- 📖 [Documentação Backend](docs/DOCUMENTACAO_BACKEND.md)

## 🔒 **Segurança**

### **⚠️ Importante:**
- ❌ **NUNCA** commite o arquivo `.env` no Git
- ✅ **SEMPRE** use `.env.example` como template
- 🔒 **MANTENHA** suas chaves secretas seguras
- 🔄 **ROTACIONE** suas chaves regularmente

### **Arquivo .gitignore:**
```gitignore
# Variáveis de ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## 🚀 **Deploy**

### **Para Produção:**
```env
# URLs de produção
REACT_APP_API_URL=https://api.codefocus.com
REACT_APP_GOOGLE_REDIRECT_URI=https://codefocus.com
REACT_APP_SPOTIFY_REDIRECT_URI=https://codefocus.com/spotify/callback
FRONTEND_URL=https://codefocus.com
BACKEND_URL=https://api.codefocus.com
```

### **Para Desenvolvimento:**
```env
# URLs de desenvolvimento
REACT_APP_API_URL=http://localhost:8000
REACT_APP_GOOGLE_REDIRECT_URI=http://localhost:3000
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify/callback
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
``` 