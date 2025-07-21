# 📐 Documentação Técnica – CodeFocus

## 🏗️ Arquitetura Geral

### Stack Tecnológica
- **Plataforma**: Electron.js (aplicação desktop)
- **Frontend**: React 18 + TailwindCSS + Framer Motion
- **Backend**: Node.js com integração Git
- **Armazenamento**: JSON local + LocalStorage
- **Build**: Electron Builder (.exe Windows)

### Estrutura de Pastas
```
CodeFocus/
├── src/
│   ├── components/     # Componentes React
│   ├── context/        # Context API (Timer, Theme)
│   ├── hooks/          # Custom hooks
│   ├── utils/          # Utilitários (Git, Timer)
│   └── App.jsx         # Componente principal
├── public/
│   ├── electron.js     # Processo principal Electron
│   └── index.html      # Template HTML
├── docs/               # Documentação técnica
├── history.json        # Histórico local dos ciclos
└── report-generator.js # Gerador de relatórios
```

## 🧠 Lógica Principal

### Timer Pomodoro
- **Ciclos padrão**: 25min foco / 5min pausa / 15min pausa longa
- **Controle**: `useEffect` com `setInterval`
- **Estados**: FOCUS, SHORT_BREAK, LONG_BREAK, PAUSED
- **Persistência**: LocalStorage para manter estado entre sessões

### Fluxo de Decisão
1. **Ciclo termina** → Modal de decisão
2. **Usuário escolhe** → Continuar programando?
3. **Se sim** → Detectar mudanças Git
4. **Sugerir commit** → Confirmação do usuário
5. **Executar** → `git add . && git commit`

### Integração Git
```javascript
// Exemplo de detecção de repositório
const isGitRepo = await simpleGit().checkIsRepo();

// Exemplo de commit inteligente
const commitMessage = `feat: "${cycleName}" - [${modifiedFiles}] (${duration}min)`;
```

## 🎨 Interface do Usuário

### Componentes Principais
- **TimerDisplay**: Contador visual com progresso circular
- **CycleModal**: Modal para nomear o ciclo atual
- **CommitPrompt**: Janela de decisão pós-ciclo
- **Header**: Barra superior com tema e status

### Design System
- **Tema**: Glassmorphism com dark/light mode
- **Cores**: Paleta baseada em produtividade
- **Animações**: Framer Motion para transições suaves
- **Responsividade**: Otimizado para notebooks e desktops

## 📊 Dados e Persistência

### Estrutura do Histórico
```json
{
  "2024-01-15": {
    "cycles": [
      {
        "name": "Refatorar API Login",
        "duration": 25,
        "startTime": "14:30",
        "completed": true,
        "gitCommit": "feat: Refatorar API Login (25min)"
      }
    ],
    "totalTime": 75,
    "completedCycles": 3
  }
}
```

### Relatórios Diários
- **Formato**: `.txt` simples e legível
- **Conteúdo**: Resumo de ciclos, tempo total, estatísticas
- **Localização**: Pasta do projeto com timestamp

## 🔧 Configurações

### Personalização
- **Tempos**: Customização dos intervalos Pomodoro
- **Sons**: Notificações personalizáveis
- **Git**: Configuração de push automático
- **Tema**: Preferências visuais do usuário

### Validações
- Verificação de repositório Git ativo
- Detecção de arquivos modificados
- Confirmação antes de commits automáticos
- Fallback para operações Git falhadas

---

*Esta documentação é atualizada conforme o projeto evolui.*
