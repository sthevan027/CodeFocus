# ⚡ CodeFocus

<div align="center">

![CodeFocus Logo](https://img.shields.io/badge/CodeFocus-Desktop%20App-blue?style=for-the-badge&logo=electron)
![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey?style=for-the-badge&logo=windows)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Produtividade Dev no Ritmo do Código** 🚀

*Um aplicativo desktop inteligente que combina a técnica Pomodoro com integração Git para maximizar sua produtividade como desenvolvedor.*

[![Demo](https://img.shields.io/badge/Demo-Em%20Desenvolvimento-orange?style=for-the-badge)](https://github.com/seu-usuario/codefocus)
[![Downloads](https://img.shields.io/badge/Downloads-Em%20Breve-blue?style=for-the-badge)](https://github.com/seu-usuario/codefocus/releases)

</div>

---

## 🎯 O que é o CodeFocus?

CodeFocus é um aplicativo desktop (.exe) criado especificamente para **programadores** que buscam foco, disciplina e produtividade. Ele combina ciclos inteligentes de trabalho com integração contextual ao Git, permitindo registrar commits automaticamente ao final de cada ciclo – apenas quando você realmente está voltando ao código.

### 🌟 Por que usar o CodeFocus?

- **🎯 Foco Real**: Timer Pomodoro com nomeação personalizada de cada ciclo
- **🧠 Git Inteligente**: Commits automáticos baseados no seu trabalho real
- **📊 Produtividade Mensurável**: Relatórios e estatísticas detalhadas
- **🎨 Interface Moderna**: Design glassmorphism com tema dark/light
- **⚡ Desktop Nativo**: Aplicativo nativo, rápido e confiável

---

## ✨ Funcionalidades Principais

### 🕒 Timer Pomodoro Inteligente
- **Ciclos Padrão**: 25min foco / 5min pausa / 15min pausa longa
- **Progress Ring**: Visualização circular do progresso em tempo real
- **Nomeação Personalizada**: Cada ciclo pode ter um nome específico
- **Controles Intuitivos**: Start, pause, reset e skip com um clique

### 🧠 Integração Git Contextual
- **Detecção Automática**: Identifica repositórios Git automaticamente
- **Commits Inteligentes**: Sugere commits baseados nas mudanças reais
- **Confirmação Segura**: Sempre confirma antes de fazer commit
- **Push Opcional**: Configuração para push automático (GitHub/GitLab)

### 📊 Produtividade Avançada
- **Relatórios Diários**: Resumos automáticos em formato .txt
- **Histórico Persistente**: Dados salvos localmente em JSON
- **Estatísticas Detalhadas**: Tempo total, ciclos completos, interrupções
- **Dashboard Futuro**: Visualizações gráficas de produtividade

### 🎨 Interface Moderna
- **Design Glassmorphism**: Visual moderno e elegante
- **Tema Adaptativo**: Dark/light mode automático
- **Animações Suaves**: Transições com Framer Motion
- **Notificações Desktop**: Alertas nativos do Windows

---

## 🚀 Como Usar

### 📥 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/codefocus.git
cd codefocus

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run electron-dev
```

### 🏗️ Build para Produção

```bash
# Gere o executável (.exe)
npm run electron-pack

# O arquivo .exe será criado em dist/
```

### 🎯 Primeiros Passos

1. **Inicie o CodeFocus** - O app detectará automaticamente se você está em um repositório Git
2. **Nomeie seu ciclo** - Digite o que você vai fazer (ex: "Refatorar API Login")
3. **Foque por 25 minutos** - O timer mostrará seu progresso
4. **Decida continuar** - Ao final, escolha se vai continuar programando
5. **Commit automático** - Se sim, o CodeFocus fará o commit das suas mudanças

---

## 🛠️ Stack Tecnológica

<div align="center">

| Área | Tecnologia |
|------|------------|
| **Plataforma** | ![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white) |
| **Frontend** | ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) |
| **Animações** | ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) |
| **Git Integration** | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) |
| **Build** | ![Electron Builder](https://img.shields.io/badge/Electron_Builder-47848F?style=for-the-badge&logo=electron&logoColor=white) |

</div>

---

## 📁 Estrutura do Projeto

```
codefocus/
├── 📚 docs/                    # Documentação técnica completa
│   ├── README.md              # Índice da documentação
│   ├── PROJETO_ESCOPO.md      # Escopo e roadmap detalhado
│   ├── DOCUMENTACAO_TECNICA.md # Arquitetura e especificações
│   ├── GIT_GUIDE.md           # Guia de boas práticas Git
│   ├── TODO.md                # Lista de tarefas atualizada
│   └── REGRAS_*.md            # Regras de desenvolvimento
├── 🌐 public/
│   ├── electron.js            # Main process do Electron
│   └── index.html             # HTML principal
├── 🧩 src/
│   ├── components/            # Componentes React
│   │   ├── Timer.jsx         # Timer principal
│   │   ├── Header.jsx        # Cabeçalho
│   │   └── Settings.jsx      # Configurações
│   ├── context/              # Contextos React
│   │   ├── ThemeContext.jsx  # Gerenciamento de tema
│   │   └── TimerContext.jsx  # Estado do timer
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utilitários
│   ├── App.jsx               # Componente principal
│   ├── index.js              # Entry point React
│   └── index.css             # Estilos globais
├── package.json
└── README.md
```

---

## 📚 Documentação

A documentação completa do projeto está organizada na pasta `docs/`:

- **[📚 Documentação Geral](./docs/README.md)** - Índice e guia de navegação
- **[🎯 Escopo do Projeto](./docs/PROJETO_ESCOPO.md)** - Detalhes completos e roadmap
- **[📐 Documentação Técnica](./docs/DOCUMENTACAO_TECNICA.md)** - Arquitetura e especificações
- **[🧠 Guia Git](./docs/GIT_GUIDE.md)** - Boas práticas e integração
- **[✅ Tarefas](./docs/TODO.md)** - Lista atualizada de tarefas
- **[📏 Regras de Desenvolvimento](./docs/)** - Padrões e convenções

---

## 🎯 Roadmap

### ✅ **MVP Inicial** (Em Desenvolvimento)
- [x] Setup Electron + React + TailwindCSS
- [x] Estrutura básica do projeto
- [ ] Timer Pomodoro com ciclos 25/5/15
- [ ] Interface glassmorphism responsiva
- [ ] Integração Git básica
- [ ] Relatórios diários

### 🚀 **Pós-MVP** (Planejado)
- [ ] Notificações desktop nativas
- [ ] Dashboard de estatísticas
- [ ] Plugins para IDEs (VS Code, IntelliJ)
- [ ] Integração com Discord/Slack
- [ ] Modo Flow com música ambiente
- [ ] Push automático para GitHub/GitLab

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! 🎉

### Como Contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Padrões de Desenvolvimento

- Leia a **[documentação técnica](./docs/DOCUMENTACAO_TECNICA.md)**
- Siga as **[regras de desenvolvimento](./docs/)**
- Mantenha o código limpo e bem documentado
- Teste suas mudanças antes de submeter

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🙏 Agradecimentos

- **Francesco Cirillo** pela técnica Pomodoro
- **Comunidade Electron e React** pelo suporte
- **Todos os contribuidores** que ajudam a melhorar o projeto

---

<div align="center">

**CodeFocus** - Transformando produtividade em código! ⚡

[![GitHub stars](https://img.shields.io/github/stars/seu-usuario/codefocus?style=social)](https://github.com/seu-usuario/codefocus)
[![GitHub forks](https://img.shields.io/github/forks/seu-usuario/codefocus?style=social)](https://github.com/seu-usuario/codefocus)
[![GitHub issues](https://img.shields.io/github/issues/seu-usuario/codefocus)](https://github.com/seu-usuario/codefocus/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/seu-usuario/codefocus)](https://github.com/seu-usuario/codefocus/pulls)

</div>