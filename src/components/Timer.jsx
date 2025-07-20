import React, { useState } from 'react';
import { useTimer } from '../context/TimerContext';

const Timer = () => {
  const {
    timeLeft,
    isRunning,
    isPaused,
    currentPhase,
    cycleName,
    setCycleName,
    startFocus,
    startShortBreak,
    startLongBreak,
    pauseTimer,
    resumeTimer,
    resetTimer,
    skipTimer,
    settings,
  } = useTimer();

  const [showCycleInput, setShowCycleInput] = useState(false);

  // Calcular progresso para o ring
  const totalTime = settings[currentPhase === 'focus' ? 'focusTime' : 
    currentPhase === 'shortBreak' ? 'shortBreakTime' : 'longBreakTime'] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  // Formatar tempo
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Obter cor baseada na fase
  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'focus':
        return 'text-red-400';
      case 'shortBreak':
        return 'text-green-400';
      case 'longBreak':
        return 'text-blue-400';
      default:
        return 'text-white';
    }
  };

  const getPhaseName = () => {
    switch (currentPhase) {
      case 'focus':
        return 'Foco';
      case 'shortBreak':
        return 'Pausa Curta';
      case 'longBreak':
        return 'Pausa Longa';
      default:
        return '';
    }
  };

  const handleStartFocus = () => {
    if (!cycleName.trim()) {
      setShowCycleInput(true);
      return;
    }
    startFocus();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Progress Ring */}
      <div className="relative w-80 h-80 mb-8">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={getPhaseColor()}
            style={{ 
              strokeDasharray: 283,
              strokeDashoffset: 283 - (283 * progress) / 100,
              transform: 'rotate(-90deg)', 
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>

        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`timer-display ${getPhaseColor()} transition-all duration-300`}>
            {formatTime(timeLeft)}
          </div>
          
          <p className="text-gray-300 text-lg font-medium mt-2">
            {getPhaseName()}
          </p>

          {cycleName && currentPhase === 'focus' && (
            <p className="text-gray-400 text-sm mt-1 max-w-xs text-center truncate">
              {cycleName}
            </p>
          )}
        </div>
      </div>

      {/* Cycle Name Input */}
      {showCycleInput && (
        <div className="mb-6 w-full max-w-md transition-all duration-300">
          <input
            type="text"
            placeholder="Nome do seu foco atual..."
            value={cycleName}
            onChange={(e) => setCycleName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg glass-effect text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {!isRunning && !isPaused && (
          <>
            <button
              onClick={handleStartFocus}
              className="btn-primary hover:scale-105 transition-transform"
            >
              🎯 Iniciar Foco
            </button>
            
            <button
              onClick={startShortBreak}
              className="btn-secondary hover:scale-105 transition-transform"
            >
              ☕ Pausa Curta
            </button>
            
            <button
              onClick={startLongBreak}
              className="btn-secondary hover:scale-105 transition-transform"
            >
              🛋️ Pausa Longa
            </button>
          </>
        )}

        {isRunning && (
          <>
            <button
              onClick={pauseTimer}
              className="btn-secondary hover:scale-105 transition-transform"
            >
              ⏸️ Pausar
            </button>
            
            <button
              onClick={skipTimer}
              className="btn-secondary hover:scale-105 transition-transform"
            >
              ⏭️ Pular
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeTimer}
              className="btn-primary hover:scale-105 transition-transform"
            >
              ▶️ Continuar
            </button>
            
            <button
              onClick={resetTimer}
              className="btn-secondary hover:scale-105 transition-transform"
            >
              🔄 Resetar
            </button>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowCycleInput(!showCycleInput)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✏️ {cycleName ? 'Editar' : 'Adicionar'} Nome
        </button>
      </div>
    </div>
  );
};

export default Timer; 