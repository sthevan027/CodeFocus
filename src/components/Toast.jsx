import React, { useState, useEffect } from 'react';

const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: {
      bg: 'from-green-600/20 to-emerald-600/20',
      border: 'border-green-400/30',
      icon: '✅',
      text: 'text-green-400'
    },
    error: {
      bg: 'from-red-600/20 to-pink-600/20',
      border: 'border-red-400/30',
      icon: '❌',
      text: 'text-red-400'
    },
    warning: {
      bg: 'from-yellow-600/20 to-orange-600/20',
      border: 'border-yellow-400/30',
      icon: '⚠️',
      text: 'text-yellow-400'
    },
    info: {
      bg: 'from-blue-600/20 to-cyan-600/20',
      border: 'border-blue-400/30',
      icon: 'ℹ️',
      text: 'text-blue-400'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`fixed top-8 right-8 z-50 ${
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
    >
      <div className={`
        flex items-center gap-3 px-6 py-4 rounded-xl backdrop-blur-md
        bg-gradient-to-r ${style.bg} border ${style.border}
        shadow-2xl min-w-[300px] max-w-[500px]
      `}>
        <span className="text-2xl flex-shrink-0">{style.icon}</span>
        <p className={`${style.text} font-medium`}>{message}</p>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => {
              setIsVisible(false);
              onClose && onClose();
            }, 300);
          }}
          className="ml-auto text-white/40 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

// Toast Provider para gerenciar múltiplas notificações
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expor função globalmente
  useEffect(() => {
    window.showToast = addToast;
    return () => {
      delete window.showToast;
    };
  }, []);

  return (
    <>
      {children}
      <div className="fixed top-8 right-8 z-50 space-y-4">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ transform: `translateY(${index * 80}px)` }}
            className="transition-transform duration-300"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default Toast;