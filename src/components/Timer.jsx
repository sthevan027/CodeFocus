import React, { useState, useEffect } from 'react';
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
  const [customFocusMinutes, setCustomFocusMinutes] = useState(initialState.customFocusMinutes);
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

  // Formatar tempo para display digital
  const formatTimeDigital = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  // Inicializar flip states com valores corretos
  const initialTime = formatTimeDigital(25 * 60);
  const [flipStates, setFlipStates] = useState({
    hours: { current: initialTime.hours, next: initialTime.hours, isFlipping: false },
    minutes: { current: initialTime.minutes, next: initialTime.minutes, isFlipping: false },
    seconds: { current: initialTime.seconds, next: initialTime.seconds, isFlipping: false }
  });

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

  // Atualizar flip states quando o tempo muda
  useEffect(() => {
    const { hours, minutes, seconds } = formatTimeDigital(timeLeft);
    
    setFlipStates(prev => {
      const newState = { ...prev };
      
      // Verificar se cada dígito mudou
      if (hours !== prev.hours.current) {
        newState.hours = { current: prev.hours.current, next: hours, isFlipping: true };
        setTimeout(() => {
          setFlipStates(current => ({
            ...current,
            hours: { current: hours, next: hours, isFlipping: false }
          }));
        }, 300);
      }
      
      if (minutes !== prev.minutes.current) {
        newState.minutes = { current: prev.minutes.current, next: minutes, isFlipping: true };
        setTimeout(() => {
          setFlipStates(current => ({
            ...current,
            minutes: { current: minutes, next: minutes, isFlipping: false }
          }));
        }, 300);
      }
      
      if (seconds !== prev.seconds.current) {
        newState.seconds = { current: prev.seconds.current, next: seconds, isFlipping: true };
        setTimeout(() => {
          setFlipStates(current => ({
            ...current,
            seconds: { current: seconds, next: seconds, isFlipping: false }
          }));
        }, 300);
      }
      
      return newState;
    });
  }, [timeLeft]);

  // Obter cor baseada na fase
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'focus':
        return 'from-red-500 to-red-600';
      case 'shortBreak':
        return 'from-green-500 to-green-600';
      case 'longBreak':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-white to-gray-300';
    }
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

  // Componente Flip Card
  const FlipCard = ({ value, label }) => (
    <div className="text-center">
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg overflow-hidden">
        {/* Container do número */}
        <div className="relative h-16 flex items-center justify-center">
          <span className="text-5xl font-bold tracking-wider text-white">
            {value}
          </span>
        </div>
      </div>
      <div className="text-white/80 text-sm font-medium mt-3 tracking-wider">
        {label}
      </div>
    </div>
  );

  // Obter valores atuais do timer
  const { hours, minutes, seconds } = formatTimeDigital(timeLeft);

  return (
    <div className="flex flex-col items-center">
      {/* Relógio Digital */}
      <div className="relative w-full max-w-2xl mb-12">
        {/* Título COUNTDOWN */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white tracking-wider">
            COUNTDOWN
          </h1>
        </div>

        {/* Display do Timer */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          {/* Horas */}
          <FlipCard 
            value={hours}
            label="HOUR"
          />

          {/* Separador */}
          <div className="text-6xl font-bold text-white">:</div>

          {/* Minutos */}
          <FlipCard 
            value={minutes}
            label="MIN"
          />

          {/* Separador */}
          <div className="text-6xl font-bold text-white">:</div>

          {/* Segundos */}
          <FlipCard 
            value={seconds}
            label="SEC"
          />
        </div>

        {/* Fase atual */}
        <div className="text-center mb-6">
          <div className="text-white/90 text-2xl font-medium tracking-wider">
            {getPhaseName()}
          </div>
          {cycleName && currentPhase === 'focus' && (
            <div className="text-white/60 text-lg mt-2 max-w-md mx-auto truncate">
              {cycleName}
            </div>
          )}
        </div>

        {/* Subtítulo */}
        <div className="text-center">
          <div className="text-white/70 text-lg tracking-wider">
            with POMODORO TECHNIQUE
          </div>
        </div>
      </div>

      {/* Cycle Name Input + Custom Minutes */}
      {showCycleInput && (
        <div className="mb-6 w-full max-w-md transition-all duration-300 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Nome do seu foco atual..."
            value={cycleName}
            onChange={(e) => setCycleName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && cycleName.trim()) {
                setShowCycleInput(false);
                startFocus();
              }
            }}
            autoFocus
          />
          <input
            type="number"
            min="1"
            max="180"
            placeholder="Tempo de foco (min)"
            value={customFocusMinutes}
            onChange={e => setCustomFocusMinutes(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {!isRunning && !isPaused && (
          <>
            <button
              onClick={handleStartFocus}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-lg"
            >
              ▷ Iniciar Foco
            </button>
            
            <button
              onClick={startShortBreak}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-lg"
            >
              ☕ Pausa Curta
            </button>
            
            <button
              onClick={startLongBreak}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-lg"
            >
              🧘 Pausa Longa
            </button>
          </>
        )}

        {isRunning && (
          <>
            <button
              onClick={pauseTimer}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-lg"
            >
              ⏸️ Pausar
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeTimer}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-lg"
            >
              ▶️ Continuar
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg text-lg"
            >
              🔄 Resetar
            </button>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowCycleInput(!showCycleInput)}
          className="text-gray-400 hover:text-white transition-colors text-lg"
        >
          ✏️ Editar Nome
        </button>
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
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-md">
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
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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