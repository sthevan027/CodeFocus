# 🗄️ Arquitetura de Dados - CodeFocus

## 📋 **Visão Geral**
O CodeFocus agora usa **dados reais** do banco de dados, sem nenhum dado simulado ou fake. A aplicação tenta usar o backend primeiro, e se não estiver disponível, usa localStorage como fallback.

## 🔄 **Fluxo de Dados**

### **1. Autenticação**
```
Frontend → Backend (prioridade) → localStorage (fallback)
```

#### **Login com Email/Senha:**
- ✅ **Tenta backend primeiro** (`apiService.login()`)
- ✅ **Se backend falha** → usa localStorage
- ✅ **Dados reais** do banco quando disponível
- ✅ **Fallback local** quando backend offline

#### **Login com Google:**
- ✅ **OAuth real** do Google
- ✅ **Sem dados simulados**
- ✅ **Falha natural** se não configurado
- ✅ **Erros claros** no console

### **2. Registro de Usuário**
```
Frontend → Backend (prioridade) → localStorage (fallback)
```

- ✅ **Tenta backend primeiro** (`apiService.register()`)
- ✅ **Se backend falha** → usa localStorage
- ✅ **Validação real** de email duplicado
- ✅ **Hash de senha** no backend (quando disponível)

### **3. Atualização de Perfil**
```
Frontend → Backend (prioridade) → localStorage (fallback)
```

- ✅ **Tenta backend primeiro** (`apiService.updateProfile()`)
- ✅ **Se backend falha** → atualiza localStorage
- ✅ **Sincronização** entre frontend e backend

## 🗂️ **Estrutura de Dados**

### **Backend (SQLite)**
```sql
-- Tabela de usuários
users (
  id INTEGER PRIMARY KEY,
  name VARCHAR,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  provider VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Tabela de sessões
sessions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INTEGER,
  tags TEXT,
  notes TEXT
)
```

### **Frontend (localStorage)**
```javascript
// Usuários
'codefocus-users': [
  {
    id: 'local_1234567890',
    name: 'Nome Real',
    email: 'email@real.com',
    password: 'senha_real',
    provider: 'email',
    loginTime: '2024-01-01T00:00:00.000Z'
  }
]

// Dados do usuário atual
'codefocus-user': {
  id: 'local_1234567890',
  name: 'Nome Real',
  email: 'email@real.com',
  provider: 'email'
}
```

## 🔧 **Configuração**

### **Backend (Opcional)**
```bash
cd backend
pip install -r requirements.txt
python3.11 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend (Sempre Funciona)**
```bash
npm start
```

## ✅ **Benefícios**

### **1. Dados Reais**
- ❌ **Sem dados simulados**
- ❌ **Sem fallbacks fake**
- ✅ **Dados reais do banco**
- ✅ **Dados reais do Google OAuth**

### **2. Flexibilidade**
- ✅ **Funciona com backend**
- ✅ **Funciona sem backend**
- ✅ **Transição suave**
- ✅ **Sem perda de dados**

### **3. Segurança**
- ✅ **Hash de senhas** (backend)
- ✅ **Validação real** de emails
- ✅ **Tokens JWT** (backend)
- ✅ **CORS configurado**

### **4. Performance**
- ✅ **Cache local** para dados
- ✅ **Sincronização** automática
- ✅ **Offline support**
- ✅ **Carregamento rápido**

## 🚨 **Tratamento de Erros**

### **Backend Indisponível**
```
Console: "AuthContext: Backend não disponível, usando localStorage..."
Interface: Funciona normalmente com dados locais
```

### **Google OAuth Não Configurado**
```
Console: "❌ Google Auth não inicializado"
Console: "💡 Configure o Google OAuth seguindo o guia em docs/GOOGLE_OAUTH_SETUP.md"
Interface: "Google OAuth não configurado. Use login com email ou configure o OAuth."
```

### **Dados Inválidos**
```
Console: "Erro na API: [detalhes do erro]"
Interface: "Erro ao conectar com o servidor"
```

## 📊 **Monitoramento**

### **Console Logs**
- ✅ **Tentativas de backend**
- ✅ **Fallbacks para localStorage**
- ✅ **Erros de OAuth**
- ✅ **Sucessos de autenticação**

### **Indicadores Visuais**
- ✅ **Loading states**
- ✅ **Mensagens de erro**
- ✅ **Feedback de sucesso**
- ✅ **Status de conexão**

## 🔄 **Migração de Dados**

### **localStorage → Backend**
1. **Backend online** → dados migrados automaticamente
2. **Login/registro** → dados salvos no banco
3. **Perfil atualizado** → sincronização automática

### **Backend → localStorage**
1. **Backend offline** → fallback automático
2. **Dados preservados** no localStorage
3. **Funcionalidade mantida**

## 🎯 **Resultado Final**

### **✅ Dados 100% Reais**
- ❌ Nenhum dado simulado
- ❌ Nenhum fallback fake
- ✅ Dados reais do banco
- ✅ Dados reais do Google
- ✅ Dados reais do usuário

### **✅ Funcionalidade Completa**
- ✅ Login com email/senha
- ✅ Login com Google OAuth
- ✅ Registro de usuário
- ✅ Atualização de perfil
- ✅ Dashboard com dados reais
- ✅ Spotify integration
- ✅ Timer com dados reais

### **✅ Experiência Consistente**
- ✅ Interface responsiva
- ✅ Feedback claro
- ✅ Tratamento de erros
- ✅ Performance otimizada 