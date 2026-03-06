import { useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationManager from '../utils/notificationUtils';
import GitCommitModal from './GitCommitModal';
import RepoSelector from './RepoSelector';
import { loadSettings } from '../utils/settingsUtils';
import apiService from '../services/apiService';
import { createCycle } from '../services/cycleService';
import { useTodayStats } from '../hooks/useTodayStats';

const Timer = forwardRef((props, ref) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(loadSettings());
  const [pendingAutoStartPhase, setPendingAutoStartPhase] = useState(null); // 'shortBreak' | 'longBreak' | 'focus'
  
  // Carregar estado inicial do localStorage com dados do usuário
  const loadTimerState = () => {
    try {
      const userKey = user ? `codefocus-timer-state-${user.id}` : 'codefocus-timer-state';
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const state = JSON.parse(saved);
        return {
          timeLeft: state.timeLeft || loadSettings().focus_time * 60,
          isRunning: false, // Sempre parar ao recarregar
          isPaused: state.isPaused || false,
          currentPhase: state.currentPhase || 'focus',
          cycleName: state.cycleName || '',
          customFocusMinutes: state.customFocusMinutes || ''
        };
      }
    } catch (error) {
      console.error('Erro ao carregar estado do timer:', error);
    }
    return {
      timeLeft: loadSettings().focus_time * 60,
      isRunning: false,
      isPaused: false,
      currentPhase: 'focus',
      cycleName: '',
      customFocusMinutes: ''
    };
  };

  const initialState = loadTimerState();
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);
  const [isRunning, setIsRunning] = useState(initialState.isRunning);
  const [isPaused, setIsPaused] = useState(initialState.isPaused);
  const [currentPhase, setCurrentPhase] = useState(initialState.currentPhase);
  const [cycleName, setCycleName] = useState(initialState.cycleName);
  const [showCycleInput, setShowCycleInput] = useState(false);
  const [customFocusMinutes, _setCustomFocusMinutes] = useState(initialState.customFocusMinutes);
  const [showGitModal, setShowGitModal] = useState(false);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [pendingBreakPhase, setPendingBreakPhase] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  const [availableTags, setAvailableTags] = useState([]);
  const inputRef = useRef(null);
  const hasHandledCycleCompleteRef = useRef(false);
  const lastCreatedCycleIdRef = useRef(null);
  const [todayStats, refreshTodayStats] = useTodayStats(user, isRunning);

  // Atualizar settings quando localStorage mudar (SettingsScreen)
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'codefocus-settings') {
        setSettings(loadSettings());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Carregar tags do usuário via API (Supabase)
  useEffect(() => {
    if (!user?.id) {
      setAvailableTags([]);
      return;
    }
    apiService
      .getTags()
      .then((tags) => {
        const names = Array.isArray(tags) ? tags.map((t) => (typeof t === 'string' ? t : t.name)) : [];
        setAvailableTags(names);
      })
      .catch(() => setAvailableTags([]));
  }, [user?.id]);

  // Carregar repositório selecionado do backend
  useEffect(() => {
    if (!user) return;
    apiService.getSettings().then((s) => {
      if (s?.selected_repo) setSelectedRepo(s.selected_repo);
    }).catch(() => {});
  }, [user]);

  const getFocusCountKey = useCallback(() => {
    return user ? `codefocus-focus-count-${user.id}` : 'codefocus-focus-count';
  }, [user]);

  const getFocusCount = useCallback(() => {
    try {
      const raw = localStorage.getItem(getFocusCountKey());
      const n = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(n) ? n : 0;
    } catch {
      return 0;
    }
  }, [getFocusCountKey]);

  const setFocusCount = useCallback((n) => {
    try {
      localStorage.setItem(getFocusCountKey(), String(n));
    } catch {}
  }, [getFocusCountKey]);
  
  // Salvar estado no localStorage sempre que mudar
  const saveTimerState = (newState) => {
    try {
      const userKey = user ? `codefocus-timer-state-${user.id}` : 'codefocus-timer-state';
      localStorage.setItem(userKey, JSON.stringify(newState));
    } catch (error) {
      console.error('Erro ao salvar estado do timer:', error);
    }
  };

  // Salvar sessão completada
  const saveSession = (duration, phase, name, tags = [], note = '') => {
    try {
      const userKey = user ? `codefocus-history-${user.id}` : 'codefocus-history';
      const history = JSON.parse(localStorage.getItem(userKey) || '[]');
      
      const session = {
        id: Date.now(),
        name: name || `${phase} session`,
        duration: duration,
        phase: phase,
        tags: tags,
        note: note,
        timestamp: new Date().toISOString(),
        type: 'session'
      };
      
      history.unshift(session);
      localStorage.setItem(userKey, JSON.stringify(history));
      
      // Salvar nota separadamente se houver
      if (note.trim()) {
        const notesKey = user ? `codefocus-notes-${user.id}` : 'codefocus-notes';
        const notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
        
        const noteEntry = {
          id: Date.now() + 1,
          message: note,
          tags: tags,
          timestamp: new Date().toISOString(),
          type: 'note',
          sessionId: session.id
        };
        
        notes.unshift(noteEntry);
        localStorage.setItem(notesKey, JSON.stringify(notes));
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  };

  // Salvar estado quando qualquer valor mudar
  useEffect(() => {
    saveTimerState({
      timeLeft,
      isRunning,
      isPaused,
      currentPhase,
      cycleName,
      customFocusMinutes
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRunning, isPaused, currentPhase, cycleName, customFocusMinutes]);

  // Timer principal
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      hasHandledCycleCompleteRef.current = false; // Reset para próxima sessão
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !hasHandledCycleCompleteRef.current) {
      hasHandledCycleCompleteRef.current = true; // Evitar re-execução
      setIsRunning(false);
      notificationManager.notifyCycleComplete(currentPhase);
      
      // Calcular duração da sessão
      const sessionDuration = getPhaseDuration(currentPhase);
      
      // Salvar sessão (localStorage + Supabase)
      saveSession(sessionDuration, currentPhase, cycleName, selectedTags, sessionNote);
      createCycle({
        name: cycleName || `${currentPhase} session`,
        durationSeconds: sessionDuration,
        phase: currentPhase
      }).then((cycle) => {
        if (cycle?.id) lastCreatedCycleIdRef.current = cycle.id;
        refreshTodayStats();
      });

      // Contabilizar ciclos de foco para decidir pausa curta/longa
      let nextBreakPhase = 'shortBreak';
      if (currentPhase === 'focus') {
        const nextCount = getFocusCount() + 1;
        setFocusCount(nextCount);
        const every = settings.cycles_before_long_break || 4;
        if (every > 0 && nextCount % every === 0) {
          nextBreakPhase = 'longBreak';
        }
      }
      
      // Mostrar modal de nota e Git se for sessão de foco
      if (currentPhase === 'focus') {
        setShowNoteModal(true);
        setPendingBreakPhase(nextBreakPhase);
        if (settings.auto_start_breaks) {
          setPendingAutoStartPhase(nextBreakPhase);
        }
        // Sempre mostrar modal Git ao finalizar foco (permitir registrar commit e iniciar descanso)
        setShowGitModal(true);
      }
      
      // Limpar dados da sessão
      setSelectedTags([]);

      // Auto-start (pausas/pomodoros) sem modal de nota
      if (currentPhase !== 'focus') {
        if (settings.auto_start_pomodoros) {
          startFocus();
        }
      }
    }

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, timeLeft, currentPhase, cycleName, selectedTags, sessionNote, getFocusCount, setFocusCount, settings, refreshTodayStats]);

  // Obter duração da fase atual
  const getPhaseDuration = (phase) => {
    switch (phase) {
      case 'focus':
        return customFocusMinutes && !isNaN(Number(customFocusMinutes)) && Number(customFocusMinutes) > 0
          ? Number(customFocusMinutes) * 60
          : (settings.focus_time || 25) * 60;
      case 'shortBreak':
        return (settings.short_break_time || 5) * 60;
      case 'longBreak':
        return (settings.long_break_time || 15) * 60;
      default:
        return (settings.focus_time || 25) * 60;
    }
  };

  // Formatar tempo para display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular progresso para o ring
  const calculateProgress = () => {
    const totalDuration = getPhaseDuration(currentPhase);
    const elapsed = totalDuration - timeLeft;
    return (elapsed / totalDuration) * 100;
  };

  const getPhaseName = () => {
    switch (currentPhase) {
      case 'focus':
        return 'FOCUS';
      case 'shortBreak':
        return 'SHORT BREAK';
      case 'longBreak':
        return 'LONG BREAK';
      default:
        return '';
    }
  };

  const startFocus = () => {
    const minutes = customFocusMinutes && !isNaN(Number(customFocusMinutes)) && Number(customFocusMinutes) > 0
      ? Number(customFocusMinutes)
      : (settings.focus_time || 25);
    setTimeLeft(minutes * 60);
    setCurrentPhase('focus');
    setIsRunning(true);
    setIsPaused(false);
    notificationManager.notifyFocusStarted(cycleName);
  };

  const startShortBreak = () => {
    setTimeLeft((settings.short_break_time || 5) * 60);
    setCurrentPhase('shortBreak');
    setIsRunning(true);
    setIsPaused(false);
    notificationManager.notifyPauseStarted('shortBreak');
  };

  const startLongBreak = () => {
    setTimeLeft((settings.long_break_time || 15) * 60);
    setCurrentPhase('longBreak');
    setIsRunning(true);
    setIsPaused(false);
    notificationManager.notifyPauseStarted('longBreak');
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
    notificationManager.notifyTimerPaused();
  };

  const resumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    notificationManager.notifyTimerResumed();
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft((settings.focus_time || 25) * 60);
    setCurrentPhase('focus');
  };

  const completeTaskEarly = () => {
    hasHandledCycleCompleteRef.current = true;
    setIsRunning(false);
    notificationManager.notifyCycleComplete(currentPhase);
    const sessionDuration = getPhaseDuration(currentPhase) - timeLeft;
    saveSession(sessionDuration, currentPhase, cycleName, selectedTags, sessionNote);
    createCycle({
      name: cycleName || `${currentPhase} session`,
      durationSeconds: sessionDuration,
      phase: currentPhase
    }).then(() => refreshTodayStats());
    if (currentPhase === 'focus') {
      const nextCount = getFocusCount() + 1;
      setFocusCount(nextCount);
      const every = settings.cycles_before_long_break || 4;
      const nextBreakPhase = every > 0 && nextCount % every === 0 ? 'longBreak' : 'shortBreak';
      setShowNoteModal(true);
      setPendingBreakPhase(nextBreakPhase);
      if (settings.auto_start_breaks) setPendingAutoStartPhase(nextBreakPhase);
      setShowGitModal(true);
    }
    setSelectedTags([]);
    if (currentPhase !== 'focus' && settings.auto_start_pomodoros) {
      startFocus();
    }
  };

  const handleStartFocus = () => {
    if (!cycleName.trim()) {
      notificationManager.showToast('Escreva o foco na caixa acima', 'Defina um título curto para este ciclo.', 'warning');
      if (inputRef.current) inputRef.current.focus();
      return;
    }
    startFocus();
  };

  // Calcular progresso
  const progress = calculateProgress();

  // Função auxiliar para obter cor baseada na fase
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'focus':
        return '#FF6B6B'; // Vermelho/Rosa para foco
      case 'shortBreak':
        return '#4ECDC4'; // Turquesa para pausa curta
      case 'longBreak':
        return '#45B7D1'; // Azul para pausa longa
      default:
        return '#FF6B6B';
    }
  };

  // Função auxiliar para obter mensagem de status
  const getStatusMessage = () => {
    if (!isRunning && !isPaused && currentPhase === 'focus') {
      return 'Pronto para focar? 🎯';
    }
    if (isRunning) {
      switch (currentPhase) {
        case 'focus':
          return 'Mantenha o foco! 💪';
        case 'shortBreak':
          return 'Descanse um pouco 😌';
        case 'longBreak':
          return 'Hora de relaxar 🌟';
        default:
          return '';
      }
    }
    if (isPaused) {
      return 'Timer pausado ⏸️';
    }
    return '';
  };

  // Expor métodos para o componente pai
  useImperativeHandle(ref, () => ({
    toggleTimer: () => {
      if (!isRunning && !isPaused) {
        handleStartFocus();
      } else if (isRunning) {
        pauseTimer();
      } else if (isPaused) {
        resumeTimer();
      }
    },
    resetTimer: () => {
      resetTimer();
    },
    startFocus: () => {
      startFocus();
    },
    startShortBreak: () => {
      startShortBreak();
    },
    startLongBreak: () => {
      startLongBreak();
    }
  }));

  return (
    <div className="flex flex-col items-center justify-center gap-2 h-full min-h-0 py-2">
      {/* Status Message */}
      <div className="text-center shrink-0 h-7">
        <p className="text-base text-white/80 animate-fade-in">
          {getStatusMessage()}
        </p>
      </div>

      {/* Timer Principal - Design Melhorado */}
      <div className="relative w-full max-w-2xl flex-1 min-h-0 flex flex-col items-center justify-center">
        {/* Timer Circular com Progress Ring - tamanho reduzido para caber sem scroll */}
        <div className="relative mx-auto w-72 h-72 shrink-0">
          {/* Círculo de fundo */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 384" preserveAspectRatio="xMidYMid meet">
            <circle
              cx="192"
              cy="192"
              r="170"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="20"
            />
          </svg>

          {/* Progress Ring Animado */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 384 384" preserveAspectRatio="xMidYMid meet">
            <circle
              cx="192"
              cy="192"
              r="170"
              fill="none"
              stroke={getPhaseColor()}
              strokeWidth="20"
              strokeDasharray={`${2 * Math.PI * 170}`}
              strokeDashoffset={`${2 * Math.PI * 170 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out filter drop-shadow-lg"
              style={{
                filter: `drop-shadow(0 0 20px ${getPhaseColor()})`
              }}
            />
          </svg>

          {/* Indicador removido conforme solicitação */}

          {/* Relógio Digital no centro */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-5xl font-light text-white mb-1 font-mono tracking-wider">
              {formatTime(timeLeft)}
            </div>
            <div className="text-white/60 text-base mb-0.5 truncate max-w-[200px] mx-auto">
              {cycleName && currentPhase === 'focus' ? cycleName : getPhaseName()}
            </div>
            <div className="text-white/40 text-xs">
              {Math.round(progress)}% completo
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex justify-center gap-6 shrink-0 mt-2">
          <div className="text-center">
            <p className="text-white/60 text-xs">Sessões hoje</p>
            <p className="text-xl font-semibold text-white">{todayStats.sessions}</p>
          </div>
          <div className="text-center">
            <p className="text-white/60 text-xs">Tempo total</p>
            <p className="text-xl font-semibold text-white">{todayStats.minutes}min</p>
          </div>
        </div>
      </div>

      {/* Botões de Controle Melhorados */}
      <div className="flex flex-col items-center gap-3 shrink-0 mt-2">
        {!isRunning && !isPaused && (
          <div className="flex flex-col items-center gap-3">
            {/* Input de nome do ciclo integrado */}
            {currentPhase === 'focus' && (
              <input
                type="text"
                placeholder="O que você vai focar agora?"
                value={cycleName}
                onChange={(e) => setCycleName(e.target.value)}
                ref={inputRef}
                className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition-all duration-200 w-72 text-center text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && cycleName.trim()) {
                    startFocus();
                  }
                }}
              />
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleStartFocus}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 text-sm"
              >
                <span className="text-xl">▶</span>
                Iniciar Foco
              </button>
            </div>
          </div>
        )}

        {isRunning && (
          <div className="flex gap-3 items-center">
            <button
              onClick={pauseTimer}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 text-sm"
            >
              <span className="text-xl">⏸</span>
              Pausar
            </button>
            {currentPhase === 'focus' && (
              <button
                onClick={completeTaskEarly}
                className="bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 font-medium py-3 px-5 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 border border-emerald-400/30 flex items-center gap-2 text-sm shadow-lg"
              >
                <span className="text-lg">✓</span>
                Concluir tarefa
              </button>
            )}
          </div>
        )}

        {isPaused && (
          <div className="flex gap-3">
            <button
              onClick={resumeTimer}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2 text-sm"
            >
              <span className="text-xl">▶</span>
              Continuar
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 text-red-300 font-medium py-3 px-5 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 border border-red-300/20 flex items-center gap-2 text-sm"
            >
              <span className="text-xl">↺</span>
              Reiniciar
            </button>
          </div>
        )}

        {/* Ações Rápidas */}
        {isRunning && currentPhase === 'focus' && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <button
              onClick={() => setShowNoteModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-200 text-sm flex items-center gap-2"
            >
              📝 Adicionar nota
            </button>
            <button
              onClick={() => setShowGitModal(true)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-200 text-sm flex items-center gap-2"
            >
              💾 Salvar progresso
            </button>
          </div>
        )}

        {/* Projeto GitHub - mostrar quando parado */}
        {!isRunning && !isPaused && (
          <button
            onClick={() => setShowRepoSelector(true)}
            className="mt-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/80 text-xs flex items-center gap-2 border border-white/10"
          >
            {selectedRepo ? `📂 ${selectedRepo.full_name || selectedRepo.repo}` : '🔗 Selecionar projeto GitHub'}
          </button>
        )}
      </div>

      {/* Campo único mantido acima. Entrada adicional removida. */}

      {/* Ações rápidas de pausas removidas para manter apenas o campo e iniciar */}

      {/* Seletor de repositório GitHub */}
      <RepoSelector
        isOpen={showRepoSelector}
        onClose={() => setShowRepoSelector(false)}
        selectedRepo={selectedRepo}
        onSelect={(repo) => setSelectedRepo(repo)}
      />

      {/* Modal de Notas e Tags */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">📝 Nota da Sessão</h2>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">O que você fez?</label>
                <textarea
                  value={sessionNote}
                  onChange={(e) => setSessionNote(e.target.value)}
                  placeholder="Descreva o que você trabalhou nesta sessão..."
                  rows={4}
                  className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Tags disponíveis */}
              <div>
                <label className="block text-white/80 text-sm mb-2">Tags (opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {(availableTags.length > 0 ? availableTags : ['frontend', 'backend', 'bugfix', 'feature', 'refactor', 'testing']).map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) 
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-white/60 hover:text-white'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowNoteModal(false);
                    setShowGitModal(false); // Fechar modal Git para não bloquear o descanso
                    setSessionNote('');
                    setSelectedTags([]);
                    setPendingAutoStartPhase(null);
                    // Iniciar descanso ao fechar (usar pendingBreakPhase como fonte da verdade)
                    if (pendingBreakPhase === 'shortBreak') {
                      startShortBreak();
                      setPendingBreakPhase(null);
                    } else if (pendingBreakPhase === 'longBreak') {
                      startLongBreak();
                      setPendingBreakPhase(null);
                    } else if (pendingAutoStartPhase === 'focus') {
                      startFocus();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Pular
                </button>
                <button
                  onClick={() => {
                    // Salvar nota
                    if (sessionNote.trim()) {
                      const notesKey = user ? `codefocus-notes-${user.id}` : 'codefocus-notes';
                      const notes = JSON.parse(localStorage.getItem(notesKey) || '[]');
                      
                      const noteEntry = {
                        id: Date.now(),
                        message: sessionNote,
                        tags: selectedTags,
                        timestamp: new Date().toISOString(),
                        type: 'note'
                      };
                      
                      notes.unshift(noteEntry);
                      localStorage.setItem(notesKey, JSON.stringify(notes));
                    }
                    
                    setShowNoteModal(false);
                    setShowGitModal(false); // Fechar modal Git para não bloquear o descanso
                    setSessionNote('');
                    setSelectedTags([]);
                    setPendingAutoStartPhase(null);
                    // Iniciar descanso ao salvar (usar pendingBreakPhase como fonte da verdade)
                    if (pendingBreakPhase === 'shortBreak') {
                      startShortBreak();
                      setPendingBreakPhase(null);
                    } else if (pendingBreakPhase === 'longBreak') {
                      startLongBreak();
                      setPendingBreakPhase(null);
                    } else if (pendingAutoStartPhase === 'focus') {
                      startFocus();
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Git Commit Modal - renderizado por último para ficar no topo; ao confirmar commit inicia descanso */}
      <GitCommitModal
        isOpen={showGitModal}
        userId={user?.id}
        onClose={() => {
          setShowGitModal(false);
          setShowNoteModal(false);
          if (pendingBreakPhase) {
            if (pendingBreakPhase === 'shortBreak') startShortBreak();
            else if (pendingBreakPhase === 'longBreak') startLongBreak();
            setPendingBreakPhase(null);
            notificationManager.notifyPauseStarted(pendingBreakPhase);
          }
        }}
        cycleName={cycleName}
        onCommit={(result) => {
          setShowGitModal(false);
          setShowNoteModal(false);
          notificationManager.showToast('Commit registrado!', 'Hora do descanso.', 'success');
          // Caso 1: Timer chegou a zero (pendingBreakPhase já definido) - atualizar ciclo com git_commit
          if (pendingBreakPhase) {
            const cycleId = lastCreatedCycleIdRef.current;
            if (cycleId && result?.message) {
              apiService.updateCycle(cycleId, { git_commit: result.message }).catch(() => {});
            }
            lastCreatedCycleIdRef.current = null;
            if (pendingBreakPhase === 'shortBreak') startShortBreak();
            else if (pendingBreakPhase === 'longBreak') startLongBreak();
            notificationManager.notifyPauseStarted(pendingBreakPhase);
            setPendingBreakPhase(null);
            return;
          }
          // Caso 2: Commit antecipado (timer ainda rodando com tempo restante)
          if (currentPhase === 'focus' && (isRunning || timeLeft > 0)) {
            setIsRunning(false);
            const durationWorked = Math.max(0, getPhaseDuration('focus') - timeLeft);
            saveSession(durationWorked, 'focus', cycleName, selectedTags, sessionNote);
            createCycle({
              name: cycleName || 'focus session',
              durationSeconds: durationWorked,
              phase: 'focus',
              gitCommit: result?.message
            }).then(() => refreshTodayStats());
            setSelectedTags([]);
            const nextCount = getFocusCount() + 1;
            setFocusCount(nextCount);
            const every = settings.cycles_before_long_break || 4;
            const nextBreakPhase = every > 0 && nextCount % every === 0 ? 'longBreak' : 'shortBreak';
            if (nextBreakPhase === 'shortBreak') startShortBreak();
            else startLongBreak();
            notificationManager.notifyPauseStarted(nextBreakPhase);
          }
        }}
      />
    </div>
  );
});

Timer.displayName = 'Timer';

export default Timer; 