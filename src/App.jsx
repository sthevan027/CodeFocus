import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Timer from './components/Timer';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import UserProfile from './components/UserProfile';
import SettingsScreen from './components/SettingsScreen';
import EditProfileModal from './components/EditProfileModal';

function AppContent() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Header 
          onSettingsClick={() => setShowSettings(true)}
          onEditProfile={() => setShowEditProfile(true)}
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