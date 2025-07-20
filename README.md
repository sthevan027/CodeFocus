# ⚡ CodeFocus

**Produtividade Dev no Ritmo do Código**

CodeFocus é um aplicativo desktop (.exe) criado para programadores que buscam foco, disciplina e produtividade com a técnica Pomodoro. Ele combina ciclos inteligentes de trabalho com uma integração contextual ao Git, permitindo registrar commits ao final de cada ciclo – apenas se você realmente estiver voltando ao código.

## 🎯 Características Principais

### 🕒 Timer Pomodoro Inteligente
- Ciclos padrão 25/5/15 minutos
- Progress ring visual animado
- Controles intuitivos (start, pause, reset, skip)
- Nome personalizado para cada ciclo de foco

### 🧠 Integração com Git
- Detecção automática de repositório Git
- Sugestão inteligente de commit ao final do ciclo
- Análise de arquivos modificados
- Push automático opcional (GitHub/GitLab)

### 📊 Produtividade Avançada
- Relatórios diários automáticos
- Histórico local persistente
- Estatísticas semanais/mensais
- Dashboard de produtividade

### 🎨 Interface Moderna
- Design glassmorphism
- Tema dark/light mode
- Animações suaves com Framer Motion
- Notificações desktop nativas

## 🚀 Como Usar

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run electron-dev
```

### Build para Produção
```bash
# Gerar executável (.exe)
npm run electron-pack
```

## 🛠️ Tecnologias

- **Plataforma**: Electron.js
- **Frontend**: React + TailwindCSS + Framer Motion
- **Lógica**: React Hooks + Context API
- **Git**: simple-git + child_process
- **Build**: Electron Builder

## 📁 Estrutura do Projeto

```
codefocus/
├── public/
│   ├── electron.js          # Main process do Electron
│   └── index.html           # HTML principal
├── src/
│   ├── components/          # Componentes React
│   │   ├── Timer.jsx        # Timer principal
│   │   ├── Header.jsx       # Cabeçalho
│   │   └── Settings.jsx     # Configurações
│   ├── context/             # Contextos React
│   │   ├── ThemeContext.jsx # Gerenciamento de tema
│   │   └── TimerContext.jsx # Estado do timer
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utilitários
│   ├── App.jsx              # Componente principal
│   ├── index.js             # Entry point React
│   └── index.css            # Estilos globais
├── package.json
└── README.md
```

## 🎯 Roadmap

### ✅ Etapa 1: Setup Inicial
- [x] Configurar Electron + React + TailwindCSS
- [x] Estrutura básica do projeto

### ⏳ Etapa 2: Timer Pomodoro
- [ ] Lógica de ciclos (25/5/15)
- [ ] Controles e progress ring
- [ ] Transições entre ciclos

### ⏳ Etapa 3: Interface e UX
- [ ] Componentes principais
- [ ] Tema dark/light
- [ ] Animações

### ⏳ Etapa 4: Integração Git
- [ ] Detecção de repositório
- [ ] Modal de commit
- [ ] Commit automático

### ⏳ Etapa 5: Funcionalidades Avançadas
- [ ] Notificações desktop
- [ ] Estatísticas
- [ ] Relatórios

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- Técnica Pomodoro por Francesco Cirillo
- Comunidade Electron e React
- Todos os contribuidores

---

**CodeFocus** - Transformando produtividade em código! ⚡