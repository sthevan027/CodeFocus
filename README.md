# 🚀 CodeFocus – Produtividade Dev no Ritmo do Código

**CodeFocus** é um aplicativo desktop (.exe) criado para programadores que buscam foco, disciplina e produtividade com a técnica Pomodoro. Ele combina ciclos inteligentes de trabalho com uma integração contextual ao Git, permitindo registrar commits ao final de cada ciclo – apenas se você realmente estiver voltando ao código.

---

## 🧠 Visão Geral

- ⏱️ Timer Pomodoro com 25/5/15 min (configurável)
- ✍️ Título personalizado por ciclo
- 🔁 Histórico local em JSON
- 📜 Geração de relatório diário (`.txt`)
- 🧠 Integração com Git: commit opcional ao final do ciclo
- 🌗 Design Glassmorphism com suporte a dark mode
- ⚙️ Build em `.exe` via Electron

---

## 📸 Preview (em breve)

![CodeFocus UI](./preview.png)

---

## 📦 Tecnologias Utilizadas

| Tecnologia | Descrição |
|------------|-----------|
| [Electron.js](https://www.electronjs.org/) | Aplicativo desktop multiplataforma |
| [React](https://reactjs.org/) + [TailwindCSS](https://tailwindcss.com/) | Interface moderna e responsiva |
| [simple-git](https://www.npmjs.com/package/simple-git) | Integração com Git local |
| [Framer Motion](https://www.framer.com/motion/) | Animações fluidas e responsivas |
| Node.js | Lógica de integração com sistema e Git |

---

## 🛠️ Instalação Local (Desenvolvimento)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/codefocus.git
cd codefocus

# Instale as dependências
npm install

# Rode o app em modo desenvolvimento
npm start
