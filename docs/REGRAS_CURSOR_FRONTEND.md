# 🖼️ Regras Cursor.IA – Front-end

## 🎨 Padrões de Design

### Tecnologias Obrigatórias
- **React 18+** com hooks funcionais
- **TailwindCSS** para estilização
- **Framer Motion** para animações
- **Context API** para gerenciamento de estado

### Estrutura de Componentes
```jsx
// ✅ Padrão correto
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // lógica do efeito
  }, [dependencies]);
  
  return (
    <div className="flex items-center justify-center">
      {/* conteúdo */}
    </div>
  );
};
```

## 🧩 Organização de Componentes

### Estrutura de Pastas
```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/            # Componentes básicos (Button, Input)
│   ├── layout/        # Componentes de layout (Header, Footer)
│   └── features/      # Componentes específicos (Timer, Modal)
├── context/           # Context providers
├── hooks/             # Custom hooks
├── utils/             # Funções utilitárias
└── styles/            # Estilos globais
```

### Convenções de Nomenclatura
- **Componentes**: `PascalCase.jsx`
- **Hooks**: `useCamelCase.js`
- **Context**: `CamelCaseContext.jsx`
- **Utils**: `camelCase.js`

## 🎯 Componentes Principais

### TimerDisplay
```jsx
// Responsabilidades:
// - Mostrar tempo restante
// - Progresso visual circular
// - Estados: focus, break, paused
// - Animações suaves
```

### CycleModal
```jsx
// Responsabilidades:
// - Input para nome do ciclo
// - Validação de entrada
// - Confirmação/cancelamento
// - Integração com contexto
```

### CommitPrompt
```jsx
// Responsabilidades:
// - Decisão pós-ciclo
// - Informações do commit
// - Botões de ação
// - Feedback visual
```

## 🎨 Sistema de Design

### Tema Glassmorphism
```css
/* Classes Tailwind personalizadas */
.glass {
  @apply bg-white/10 backdrop-blur-md border border-white/20;
}

.glass-dark {
  @apply bg-black/10 backdrop-blur-md border border-white/10;
}
```

### Paleta de Cores
```javascript
// Cores principais
const colors = {
  primary: '#3B82F6',    // Azul foco
  secondary: '#10B981',  // Verde sucesso
  warning: '#F59E0B',    // Amarelo pausa
  danger: '#EF4444',     // Vermelho erro
  neutral: '#6B7280'     // Cinza neutro
};
```

### Responsividade
- **Mobile First**: Começar com mobile
- **Breakpoints**: sm(640px), md(768px), lg(1024px)
- **Flexbox/Grid**: Usar para layouts responsivos
- **Viewport**: Considerar diferentes tamanhos de tela

## ⚡ Performance

### Otimizações Obrigatórias
- **React.memo()** para componentes pesados
- **useCallback()** para funções passadas como props
- **useMemo()** para cálculos complexos
- **Lazy loading** para componentes grandes

### Exemplo de Otimização
```jsx
const TimerDisplay = React.memo(({ time, progress }) => {
  const formattedTime = useMemo(() => {
    return formatTime(time);
  }, [time]);
  
  const handleClick = useCallback(() => {
    // lógica do clique
  }, []);
  
  return (
    <div onClick={handleClick}>
      {formattedTime}
    </div>
  );
});
```

## 🔧 Integração com Backend

### Context API
```jsx
// TimerContext.jsx
const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timerState, setTimerState] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  
  const value = {
    timerState,
    timeLeft,
    startTimer: () => { /* lógica */ },
    pauseTimer: () => { /* lógica */ }
  };
  
  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
```

### Hooks Customizados
```jsx
// useTimer.js
export const useTimer = () => {
  const { timerState, timeLeft, startTimer, pauseTimer } = useContext(TimerContext);
  
  const isRunning = timerState === 'running';
  const isPaused = timerState === 'paused';
  
  return {
    timerState,
    timeLeft,
    isRunning,
    isPaused,
    startTimer,
    pauseTimer
  };
};
```

## 🎭 Animações

### Framer Motion
```jsx
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, children }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);
```

### Transições Suaves
- **Duração**: 200-300ms para interações
- **Easing**: `ease-out` para entrada, `ease-in` para saída
- **Feedback**: Hover states e loading states
- **Micro-interações**: Pequenas animações para feedback

## 🧪 Testes e Validação

### Checklist de Qualidade
- [ ] Componente renderiza sem erros
- [ ] Props são validadas corretamente
- [ ] Estados são gerenciados adequadamente
- [ ] Animações funcionam suavemente
- [ ] Responsividade em diferentes telas
- [ ] Acessibilidade (alt text, focus states)
- [ ] Performance otimizada

### Validação de Props
```jsx
import PropTypes from 'prop-types';

ComponentName.propTypes = {
  time: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired,
  theme: PropTypes.oneOf(['light', 'dark'])
};
```

---

*Estas regras garantem consistência e qualidade no frontend.*
