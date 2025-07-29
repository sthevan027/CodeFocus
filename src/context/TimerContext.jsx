import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import notificationManager from '../utils/notificationUtils';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer deve ser usado dentro de um TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('focus'); // focus, shortBreak, longBreak
  const [cycleCount, _setCycleCount] = useState(0);
  const [cycleName, setCycleName] = useState('');
  const [completedCycles, setCompletedCycles] = useState([]);

  // Configurações padrão
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true,
  });

  // Carregar configurações salvas
  useEffect(() => {
    const savedSettings = localStorage.getItem('codefocus-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Salvar configurações
  useEffect(() => {
    localStorage.setItem('codefocus-settings', JSON.stringify(settings));
  }, [settings]);

  // Carregar histórico salvo do arquivo local (Electron)
  useEffect(() => {
    if (window.historyAPI && window.historyAPI.loadHistory) {
      window.historyAPI.loadHistory().then((history) => {
        if (Array.isArray(history)) setCompletedCycles(history);
      });
    }
  }, []);

  // Timer principal
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    
    // Salvar ciclo completado
    if (currentPhase === 'focus' && cycleName) {
      const completedCycle = {
        id: Date.now(),
        name: cycleName,
        duration: settings.focusTime,
        completedAt: new Date().toISOString(),
        phase: currentPhase,
      };
      setCompletedCycles(prev => [...prev, completedCycle]);
      // Salvar no arquivo local (Electron)
      if (window.historyAPI && window.historyAPI.saveCycle) {
        window.historyAPI.saveCycle(completedCycle);
      }
    }

    // Notificação
    if (settings.notificationsEnabled) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.invoke('show-notification', 
        'CodeFocus', 
        `${currentPhase === 'focus' ? 'Foco' : 'Pausa'} finalizada!`
      );
    }

    // Som
    if (settings.soundEnabled) {
      // Implementar som
    }

    // Auto-start próximo ciclo
    if (currentPhase === 'focus' && settings.autoStartBreaks) {
      startShortBreak();
    } else if (currentPhase === 'shortBreak' && settings.autoStartPomodoros) {
      startFocus();
    }
  }, [currentPhase, cycleName, settings]);

  const startFocus = useCallback(() => {
    setTimeLeft(settings.focusTime * 60);
    setCurrentPhase('focus');
    setIsRunning(true);
    setIsPaused(false);
  }, [settings.focusTime]);

  const startShortBreak = useCallback(() => {
    setTimeLeft(settings.shortBreakTime * 60);
    setCurrentPhase('shortBreak');
    setIsRunning(true);
    setIsPaused(false);
  }, [settings.shortBreakTime]);

  const startLongBreak = useCallback(() => {
    setTimeLeft(settings.longBreakTime * 60);
    setCurrentPhase('longBreak');
    setIsRunning(true);
    setIsPaused(false);
  }, [settings.longBreakTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(settings.focusTime * 60);
    setCurrentPhase('focus');
  }, [settings.focusTime]);

  const skipTimer = useCallback(() => {
    if (currentPhase === 'focus') {
      startShortBreak();
    } else {
      startFocus();
    }
  }, [currentPhase, startFocus, startShortBreak]);

  const value = {
    timeLeft,
    isRunning,
    isPaused,
    currentPhase,
    cycleCount,
    cycleName,
    completedCycles,
    settings,
    setCycleName,
    setSettings,
    startFocus,
    startShortBreak,
    startLongBreak,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}; 