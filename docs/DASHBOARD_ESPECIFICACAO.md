# 📊 Dashboard de Produtividade - Especificação

## 🎯 Visão Geral

O Dashboard de Produtividade é uma tela separada que permite visualizar, analisar e gerenciar toda a atividade de foco do usuário. Inspirado em ferramentas como RescueTime e Toggl, mas focado especificamente na técnica Pomodoro.

## 🏗️ Estrutura do Dashboard

### 📱 Layout Principal
```
┌─────────────────────────────────────────────────────────┐
│ Header: CodeFocus | Timer | Dashboard | Settings      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │   Hoje      │ │   Semana    │ │   Mês       │      │
│  │ 4h 30m      │ │ 22h 15m     │ │ 89h 45m     │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Gráfico de Produtividade          │    │
│  │  [Chart.js - Barras/Série Temporal]           │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────┐ ┌─────────────────────────────────┐   │
│  │   Tags      │ │        Atividades Recentes     │   │
│  │ #frontend   │ │ 14:30 - Implementei o timer    │   │
│  │ #backend    │ │ 13:15 - Corrigi bug no header  │   │
│  │ #bugfix     │ │ 11:45 - Refatorei componentes  │   │
│  │ #feature    │ │ 10:30 - Adicionei notificações │   │
│  └─────────────┘ └─────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🏷️ Sistema de Tags

### 📋 Tags Padrão
- `#frontend` - Desenvolvimento frontend (azul)
- `#backend` - Desenvolvimento backend (verde)
- `#bugfix` - Correção de bugs (vermelho)
- `#feature` - Novas funcionalidades (roxo)
- `#refactor` - Refatoração de código (laranja)
- `#documentation` - Documentação (cinza)
- `#testing` - Testes (amarelo)
- `#meeting` - Reuniões (rosa)

### ⚙️ Funcionalidades das Tags
- **Cores personalizáveis** para cada tag
- **Filtros** por tag e período
- **Estatísticas** de tempo por tag
- **Sugestões** automáticas baseadas no nome da atividade
- **Tags customizadas** criadas pelo usuário

## 📊 Relatórios e Métricas

### 📈 Relatório Diário
```
Data: 20/07/2025
Tempo Total Focado: 4h 30m
Ciclos Completos: 9
Pausas: 8
Produtividade: 85%

Top Tags:
- #frontend: 2h 15m
- #bugfix: 1h 30m
- #feature: 45m

Atividades:
- 14:30 - Implementei o timer analógico
- 13:15 - Corrigi bug no header
- 11:45 - Refatorei componentes
```

### 📊 Relatório Semanal
- **Gráfico de barras** por dia da semana
- **Tendência de produtividade**
- **Comparação** com semana anterior
- **Metas** vs realização

### 📅 Relatório Mensal
- **Calendário de foco** (heatmap)
- **Resumo executivo**
- **Análise de tendências**
- **Recomendações** de melhoria

## 📝 Sistema de Notas Rápidas

### 💬 Modal Pós-Ciclo
```
┌─────────────────────────────────────────┐
│           O que você fez?              │
├─────────────────────────────────────────┤
│                                         │
│ [Campo de texto grande]                │
│                                         │
│ Tags: [#frontend] [#bugfix] [+ Nova]   │
│                                         │
│ Tempo: 25m | Ciclo: 3/4               │
│                                         │
│ [Salvar] [Pular] [Cancelar]           │
└─────────────────────────────────────────┘
```

### 📋 Funcionalidades das Notas
- **Editor de texto** simples e rápido
- **Sugestão de tags** baseada no texto
- **Timestamp** automático
- **Integração** com sistema de commits Git
- **Busca** e filtros nas notas
- **Exportação** em JSON/CSV

## 🎨 Interface e UX

### 🎯 Cards de Estatísticas
```css
.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}
```

### 📊 Gráficos
- **Chart.js** para visualizações
- **Responsivo** para diferentes telas
- **Tema escuro** consistente
- **Animações** suaves

### 🔍 Filtros e Busca
- **Filtro por período** (hoje, semana, mês, custom)
- **Filtro por tags**
- **Busca por texto** nas notas
- **Ordenação** por data, tempo, tags

## 💾 Estrutura de Dados

### 📄 JSON de Atividade
```json
{
  "id": "2025-07-20-14-30",
  "timestamp": "2025-07-20T14:30:00Z",
  "duration": 1500,
  "phase": "focus",
  "cycleName": "Implementação do timer",
  "tags": ["frontend", "feature"],
  "notes": "Implementei o timer analógico com ponteiros animados",
  "productivity": 85
}
```

### 📊 JSON de Relatório
```json
{
  "date": "2025-07-20",
  "totalFocusTime": 16200,
  "totalCycles": 9,
  "totalBreaks": 8,
  "tags": {
    "frontend": 8100,
    "bugfix": 5400,
    "feature": 2700
  },
  "activities": [...],
  "productivity": 85
}
```

## 🚀 Implementação

### 📋 Fases de Desenvolvimento

#### Fase 1: Estrutura Básica
- [ ] Criar componente Dashboard
- [ ] Implementar navegação entre Timer/Dashboard
- [ ] Estrutura de dados básica
- [ ] Cards de estatísticas principais

#### Fase 2: Sistema de Tags
- [ ] Componente de tags
- [ ] Cores e estilos
- [ ] Filtros por tag
- [ ] Sugestões automáticas

#### Fase 3: Relatórios
- [ ] Relatório diário
- [ ] Gráficos com Chart.js
- [ ] Relatório semanal
- [ ] Relatório mensal

#### Fase 4: Notas Rápidas
- [ ] Modal pós-ciclo
- [ ] Editor de notas
- [ ] Integração com Git
- [ ] Busca e filtros

#### Fase 5: Polimento
- [ ] Animações e transições
- [ ] Responsividade
- [ ] Performance
- [ ] Testes

## 🎯 Benefícios

### 📈 Para o Usuário
- **Visibilidade** completa da produtividade
- **Insights** sobre padrões de trabalho
- **Motivação** através de progresso visual
- **Organização** com sistema de tags
- **Histórico** detalhado de atividades

### 🎯 Para o Projeto
- **Diferencial** competitivo
- **Engajamento** do usuário
- **Dados** valiosos para melhorias
- **Escalabilidade** para novas funcionalidades

---

*Especificação criada em 20/07/2025* 