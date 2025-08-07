import { useState, useEffect, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';

// Context para notificações
const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification deve ser usado dentro de NotificationProvider');
  }
  return context;
};

// Componente de Notificação Individual
const Notification = ({ id, message, type = 'info', duration = 4000, onClose, action }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const types = {
    success: {
      bg: 'bg-green-500',
      icon: '✅',
      title: 'Sucesso!'
    },
    error: {
      bg: 'bg-red-500',
      icon: '❌',
      title: 'Erro!'
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: '⚠️',
      title: 'Atenção!'
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'ℹ️',
      title: 'Informação'
    }
  };

  const style = types[type] || types.info;

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm
        bg-gray-900/90 border border-white/10
        transform transition-all duration-300 ease-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 w-10 h-10 ${style.bg} rounded-full flex items-center justify-center`}>
        <span className="text-lg">{style.icon}</span>
      </div>
      
      <div className="flex-1">
        <p className="text-white font-medium text-sm">{style.title}</p>
        <p className="text-gray-300 text-sm mt-1">{message}</p>
        
        {action && (
          <button
            onClick={() => {
              action.onClick();
              handleClose();
            }}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
        aria-label="Fechar notificação"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Provider de Notificações
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = (message, type = 'info', options = {}) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      duration: options.duration || 4000,
      action: options.action
    };

    setNotifications(prev => [...prev, notification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    showSuccess: (message, options) => showNotification(message, 'success', options),
    showError: (message, options) => showNotification(message, 'error', options),
    showWarning: (message, options) => showNotification(message, 'warning', options),
    showInfo: (message, options) => showNotification(message, 'info', options),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
          {notifications.map(notification => (
            <Notification
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </div>,
        document.body
      )}
    </NotificationContext.Provider>
  );
};

// Hook helpers para facilitar o uso
export const useSuccessNotification = () => {
  const { showSuccess } = useNotification();
  return showSuccess;
};

export const useErrorNotification = () => {
  const { showError } = useNotification();
  return showError;
};