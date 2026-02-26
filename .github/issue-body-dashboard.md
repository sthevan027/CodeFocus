## Contexto

O Dashboard de Produtividade atualmente usa **localStorage** para calcular e exibir todas as métricas (Foco Hoje, Produtividade, Ciclos Completos, Média por Sessão, Progresso Semanal, Atividades Recentes). Os dados reais estão no **Supabase** (tabela `cycles`), e já existem APIs prontas que o Dashboard **não está utilizando**.

## Objetivo

Conectar o Dashboard às APIs de ciclos/estatísticas para exibir dados reais do banco de dados, garantindo que as métricas reflitam o histórico persistido no Supabase.

## APIs já disponíveis

| Endpoint | Retorno |
|----------|---------|
| `GET /api/cycles/stats/overview` | `total_cycles`, `completed_cycles`, `total_focus_minutes`, `productivity_score`, `average_cycle_duration` |
| `GET /api/cycles/stats/daily?date=YYYY-MM-DD` | `total_focus_minutes`, `total_cycles`, `productivity_score`, `cycles` (lista do dia) |
| `GET /api/cycles/?skip=0&limit=100` | Lista de ciclos (para Atividades Recentes) |

O `apiService` já possui os métodos: `getCycleStats()`, `getDailyStats(date)`, `getCycles()`.

## Passo a passo de implementação

### 1. Criar API de estatísticas semanais (se necessário)

**Verificar:** O `/api/cycles/stats/overview` retorna totais gerais. Para "Progresso Semanal" (meta 40h, horas concluídas), precisamos de dados dos últimos 7 dias.

- [ ] **Opção A:** Criar `GET /api/cycles/stats/weekly` que retorne `total_focus_minutes` dos últimos 7 dias.
- [ ] **Opção B:** Fazer 7 chamadas a `/api/cycles/stats/daily` no frontend (menos eficiente).
- [ ] **Opção C:** Ajustar o overview para aceitar query `?period=week` e retornar dados da semana.

**Arquivo sugerido:** `app/pages/api/cycles/stats/weekly.js`

---

### 2. Mapear campos da API para o estado do Dashboard

O Dashboard espera:

| Campo Dashboard | Fonte API | Mapeamento |
|-----------------|-----------|------------|
| `todayFocus` (min) | `getDailyStats(hoje).total_focus_minutes` | Direto |
| `weekFocus` (min) | Nova API weekly ou soma de daily | Agregar |
| `totalCycles` | `getCycleStats().total_cycles` | Direto |
| `productivity` (%) | `getCycleStats().productivity_score` ou daily | Direto |
| `averageSessionLength` (min) | `getCycleStats().average_cycle_duration` | Verificar unidade (min vs seg) |
| `weeklyProgress` (%) | `weekFocus / (40*60)` em minutos | Calcular |
| `recentActivities` | `getCycles()` ou incluir na daily | Mapear `cycles` → formato de atividade |

- [ ] Documentar diferenças de unidade (duração em minutos no banco vs segundos no frontend).
- [ ] Verificar se `cycles` no banco tem `phase`, `duration`, `created_at`, `name` compatíveis com o componente.

---

### 3. Atualizar o componente Dashboard.jsx

- [ ] **Remover** a leitura de `localStorage` em `loadDashboardData`.
- [ ] **Adicionar** chamadas ao `apiService`:
  - `apiService.getCycleStats()` → overview
  - `apiService.getDailyStats(YYYY-MM-DD)` → foco de hoje
  - `apiService.getCycles(0, 20)` → atividades recentes
- [ ] **Tratar loading e erro:** estado de carregamento e mensagem quando falhar.
- [ ] **Mapear** os dados da API para o formato esperado por `ProductivityStats`, `ProgressCharts`, etc.

**Código de referência (estrutura):**

```js
const loadDashboardData = async () => {
  setLoading(true)
  try {
    const today = new Date().toISOString().slice(0, 10)
    const [overview, daily, cycles] = await Promise.all([
      apiService.getCycleStats(),
      apiService.getDailyStats(today),
      apiService.getCycles(0, 20)
    ])
    // Mapear para setStats({ ... })
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

### 4. Tratar dados semanais (Progresso Semanal)

- [ ] Se criou `GET /api/cycles/stats/weekly`, chamar e usar `total_focus_minutes` para `weekFocus` e `weeklyProgress`.
- [ ] Caso contrário, implementar lógica no frontend (ex.: 7 chamadas `getDailyStats` em paralelo e somar).

---

### 5. Atualizar subcomponentes dependentes

- [ ] **ProductivityStats** – Verificar se recebe os mesmos nomes de props (`stats`).
- [ ] **ProgressCharts** – Verificar se `stats.weekFocus`, `stats.todayFocus` etc. são usados e se as unidades batem.
- [ ] **QuickNotes** e **TagManager** – Verificar se dependem de `stats.tags` ou `stats.recentActivities`; se sim, garantir mapeamento ou fonte alternativa (ex.: tags podem vir de outra tabela no futuro).

---

### 6. Tags (se o schema tiver suporte)

- [ ] Verificar se a tabela `cycles` tem coluna `tags` (ou JSONB).
- [ ] Se não tiver: deixar `tags: {}` por enquanto ou planejar migração futura.
- [ ] Se tiver: incluir na query e mapear para `stats.tags`.

---

### 7. Garantir que o Timer persiste no banco

- [ ] Confirmar que ao completar um ciclo, o Timer chama `apiService.createCycle()` e os dados vão para o Supabase.
- [ ] Sem isso, o Dashboard não terá dados para exibir mesmo após a integração.

---

### 8. Testes e validação

- [ ] Completar 1+ ciclos via Timer e verificar se aparecem no Dashboard.
- [ ] Conferir Foco Hoje, Produtividade, Ciclos Completos, Média por Sessão.
- [ ] Conferir Progresso Semanal e Atividades Recentes.
- [ ] Testar com usuário sem ciclos (empty state).
- [ ] Testar tratamento de erro (ex.: API 401, 500).

---

### 9. (Opcional) Fallback ou modo offline

- [ ] Decidir se manter fallback para localStorage quando API falhar (ex.: offline).
- [ ] Se sim, documentar e adicionar aviso visual "Modo offline - dados locais".

---

## Arquivos principais a modificar

| Arquivo | Ação |
|---------|------|
| `app/components/Dashboard.jsx` | Trocar localStorage por chamadas ao apiService |
| `app/services/apiService.js` | Já tem `getCycleStats`, `getDailyStats`, `getCycles` |
| `app/pages/api/cycles/stats/weekly.js` | Criar (se optar por endpoint semanal) |

## Critérios de conclusão

- [ ] Dashboard exibe Foco Hoje com dados de `/api/cycles/stats/daily`
- [ ] Dashboard exibe Ciclos Completos, Produtividade e Média por Sessão com dados de `/api/cycles/stats/overview`
- [ ] Dashboard exibe Progresso Semanal com dados agregados da semana
- [ ] Atividades Recentes lista ciclos vindos de `/api/cycles/`
- [ ] Estados de loading e erro tratados
- [ ] Sem uso de localStorage para essas métricas
