import './App.css';
import Timer from './components/Timer';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import EditProfileModal from './components/EditProfileModal';
import SpotifyIntegration from './components/SpotifyIntegration';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import { useState } from 'react';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <LoginScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
        onEditProfile={() => setShowEditProfile(true)}
        onDashboardClick={() => setShowDashboard(true)}
        onSpotifyClick={() => setShowSpotify(true)}
      />
      <main className="flex-1 overflow-hidden">
        <Timer />
      </main>

      {/* Modais */}
      {showDashboard && (
        <Dashboard onClose={() => setShowDashboard(false)} />
      )}

      {showSettings && (
        <Settings 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {showEditProfile && (
        <EditProfileModal 
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}

      {showSpotify && (
        <SpotifyIntegration 
          isOpen={showSpotify}
          onClose={() => setShowSpotify(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <AppContent />
      </TimerProvider>
    </AuthProvider>
  );
}

export default App; 