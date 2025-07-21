📄 Escopo do Projeto – CodeFocus (.exe)

🧠 Nome Oficial:
CodeFocus – Produtividade Dev no Ritmo do Código

🎯 Objetivo do Projeto
Desenvolver um aplicativo desktop (.exe) com foco em produtividade para programadores, baseado na técnica Pomodoro. O diferencial é a integração inteligente com Git, permitindo registrar commits ao final de cada ciclo de foco, caso o usuário esteja retornando à programação.

🧩 Funcionalidades do MVP
Funcionalidade	Descrição
🕒 Timer Pomodoro	Ciclos padrão 25/5/15 com controle e progressão
🎯 Nome Personalizado do Ciclo	Usuário define título do foco atual
🧠 Integração com Git	Sugestão de commit ao final do ciclo, apenas se continuar codando
📜 Relatório Diário	Geração automática de .txt com resumo dos ciclos
💾 Histórico Local	JSON com registros por dia, nome e status
🌗 Tema Visual	Glassmorphism com dark/light mode
⚙️ Configurações	Personalização dos tempos e comportamento dos commits
🔔 Notificações Desktop	Alertas sonoros e visuais quando o ciclo termina
💻 Integração com IDEs	Plugins para VS Code, IntelliJ e outros editores
📊 Estatísticas Avançadas	Relatórios semanais/mensais de produtividade
🔍 Detecção de Mudanças	Análise automática de arquivos modificados no Git
🤖 Commit Inteligente	Sugestão de mensagem baseada nas mudanças detectadas
☁️ Push Automático	Integração com GitHub/GitLab para push opcional

📘 Documento Técnico – CodeFocus
📁 Estrutura de Pastas
csharp
Copiar
Editar
codefocus/
├── public/
├── src/
│   ├── components/       # Timer, Modal, Header, etc.
│   ├── context/          # CicloContext, ThemeContext
│   ├── hooks/            # useTimer, useGitIntegration
│   ├── utils/            # fileUtils.js, gitUtils.js
│   ├── App.jsx
│   └── main.js           # Electron main
├── history.json          # Armazena localmente os ciclos
├── report-generator.js   # Geração do relatório
├── electron-builder.json
└── package.json
🛠️ Tecnologias Utilizadas
Área	Stack
Plataforma	Electron.js
UI/UX	React + TailwindCSS + Framer Motion
Lógica	React Hooks + Context API
Git	simple-git + child_process
Armazenamento	JSON local + LocalStorage
Build	Electron Builder (.exe Windows)

�� Integração com Git (Melhorada)
Lógica:

Verifica se a pasta ativa é um repositório Git.

Detecta automaticamente arquivos modificados durante o ciclo.

Ao finalizar um ciclo Pomodoro:

Pergunta se o usuário vai continuar programando.

Se sim, analisa as mudanças e sugere commit inteligente:

arduino
Copiar
Editar
feat: "Título do Ciclo" - [arquivos modificados] (25min)
Exemplo: feat: "Refatorar API Login" - [src/api/login.js, tests/login.test.js] (25min)

Confirma antes de executar git add . && git commit.

Push automático opcional via configuração (GitHub/GitLab).

📜 Relatório Diário (Exemplo)
arduino
Copiar
Editar
📅 CodeFocus – Relatório 20/07/2025

✅ Refatorar API Login – 25min
✅ Finalizar Componente Header – 25min
🔁 Criar teste de integração – 12min (interrompido)

Total: 2 ciclos completos / 1 interrompido
Tempo total: 62min
🧪 Testes
Validação de commit manual

Detectar ausência de repositório Git

Controle de múltiplos ciclos

Geração do relatório e persistência de histórico

🔐 Segurança
Integração 100% local

Nada enviado para nuvem

Push opcional com aviso

🔔 Notificações Desktop
Sistema de notificações nativas do Windows:
- Som personalizável para início/fim de ciclo
- Notificação visual com opção de pausar/continuar
- Integração com área de trabalho do Windows

💻 Integração com IDEs
Plugins para editores populares:
- VS Code: Extensão para controle direto do timer
- IntelliJ/WebStorm: Plugin para integração nativa
- Atalhos de teclado para controle rápido
- Status bar integration

📊 Estatísticas Avançadas
Dashboard de produtividade:
- Gráficos semanais/mensais de tempo focado
- Comparação de produtividade entre períodos
- Análise de padrões de trabalho
- Exportação de relatórios em PDF

🗓️ Roadmap Atualizado
Etapa	Tarefa
✅ 1	Setup de projeto (Electron + React + Tailwind)
⏳ 2	Lógica do Timer Pomodoro com ciclo visual
⏳ 3	Interface com Modal de Commit
⏳ 4	Integração com Git (detecção e commit)
⏳ 5	Armazenamento + relatório
⏳ 6	Notificações desktop e sons
⏳ 7	Detecção automática de mudanças Git
⏳ 8	Sistema de estatísticas avançadas
⏳ 9	Integração com IDEs (VS Code primeiro)
⏳ 10	Push automático GitHub/GitLab
⏳ 11	Build final para .exe com Electron Builder
