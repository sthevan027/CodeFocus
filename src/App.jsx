import './App.css';
import Timer from './components/Timer';
import LoginScreen from './components/LoginScreen';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import SettingsScreen from './components/SettingsScreen';
import EditProfileModal from './components/EditProfileModal';
import SpotifyIntegration from './components/SpotifyIntegration';
import TagManager from './components/TagManager';
import ShortcutsModal from './components/ShortcutsModal';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { useState, useEffect, useRef } from 'react';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [activeView, setActiveView] = useState('timer');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const timerRef = useRef(null);

  // Definir atalhos de teclado
  const shortcuts = {
    // Timer controls
    'space': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.toggleTimer();
      }
    },
    'r': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.resetTimer();
      }
    },
    'f': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.startFocus();
      }
    },
    'b': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.startShortBreak();
      }
    },
    'l': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.startLongBreak();
      }
    },
    // Navigation
    'ctrl+d': () => setActiveView('dashboard'),
    'ctrl+s': () => setActiveView('settings'),
    'ctrl+m': () => setActiveView('spotify'),
    'ctrl+t': () => setActiveView('tasks'),
    // General
    '?': () => setShowShortcuts(true),
    'escape': () => {
      setShowShortcuts(false);
      setShowEditProfile(false);
      if (activeView !== 'timer') {
        setActiveView('timer');
      }
    },
  };

  useKeyboardShortcuts(shortcuts);

  // Mostrar notificação de boas-vindas
  useEffect(() => {
    if (isAuthenticated && window.showToast) {
      window.showToast('Bem-vindo ao CodeFocus! Pressione ? para ver os atalhos', 'info', 5000);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <LoginScreen />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'timer':
        return <Timer ref={timerRef} />;
      case 'dashboard':
        return <Dashboard onClose={() => setActiveView('timer')} />;
      case 'tasks':
        return <TagManager />;
      case 'spotify':
        return <SpotifyIntegration isOpen={true} onClose={() => setActiveView('timer')} />;
      case 'settings':
        return (
          <div className="min-h-screen animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-6">Configurações</h1>
            <SettingsScreen isOpen={true} onClose={() => setActiveView('timer')} asPage={true} />
          </div>
        );
      case 'profile':
        setShowEditProfile(true);
        setActiveView('timer');
        return <Timer ref={timerRef} />;
      default:
        return <Timer ref={timerRef} />;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Navigation Sidebar */}
      <Navigation 
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-20 overflow-hidden">
        <div className="container mx-auto px-6 py-8">
          {renderContent()}
        </div>
      </main>

      {/* Shortcuts Help Button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-8 left-28 p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all duration-200 group"
        aria-label="Atalhos de teclado"
      >
        <span className="text-xl">⌨️</span>
        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
          Atalhos (?)
        </span>
      </button>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfileModal 
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {/* Shortcuts Modal */}
      <ShortcutsModal 
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App; 