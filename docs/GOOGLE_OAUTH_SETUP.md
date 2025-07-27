# 🔧 Configuração do Google OAuth

## Problema Atual
O Google OAuth está falhando porque `http://localhost:3000` não está registrado como origem autorizada no projeto do Google Cloud.

## Importante
O login do Google **NÃO FUNCIONARÁ** até que você configure o OAuth corretamente. Siga os passos abaixo para configurar.

## Para Configurar OAuth Real

### 1. Acesse o Google Cloud Console
- Vá para: https://console.cloud.google.com
- Faça login com sua conta Google

### 2. Crie um Novo Projeto (ou use existente)
- Clique em "Selecionar projeto" no topo
- Clique em "Novo projeto"
- Nome: `CodeFocus`
- Clique em "Criar"

### 3. Configure as APIs
- No menu lateral, vá em "APIs e serviços" > "Biblioteca"
- Procure e ative:
  - **Google+ API**
  - **Google Identity API**

### 4. Configure as Credenciais OAuth
- Vá em "APIs e serviços" > "Credenciais"
- Clique em "Criar credenciais" > "ID do cliente OAuth 2.0"
- Tipo de aplicativo: **Aplicativo da Web**
- Nome: `CodeFocus Web App`

### 5. Configure as Origens Autorizadas
Em "Origens JavaScript autorizadas", adicione:
```
http://localhost:3000
http://localhost:3001
https://seu-dominio.com (quando fizer deploy)
```

### 6. Configure as URIs de Redirecionamento
Em "URIs de redirecionamento autorizados", adicione:
```
http://localhost:3000
http://localhost:3000/
https://seu-dominio.com (quando fizer deploy)
```

### 7. Copie o Client ID
- Anote o **Client ID** gerado
- Substitua no arquivo `env.example`:
```
REACT_APP_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI
```

### 8. Crie o arquivo .env
```bash
cp env.example .env
```

### 9. Reinicie o servidor
```bash
npm start
```

## Verificação
Após configurar corretamente:
1. O login do Google deve funcionar sem erros no console
2. Você verá sua foto real do Google
3. Não haverá mais mensagens de erro sobre "invalid origin"
4. O botão "Continuar com Google" funcionará normalmente

## Troubleshooting

### Erro: "Not a valid origin"
- Verifique se `http://localhost:3000` está em "Origens JavaScript autorizadas"
- Aguarde alguns minutos após salvar (Google pode demorar para propagar)

### Erro: "Content Security Policy"
- O CSP já foi atualizado para permitir scripts do Google
- Se ainda houver problemas, verifique se o arquivo `public/index.html` foi atualizado

### Erro: "idpiframe_initialization_failed"
- Verifique se as APIs do Google estão ativadas
- Confirme se o Client ID está correto

## Nota Importante
O login do Google **NÃO FUNCIONARÁ** até que você configure o OAuth corretamente. Use o login com email/senha enquanto configura o Google OAuth. 