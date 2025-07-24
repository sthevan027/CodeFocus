import React, { useState, useEffect } from 'react';

const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutos em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('focus');
  const [cycleName, setCycleName] = useState('');
  const [showCycleInput, setShowCycleInput] = useState(false);
  const [customFocusMinutes, setCustomFocusMinutes] = useState('');
  
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
      alert('Ciclo finalizado!');
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

  // Componente Flip Card
  const FlipCard = ({ value, label }) => (
    <div className="text-center">
      <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-lg overflow-hidden">
        {/* Container do número */}
        <div className="relative h-12 flex items-center justify-center">
          <span className="text-4xl font-bold tracking-wider text-white">
            {value}
          </span>
        </div>
      </div>
      <div className="text-white/80 text-xs font-medium mt-2 tracking-wider">
        {label}
      </div>
    </div>
  );

  // Obter valores atuais do timer
  const { hours, minutes, seconds } = formatTimeDigital(timeLeft);

  return (
    <div className="flex flex-col items-center">
      {/* Relógio Digital */}
      <div className="relative w-96 mb-8">
        {/* Título COUNTDOWN */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-wider">
            COUNTDOWN
          </h1>
        </div>

        {/* Display do Timer */}
        <div className="flex justify-center items-center space-x-4 mb-6">
          {/* Horas */}
          <FlipCard 
            value={hours}
            label="HOUR"
          />

          {/* Separador */}
          <div className="text-4xl font-bold text-white">:</div>

          {/* Minutos */}
          <FlipCard 
            value={minutes}
            label="MIN"
          />

          {/* Separador */}
          <div className="text-4xl font-bold text-white">:</div>

          {/* Segundos */}
          <FlipCard 
            value={seconds}
            label="SEC"
          />
        </div>

        {/* Fase atual */}
        <div className="text-center mb-4">
          <div className="text-white/90 text-sm font-medium tracking-wider">
            {getPhaseName()}
          </div>
          {cycleName && currentPhase === 'focus' && (
            <div className="text-white/60 text-xs mt-1 max-w-xs mx-auto truncate">
              {cycleName}
            </div>
          )}
        </div>

        {/* Subtítulo */}
        <div className="text-center">
          <div className="text-white/70 text-sm tracking-wider">
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
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {!isRunning && !isPaused && (
          <>
            <button
              onClick={handleStartFocus}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:bg-white/20"
            >
              🎯 Iniciar Foco
            </button>
            
            <button
              onClick={startShortBreak}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:bg-white/20"
            >
              ☕ Pausa Curta
            </button>
            
            <button
              onClick={startLongBreak}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:bg-white/20"
            >
              🛋️ Pausa Longa
            </button>
          </>
        )}

        {isRunning && (
          <>
            <button
              onClick={pauseTimer}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:bg-white/20"
            >
              ⏸️ Pausar
            </button>
          </>
        )}

        {isPaused && (
          <>
            <button
              onClick={resumeTimer}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:bg-white/20"
            >
              ▶️ Continuar
            </button>
            
            <button
              onClick={resetTimer}
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:bg-white/20"
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