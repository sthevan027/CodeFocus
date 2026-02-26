---
name: Quick Stats não atualizam
about: Bug - Sessões hoje e Tempo total permanecem zerados após completar sessões
title: '[Bug] Quick Stats (Sessões hoje / Tempo total) não atualizam no Timer'
labels: 'bug, timer, quick-stats'
assignees: ''
---

## Descrição do problema

As estatísticas **"Sessões hoje"** e **"Tempo total"** exibidas no Timer permanecem zeradas mesmo após o usuário completar sessões de foco ou pausa.

### Localização
- **Componente:** `app/components/Timer.jsx`
- **Linhas:** ~459-500 (bloco Quick Stats)
- **Dados afetados:** `todayStats.sessions`, `todayStats.minutes`

---

## Análise de causas potenciais

### 1. Timer não persiste ciclos no Supabase (mais provável)
- **Problema:** O Timer salva sessões **apenas no localStorage** via `saveSession()`. **Nunca chama** `apiService.createCycle()`.
- **Impacto:** Se o app fosse migrado para Supabase, os dados ficariam só no localStorage. Quick Stats e Dashboard leem de `codefocus-history-${user.id}` — se essa chave nunca recebe dados (ou estiver vazia), mostram 0.
- **Evidência:** `grep createCycle app/components/Timer.jsx` → sem resultados.

### 2. Chave do localStorage inconsistente (user vs user.id)
- **Problema:** `saveSession` e `refreshTodayStats` usam `user ? codefocus-history-${user.id} : 'codefocus-history'`.
- **Cenário:** Se `user` for `null` em algum momento (ex.: AuthContext ainda carregando), grava-se em `codefocus-history`. Depois, quando `user` carrega, lê-se de `codefocus-history-${user.id}` — vazio.
- **Nota:** O app só mostra o Timer quando `isAuthenticated`, então `user` tende a existir. Verificar se `user.id` está sempre definido.

### 3. Filtro de data (timezone)
- **Problema:** `new Date(s.timestamp).toDateString() === new Date().toDateString()` — timestamps em UTC podem cair em outro dia no fuso local.
- **Impacto:** Baixo, mas possível em casos de virada de dia.

### 4. Re-render / atualização de estado
- **Problema:** `refreshTodayStats()` depende de `useEffect` com `[refreshTodayStats, isRunning]`. Em certos fluxos (ex.: transição rápida para short break), o effect pode não rodar no momento ideal.
- **Mitigação atual:** Chamada direta `refreshTodayStats()` após `saveSession()` no handler de conclusão do timer.

### 5. `hasHandledCycleCompleteRef` impede execução
- **Problema:** Se o ref não for resetado corretamente, o handler de conclusão pode não rodar de novo.
- **Verificar:** O ref é resetado em `isRunning && timeLeft > 0`. Em transições com modais (nota, Git), o fluxo pode ser interrompido.

### 6. Formato dos dados no localStorage
- **Problema:** Sessões devem ter `type: 'session'`, `timestamp` (ISO), `duration` (segundos). Se o formato estiver incorreto, o filtro falha.
- **Exemplo esperado:** `{ id, name, duration, phase, tags, note, timestamp, type: 'session' }`

---

## Passo a passo para resolução

### Passo 1: Confirmar que `saveSession` está sendo chamada

1. Abra `app/components/Timer.jsx`.
2. Adicione um `console.log` no início de `saveSession`:
   ```js
   const saveSession = (duration, phase, name, tags = [], note = '') => {
     console.log('[QuickStats] saveSession called', { duration, phase, userKey: user ? `codefocus-history-${user.id}` : 'codefocus-history' });
   ```
3. Complete uma sessão (foco ou pausa).
4. **Esperado:** O log aparece no console quando o timer chega a 0.

---

### Passo 2: Verificar chave do localStorage e dados salvos

1. Adicione log após salvar:
   ```js
   localStorage.setItem(userKey, JSON.stringify(history));
   console.log('[QuickStats] Saved to localStorage', { userKey, count: history.length, lastSession: history[0] });
   ```
2. Complete uma sessão.
3. No DevTools → Application → Local Storage, procure a chave `codefocus-history-{userId}`.
4. **Esperado:** Array com pelo menos 1 item com `type: 'session'`, `timestamp` e `duration`.

---

### Passo 3: Verificar `refreshTodayStats` e chave usada

1. Adicione log em `refreshTodayStats`:
   ```js
   const userKey = user ? `codefocus-history-${user.id}` : 'codefocus-history';
   console.log('[QuickStats] refreshTodayStats', { userKey, user: user?.id });
   const raw = localStorage.getItem(userKey) || '[]';
   const history = JSON.parse(raw);
   // ... após filtrar todaySessions:
   console.log('[QuickStats] todaySessions', todaySessions.length, todaySessions);
   ```
2. Complete uma sessão e observe os logs.
3. **Esperado:** `todaySessions.length > 0` após completar; `userKey` idêntico ao usado em `saveSession`.

---

### Passo 4: Garantir atualização imediata após salvar

1. Confirmar que `refreshTodayStats()` é chamado logo após `saveSession()` no handler de conclusão do timer (linha ~226).
2. Se não estiver, adicionar:
   ```js
   saveSession(sessionDuration, currentPhase, cycleName, selectedTags, sessionNote);
   refreshTodayStats(); // Atualizar Quick Stats imediatamente
   ```

---

### Passo 5: Persistir no Supabase (recomendado)

Para que Quick Stats e Dashboard usem dados reais do banco:

1. Ao completar um ciclo, chamar `apiService.createCycle()` com os dados da sessão.
2. **Payload esperado pela API** (ver `app/lib/validations.js` e `app/pages/api/cycles/index.js`):
   - `name`, `duration` (minutos), `phase`, `git_commit` (opcional), `git_files` (opcional)
3. **Unidades:** O Timer trabalha em **segundos**; a API usa **minutos**. Converter: `durationSeconds / 60`.
4. **Arquivo:** `app/components/Timer.jsx` — dentro do handler `timeLeft === 0`, após `saveSession`, adicionar:
   ```js
   if (user?.id) {
     apiService.createCycle({
       name: cycleName || `${currentPhase} session`,
       duration: Math.round(sessionDuration / 60),
       phase: currentPhase,
     }).catch(err => console.warn('Erro ao persistir ciclo:', err));
   }
   ```
5. **Observação:** Quick Stats e Dashboard hoje leem do localStorage. Para usar Supabase, será necessário migrar `refreshTodayStats` e `loadDashboardData` para consumir as APIs de cycles (ver issue `[Feature] Dashboard deve consumir dados reais do banco`).

---

### Passo 6: Testar cenários

- [ ] Completar sessão de **foco** (25 min ou valor configurado) → Sessões hoje: 1, Tempo total: ~25min
- [ ] Completar sessão de **short break** → Sessões hoje: 2, Tempo total: ~30min
- [ ] Recarregar a página → Estatísticas permanecem
- [ ] Trocar de aba (Timer → Dashboard) e voltar → Estatísticas corretas
- [ ] Verificar no DevTools se `codefocus-history-{userId}` contém as sessões

---

## Arquivos envolvidos

| Arquivo | Função |
|---------|--------|
| `app/components/Timer.jsx` | `saveSession`, `refreshTodayStats`, Quick Stats UI |
| `app/components/Dashboard.jsx` | `loadDashboardData` — mesma chave localStorage |
| `app/context/AuthContext.jsx` | Fornece `user` (e `user.id`) |
| `app/services/apiService.js` | `createCycle` — não utilizado pelo Timer |

---

## Critérios de conclusão

- [ ] Quick Stats mostram valores corretos após completar pelo menos 1 sessão
- [ ] Valores persistem após recarregar a página
- [ ] Valores batem entre Timer e Dashboard
- [ ] (Opcional) Timer persiste ciclos no Supabase via `createCycle`
- [ ] Testes manuais cobrindo foco, short break, long break e recarregamento
