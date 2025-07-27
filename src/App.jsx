import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Timer from './components/Timer';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import UserProfile from './components/UserProfile';
import SettingsScreen from './components/SettingsScreen';
import EditProfileModal from './components/EditProfileModal';
import Dashboard from './components/Dashboard';
import SpotifyIntegration from './components/SpotifyIntegration';
import ProductivityTips from './components/ProductivityTips';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center relative overflow-hidden">
        {/* Logo de fundo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <img src="/logo.svg" alt="Logo Background" className="w-96 h-96 object-contain" />
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <RegisterScreen onGoToLogin={() => setShowRegister(false)} />;
    }
    return <LoginScreen onGoToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 relative overflow-hidden">
      {/* Logo de fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <img src="/logo.svg" alt="Logo Background" className="w-full h-full object-cover" />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Header 
          onSettingsClick={() => setShowSettings(true)}
          onEditProfile={() => setShowEditProfile(true)}
          onDashboardClick={() => setShowDashboard(true)}
          onSpotifyClick={() => setShowSpotify(true)}
        />
        
        <main className="mt-8">
          <Timer />
        </main>

        {/* Tela de Configurações */}
        <SettingsScreen
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Modal de Editar Perfil */}
        <EditProfileModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
        />

        {/* Dashboard */}
        <Dashboard
          isOpen={showDashboard}
          onClose={() => setShowDashboard(false)}
        />

        {/* Spotify Integration */}
        <SpotifyIntegration
          isOpen={showSpotify}
          onClose={() => setShowSpotify(false)}
        />

        {/* Dicas de Produtividade */}
        <ProductivityTips />
      </div>
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