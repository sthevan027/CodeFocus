import './App.css';
import Timer from './components/Timer';
import LoginScreen from './components/LoginScreen';
import Header from './components/Header';
import { AuthProvider, useAuth } from './context/AuthContext';
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
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 