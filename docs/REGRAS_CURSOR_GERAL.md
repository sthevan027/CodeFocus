# 📏 Regras Cursor.IA – Gerais

## 📋 Princípios Fundamentais

### 🎯 Qualidade do Código
- **Sempre** escrever código limpo e bem documentado
- **Sempre** seguir padrões de nomenclatura consistentes
- **Sempre** incluir comentários explicativos em lógicas complexas
- **Nunca** deixar código comentado ou não utilizado

### 📝 Documentação
- **Toda tarefa concluída** deve ser registrada em `TODO.md`
- **Cada entrega** gera um commit descritivo e claro
- **README e documentação** devem estar sempre atualizados
- **Utilizar sempre** `docs/` como central técnica do projeto

## 🔄 Fluxo de Trabalho

### Antes de Começar
1. **Ler** a documentação relevante em `docs/`
2. **Verificar** o estado atual em `TODO.md`
3. **Entender** o contexto da tarefa solicitada
4. **Planejar** a abordagem antes de implementar

### Durante o Desenvolvimento
1. **Implementar** seguindo as regras específicas (front/back)
2. **Testar** funcionalidades antes de finalizar
3. **Documentar** mudanças importantes
4. **Validar** se não quebrou funcionalidades existentes

### Após Concluir
1. **Atualizar** `TODO.md` com progresso
2. **Verificar** se documentação está atualizada
3. **Testar** build e funcionalidades principais
4. **Comitar** com mensagem descritiva

## 📁 Estrutura de Arquivos

### Organização
```
CodeFocus/
├── docs/           # 📚 Documentação técnica
├── src/            # 🧩 Código fonte
├── public/         # 🌐 Assets públicos
├── tests/          # 🧪 Testes (futuro)
└── build/          # 🏗️ Arquivos de build
```

### Convenções de Nomeação
- **Arquivos**: `camelCase.js` ou `PascalCase.jsx`
- **Componentes**: `PascalCase.jsx`
- **Hooks**: `useCamelCase.js`
- **Utilitários**: `camelCase.js`
- **Documentação**: `NOME_MAIUSCULO.md`

## 🎨 Padrões Visuais

### Emojis e Ícones
- **Seções**: 📚 📏 🧠 🔧 📊
- **Status**: ✅ ❌ ⏳ 🚧 🔄
- **Tipos**: 🎯 🐛 🚀 📝 🔧

### Formatação
- **Títulos**: Usar emojis para categorização
- **Listas**: Usar checkboxes para tarefas
- **Código**: Usar blocos de código com syntax highlighting
- **Links**: Manter links internos funcionais

## 🔍 Controle de Qualidade

### Checklist Antes de Entregar
- [ ] Código segue padrões estabelecidos
- [ ] Funcionalidade testada localmente
- [ ] Documentação atualizada
- [ ] TODO.md atualizado
- [ ] Commit com mensagem descritiva
- [ ] Não quebrou funcionalidades existentes

### Validações Automáticas
- **Linting**: Verificar se não há erros de lint
- **Build**: Confirmar que build funciona
- **Git**: Verificar se não há conflitos
- **Dependências**: Confirmar se todas estão instaladas

## 🚨 Tratamento de Erros

### Quando Encontrar Problemas
1. **Documentar** o problema encontrado
2. **Investigar** a causa raiz
3. **Propor** solução antes de implementar
4. **Testar** a solução antes de aplicar
5. **Atualizar** documentação se necessário

### Comunicação
- **Sempre** explicar o que está fazendo
- **Sempre** justificar decisões técnicas
- **Sempre** avisar sobre mudanças importantes
- **Nunca** assumir que algo é óbvio

---

*Estas regras garantem consistência e qualidade em todo o projeto.*
