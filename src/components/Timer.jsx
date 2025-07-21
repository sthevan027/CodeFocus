import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('focus');
  const [cycleName, setCycleName] = useState('');
  const [showCycleInput, setShowCycleInput] = useState(false);

  // Timer principal
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert('Ciclo finalizado!');
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

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

  const startFocus = () => {
    setTimeLeft(25 * 60);
    setCurrentPhase('focus');
    setIsRunning(true);
    setIsPaused(false);
  };

  const startShortBreak = () => {
    setTimeLeft(5 * 60);
    setCurrentPhase('shortBreak');
    setIsRunning(true);
    setIsPaused(false);
  };

  const startLongBreak = () => {
    setTimeLeft(15 * 60);
    setCurrentPhase('longBreak');
    setIsRunning(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resumeTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
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
              strokeDashoffset: 283 - (283 * ((25 * 60 - timeLeft) / (25 * 60))) / 100,
              transform: 'rotate(-90deg)', 
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 1s ease-in-out'
            }}
          />
        </svg>

        {/* Timer Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`text-6xl font-bold text-center font-mono ${getPhaseColor()} transition-all duration-300`}>
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
            className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              🎯 Iniciar Foco
            </button>
            
            <button
              onClick={startShortBreak}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              ☕ Pausa Curta
            </button>
            
            <button
              onClick={startLongBreak}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              🛋️ Pausa Longa
            </button>
          </>
        )}

        {isRunning && (
          <>
            <button
              onClick={pauseTimer}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              ⏸️ Pausar
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeTimer}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              ▶️ Continuar
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
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