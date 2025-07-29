import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import notificationManager from '../utils/notificationUtils';
import GitCommitModal from './GitCommitModal';
import SpotifyQuickControl from './SpotifyQuickControl';

const Timer = () => {
  const { user } = useAuth();
  
  // Carregar estado inicial do localStorage com dados do usuário
  const loadTimerState = () => {
    try {
      const userKey = user ? `codefocus-timer-state-${user.id}` : 'codefocus-timer-state';
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const state = JSON.parse(saved);
        return {
          timeLeft: state.timeLeft || 25 * 60,
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
      timeLeft: 25 * 60,
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
  const [selectedTags, setSelectedTags] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [sessionNote, setSessionNote] = useState('');
  
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
  }, [timeLeft, isRunning, isPaused, currentPhase, cycleName, customFocusMinutes]);

  // Timer principal
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      notificationManager.notifyCycleComplete(currentPhase);
      
      // Calcular duração da sessão
      const sessionDuration = getPhaseDuration(currentPhase) - timeLeft;
      
      // Salvar sessão
      saveSession(sessionDuration, currentPhase, cycleName, selectedTags, sessionNote);
      
      // Mostrar modal de nota se for sessão de foco
      if (currentPhase === 'focus') {
        setShowNoteModal(true);
      }
      
      // Limpar dados da sessão
      setSelectedTags([]);
      setSessionNote('');
      
      // Mostrar modal Git se for um ciclo de foco
      if (currentPhase === 'focus' && cycleName) {
        setShowGitModal(true);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Obter duração da fase atual
  const getPhaseDuration = (phase) => {
    switch (phase) {
      case 'focus':
        return customFocusMinutes && !isNaN(Number(customFocusMinutes)) && Number(customFocusMinutes) > 0
          ? Number(customFocusMinutes) * 60
          : 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
      default:
        return 25 * 60;
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
      : 25;
    setTimeLeft(minutes * 60);
    setCurrentPhase('focus');
    setIsRunning(true);
    setIsPaused(false);
    notificationManager.notifyFocusStarted(cycleName);
  };

  const startShortBreak = () => {
    setTimeLeft(5 * 60);
    setCurrentPhase('shortBreak');
    setIsRunning(true);
    setIsPaused(false);
    notificationManager.notifyPauseStarted('shortBreak');
  };

  const startLongBreak = () => {
    setTimeLeft(15 * 60);
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
    setTimeLeft(25 * 60);
    setCurrentPhase('focus');
  };

  const handleStartFocus = () => {
    if (!cycleName.trim()) {
      setShowCycleInput(true);
      return;
    }
    startFocus();
  };

  // Calcular progresso
  const progress = calculateProgress();

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Timer Principal - Design da Imagem */}
      <div className="relative w-full max-w-2xl mb-12 mt-8">
        {/* Timer Circular com Progress Ring */}
        <div className="relative mx-auto w-96 h-96 mb-8">
          {/* Progress Ring - Linhas pontilhadas ao redor */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            {/* Círculo base com linhas pontilhadas */}
            <circle
              cx="192"
              cy="192"
              r="160"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2"
              strokeDasharray="4 8"
            />
            
            {/* Progress ring vermelho/rosa - preenche no sentido horário */}
            <circle
              cx="192"
              cy="192"
              r="160"
              fill="none"
              stroke="#FF6B6B"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 160}`}
              strokeDashoffset={`${2 * Math.PI * 160 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Relógio Digital no centro */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-6xl font-light text-white mb-2 font-mono">
              {formatTime(timeLeft)}
            </div>
            <div className="text-white/60 text-lg">
              {cycleName && currentPhase === 'focus' ? cycleName : getPhaseName()}
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Controle */}
      <div className="flex flex-col items-center gap-8 mb-12">
        {!isRunning && !isPaused && (
          <button
            onClick={handleStartFocus}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20"
          >
            <span className="text-green-400 mr-2">▶</span>
            Start Focus
          </button>
        )}

        {isRunning && (
          <button
            onClick={pauseTimer}
            className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium py-3 px-8 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20"
          >
            ⏸ Pause
          </button>
        )}

        {isPaused && (
          <div className="flex gap-4">
            <button
              onClick={resumeTimer}
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 border border-white/20"
            >
              ▶ Resume
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-red-500/20 backdrop-blur-sm hover:bg-red-500/30 text-red-300 font-medium py-3 px-6 rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95 border border-red-300/20"
            >
              🔄 Reset
            </button>
          </div>
        )}
      </div>

      {/* Cycle Name Input */}
      {showCycleInput && (
        <div className="mb-6 w-full max-w-md transition-all duration-300">
          <input
            type="text"
            placeholder="Nome do seu foco atual..."
            value={cycleName}
            onChange={(e) => setCycleName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && cycleName.trim()) {
                setShowCycleInput(false);
                startFocus();
              }
            }}
            autoFocus
          />
        </div>
      )}

      {/* Botões de Ação Rápida */}
      <div className="flex justify-center gap-8 mb-8">
        {!isRunning && !isPaused && (
          <>
            <button
              onClick={startShortBreak}
              className="text-white/60 hover:text-white transition-colors text-lg"
            >
              ☕ Short Break
            </button>
            
            <button
              onClick={startLongBreak}
              className="text-white/60 hover:text-white transition-colors text-lg"
            >
              🧘 Long Break
            </button>
          </>
        )}
      </div>

      {/* Git Commit Modal */}
      <GitCommitModal
        isOpen={showGitModal}
        onClose={() => setShowGitModal(false)}
        cycleName={cycleName}
        onCommit={(result) => {
          console.log('Commit realizado:', result);
        }}
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
                  {['frontend', 'backend', 'bugfix', 'feature', 'refactor', 'testing'].map(tag => (
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
                  onClick={() => setShowNoteModal(false)}
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
                    setSessionNote('');
                    setSelectedTags([]);
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

      {/* Spotify Quick Control */}
      <SpotifyQuickControl />
    </div>
  );
};

export default Timer; 