# ⚙️ Regras Cursor.IA – Back-end

## 🔧 Integração Git

### Detecção de Repositório
```javascript
// ✅ Padrão correto
import simpleGit from 'simple-git';

const detectGitRepo = async () => {
  try {
    const git = simpleGit();
    const isRepo = await git.checkIsRepo();
    
    if (!isRepo) {
      console.log('Nenhum repositório Git encontrado');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao detectar repositório:', error);
    return false;
  }
};
```

### Operações Git Seguras
- **Sempre** verificar se é repositório antes de operações
- **Sempre** capturar e tratar erros
- **Sempre** confirmar com usuário antes de commits
- **Nunca** usar `child_process` diretamente

### Exemplo de Commit Inteligente
```javascript
const createCommit = async (cycleName, duration) => {
  try {
    const git = simpleGit();
    
    // Verificar status
    const status = await git.status();
    const modifiedFiles = status.modified.concat(status.created);
    
    if (modifiedFiles.length === 0) {
      console.log('Nenhum arquivo modificado');
      return false;
    }
    
    // Criar mensagem de commit
    const fileList = modifiedFiles.join(', ');
    const commitMessage = `feat: "${cycleName}" - [${fileList}] (${duration}min)`;
    
    // Executar commit
    await git.add('.');
    await git.commit(commitMessage);
    
    console.log('Commit realizado:', commitMessage);
    return true;
    
  } catch (error) {
    console.error('Erro no commit:', error);
    return false;
  }
};
```

## 📊 Gerenciamento de Dados

### Estrutura do Histórico
```javascript
// history.json
{
  "2024-01-15": {
    "cycles": [
      {
        "id": "uuid-v4",
        "name": "Refatorar API Login",
        "duration": 25,
        "startTime": "14:30:00",
        "endTime": "14:55:00",
        "completed": true,
        "gitCommit": "feat: Refatorar API Login (25min)",
        "filesModified": ["src/api/login.js", "tests/login.test.js"]
      }
    ],
    "totalTime": 75,
    "completedCycles": 3,
    "interruptedCycles": 1
  }
}
```

### Operações de Dados
```javascript
// ✅ Padrão correto para salvar dados
const saveCycleData = async (cycleData) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const history = await loadHistory();
    
    if (!history[today]) {
      history[today] = {
        cycles: [],
        totalTime: 0,
        completedCycles: 0,
        interruptedCycles: 0
      };
    }
    
    history[today].cycles.push(cycleData);
    history[today].totalTime += cycleData.duration;
    
    if (cycleData.completed) {
      history[today].completedCycles++;
    } else {
      history[today].interruptedCycles++;
    }
    
    await saveHistory(history);
    return true;
    
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    return false;
  }
};
```

## 📝 Geração de Relatórios

### Estrutura do Relatório
```javascript
const generateDailyReport = async (date) => {
  try {
    const history = await loadHistory();
    const dayData = history[date];
    
    if (!dayData) {
      return null;
    }
    
    const report = {
      date: date,
      totalTime: dayData.totalTime,
      completedCycles: dayData.completedCycles,
      interruptedCycles: dayData.interruptedCycles,
      cycles: dayData.cycles.map(cycle => ({
        name: cycle.name,
        duration: cycle.duration,
        completed: cycle.completed,
        gitCommit: cycle.gitCommit
      }))
    };
    
    return formatReport(report);
    
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return null;
  }
};
```

### Formatação do Relatório
```javascript
const formatReport = (report) => {
  const lines = [
    `📅 CodeFocus – Relatório ${report.date}`,
    '',
    `⏱️  Tempo Total: ${report.totalTime}min`,
    `✅ Ciclos Completos: ${report.completedCycles}`,
    `⏸️  Ciclos Interrompidos: ${report.interruptedCycles}`,
    '',
    '📋 Detalhes dos Ciclos:',
    ''
  ];
  
  report.cycles.forEach(cycle => {
    const status = cycle.completed ? '✅' : '⏸️';
    const commit = cycle.gitCommit ? ` (${cycle.gitCommit})` : '';
    lines.push(`${status} ${cycle.name} – ${cycle.duration}min${commit}`);
  });
  
  return lines.join('\n');
};
```

## 🔐 Segurança e Validação

### Validação de Entrada
```javascript
const validateCycleData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('Nome do ciclo é obrigatório');
  }
  
  if (!data.duration || data.duration <= 0) {
    errors.push('Duração deve ser maior que zero');
  }
  
  if (data.duration > 120) {
    errors.push('Duração máxima é 120 minutos');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### Tratamento de Erros
```javascript
// ✅ Padrão correto para tratamento de erros
const handleError = (error, context) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context: context,
    message: error.message,
    stack: error.stack
  };
  
  console.error('Erro no backend:', errorInfo);
  
  // Salvar log de erro
  saveErrorLog(errorInfo);
  
  return {
    success: false,
    error: error.message,
    timestamp: errorInfo.timestamp
  };
};
```

## ⚡ Performance

### Otimizações Obrigatórias
- **Async/Await**: Usar sempre para operações assíncronas
- **Error Handling**: Capturar todos os erros possíveis
- **Memory Management**: Limpar dados desnecessários
- **File I/O**: Usar streams para arquivos grandes

### Cache e Persistência
```javascript
// Cache para dados frequentemente acessados
const cache = new Map();

const getCachedData = async (key, fetchFunction) => {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetchFunction();
  cache.set(key, data);
  
  return data;
};
```

## 🧪 Testes e Validação

### Checklist de Qualidade
- [ ] Todas as operações Git são seguras
- [ ] Dados são validados antes de salvar
- [ ] Erros são tratados adequadamente
- [ ] Relatórios são gerados corretamente
- [ ] Performance é otimizada
- [ ] Logs são mantidos para debug

### Exemplo de Teste
```javascript
// Teste de integração Git
const testGitIntegration = async () => {
  const isRepo = await detectGitRepo();
  console.assert(isRepo === true, 'Deve detectar repositório Git');
  
  const commitResult = await createCommit('Teste', 5);
  console.assert(commitResult === true, 'Deve criar commit com sucesso');
};
```

---

*Estas regras garantem confiabilidade e segurança no backend.*
