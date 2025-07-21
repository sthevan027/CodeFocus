# 🧠 Guia de Git – CodeFocus

## 📋 Boas Práticas

### Estrutura de Commits
Os commits do CodeFocus seguem um padrão específico:

```
feat: "Nome do Ciclo" - [arquivos modificados] (duração)
```

**Exemplos:**
- `feat: "Refatorar API Login" - [src/api/login.js, tests/login.test.js] (25min)`
- `feat: "Criar componente Header" - [src/components/Header.jsx] (15min)`
- `feat: "Corrigir bug timer" - [src/hooks/useTimer.js] (10min)`

### Regras Importantes
- ✅ **Sempre confirmar** antes de fazer commit automático
- ✅ **Não comitar** se não for continuar programando
- ✅ **Push automático** deve ser opcional e configurável
- ✅ **Detectar repositório** antes de qualquer operação Git

## 🔧 Integração Técnica

### Detecção de Repositório
```javascript
import simpleGit from 'simple-git';

const git = simpleGit();
const isRepo = await git.checkIsRepo();

if (!isRepo) {
  console.log('Não é um repositório Git');
  return;
}
```

### Detecção de Mudanças
```javascript
// Verificar arquivos modificados
const status = await git.status();
const modifiedFiles = status.modified.concat(status.created);

// Lista de arquivos para o commit
const fileList = modifiedFiles.join(', ');
```

### Commit Inteligente
```javascript
const commitMessage = `feat: "${cycleName}" - [${fileList}] (${duration}min)`;

await git
  .add('.')
  .commit(commitMessage);
```

## 🚨 Cenários de Erro

### Repositório Não Encontrado
- **Ação**: Avisar usuário e pular integração Git
- **Mensagem**: "Nenhum repositório Git encontrado nesta pasta"

### Erro no Commit
- **Ação**: Mostrar erro e permitir retry manual
- **Log**: Salvar detalhes do erro para debug

### Conflitos de Merge
- **Ação**: Não fazer push automático se houver conflitos
- **Sugestão**: Resolver manualmente e fazer push depois

## ⚙️ Configurações

### Push Automático
```javascript
// Configuração opcional
const autoPush = settings.git.autoPush;

if (autoPush && commitSuccessful) {
  try {
    await git.push();
    console.log('Push automático realizado');
  } catch (error) {
    console.log('Erro no push automático');
  }
}
```

### Branches
- **Padrão**: Usar branch atual do usuário
- **Proteção**: Não alterar branch automaticamente
- **Detecção**: Verificar se está em branch de desenvolvimento

## 📊 Histórico de Commits

### Estrutura de Log
```json
{
  "timestamp": "2024-01-15T14:30:00Z",
  "cycleName": "Refatorar API Login",
  "duration": 25,
  "files": ["src/api/login.js", "tests/login.test.js"],
  "commitHash": "abc123...",
  "branch": "main"
}
```

### Relatórios Git
- **Frequência**: Diária e semanal
- **Métricas**: Commits por dia, tempo total, arquivos modificados
- **Exportação**: Formato JSON para análise externa

---

*Este guia é atualizado conforme novas funcionalidades são implementadas.*
