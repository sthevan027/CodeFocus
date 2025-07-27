# 🎵 Configuração da Integração Spotify

## 📋 Pré-requisitos

1. **Conta Spotify Premium** (necessária para controle de reprodução)
2. **Acesso ao Spotify Developer Dashboard**

## 🔧 Configuração do Spotify Developer

### 1. Criar Aplicação no Spotify Developer

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Faça login com sua conta Spotify
3. Clique em **"Create App"**
4. Preencha os dados:
   - **App name**: `CodeFocus`
   - **App description**: `App de produtividade com integração Spotify`
   - **Website**: `http://localhost:3000`
   - **Redirect URI**: `http://localhost:3000/spotify/callback`
   - **API/SDKs**: Marque todas as opções

### 2. Configurar Redirect URIs

Na página da sua aplicação, adicione os seguintes Redirect URIs:
- `http://localhost:3000/spotify/callback`
- `http://localhost:3000/callback`
- `http://localhost:3000`

### 3. Obter Credenciais

1. Anote o **Client ID** da sua aplicação
2. O **Client Secret** não é necessário para este tipo de integração

## 🔧 Configuração no CodeFocus

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
REACT_APP_SPOTIFY_CLIENT_ID=seu_client_id_aqui
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:3000/spotify/callback
```

### 2. Atualizar Configuração

No arquivo `src/config/spotify.js`, substitua:

```javascript
CLIENT_ID: process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'seu_client_id_aqui',
```

## 🚀 Como Usar

### 1. Conectar Spotify

1. Clique no ícone 🎵 no header
2. Clique em **"Conectar Spotify"**
3. Autorize o CodeFocus no Spotify
4. Você será redirecionado de volta ao app

### 2. Controles Disponíveis

#### **Controle Principal (Modal)**
- **Música atual** com informações completas
- **Controles de reprodução** (play/pause, anterior, próximo)
- **Controle de volume**
- **Lista de playlists** para tocar
- **Desconectar** da conta

#### **Controle Rápido (Timer)**
- **Botão flutuante** no canto inferior direito
- **Controles básicos** (play/pause, próximo)
- **Informações da música** atual
- **Status** de reprodução

### 3. Funcionalidades

#### **Durante o Foco**
- **Controle rápido** sem sair do timer
- **Música ambiente** para concentração
- **Playlists de foco** predefinidas

#### **Integração com Sessões**
- **Música automática** ao iniciar foco
- **Pausa automática** durante pausas
- **Histórico** de músicas por sessão

## 🎯 Playlists Recomendadas

### Para Foco
- **Lo-Fi Beats**
- **Classical Music**
- **Nature Sounds**
- **White Noise**

### Para Pausas
- **Upbeat Music**
- **Pop Hits**
- **Rock Classics**

## 🔒 Permissões Necessárias

O app solicita as seguintes permissões:

- **user-read-private**: Ler informações do perfil
- **user-read-email**: Ler email da conta
- **user-read-playback-state**: Ver estado da reprodução
- **user-modify-playback-state**: Controlar reprodução
- **user-read-currently-playing**: Ver música atual
- **playlist-read-private**: Ler playlists privadas
- **playlist-modify-public**: Modificar playlists públicas
- **playlist-modify-private**: Modificar playlists privadas

## 🐛 Solução de Problemas

### Erro de Autenticação
1. Verifique se o Client ID está correto
2. Confirme se o Redirect URI está configurado
3. Limpe o cache do navegador

### Controle Não Funciona
1. Verifique se tem Spotify Premium
2. Confirme se o Spotify está aberto
3. Tente reconectar a conta

### Música Não Toca
1. Verifique se o Spotify está ativo
2. Confirme se há música na fila
3. Tente pausar e tocar novamente

## 📱 Compatibilidade

- ✅ **Spotify Desktop** (Windows, Mac, Linux)
- ✅ **Spotify Web Player**
- ⚠️ **Spotify Mobile** (limitado)

## 🔄 Atualizações

Para atualizar a integração:

1. **Reinicie o app** após mudanças
2. **Reconecte** a conta Spotify se necessário
3. **Limpe cache** se houver problemas

## 📞 Suporte

Se encontrar problemas:

1. Verifique a documentação oficial do Spotify
2. Confirme as configurações de rede
3. Teste em outro navegador
4. Verifique logs do console

---

**Nota**: Esta integração requer Spotify Premium para funcionar corretamente. 