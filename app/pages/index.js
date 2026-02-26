import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import useKeyboardShortcuts from '../hooks/useKeyboardShortcuts'
import Timer from '../components/Timer'
import LoginScreen from '../components/LoginScreen'
import RegisterScreen from '../components/RegisterScreen'
import EmailVerificationScreen from '../components/EmailVerificationScreen'
import Navigation from '../components/Navigation'
import Dashboard from '../components/Dashboard'
import SettingsScreen from '../components/SettingsScreen'
import EditProfileModal from '../components/EditProfileModal'
import TagManager from '../components/TagManager'
import ShortcutsModal from '../components/ShortcutsModal'
import OnboardingModal from '../components/OnboardingModal'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, logout, pendingVerification, user } = useAuth()
  const [activeView, setActiveView] = useState('timer')
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [authView, setAuthView] = useState('login')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const timerRef = useRef(null)
  const offlineModeEnabled = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

  // Definir atalhos de teclado
  const shortcuts = {
    // Timer controls
    'space': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.toggleTimer()
      }
    },
    'r': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.resetTimer()
      }
    },
    'f': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.startFocus()
      }
    },
    'b': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.startShortBreak()
      }
    },
    'l': () => {
      if (activeView === 'timer' && timerRef.current) {
        timerRef.current.startLongBreak()
      }
    },
    // Navigation
    'ctrl+d': () => setActiveView('dashboard'),
    'ctrl+s': () => setActiveView('settings'),
    'ctrl+t': () => setActiveView('tasks'),
    // General
    '?': () => setShowShortcuts(true),
    'escape': () => {
      setShowShortcuts(false)
      setShowEditProfile(false)
      if (activeView !== 'timer') {
        setActiveView('timer')
      }
    },
  }

  useKeyboardShortcuts(shortcuts)

  // OAuth: quando Supabase redireciona para /?code=xxx, enviar para o callback da API e limpar a URL
  useEffect(() => {
    if (!router.isReady || typeof window === 'undefined') return
    const { code, error: qError } = router.query
    if (code && !qError) {
      window.location.replace(`/api/auth/oauth-callback?code=${encodeURIComponent(code)}`)
      return
    }
    // Limpar query string da URL (ex.: ?github_connected=1) deixando só o domínio
    const hasParams = Object.keys(router.query).length > 0
    if (hasParams && router.pathname === '/') {
      router.replace('/', undefined, { shallow: true })
    }
  }, [router.isReady, router.query, router.pathname])

  // Mostrar notificação de boas-vindas
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined' && window.showToast) {
      window.showToast('Bem-vindo ao CodeFocus! Pressione ? para ver os atalhos', 'info', 5000)
    }
  }, [isAuthenticated])

  // Onboarding (primeiro login)
  useEffect(() => {
    if (!isAuthenticated || !user) return
    try {
      const key = `codefocus-onboarding-completed-${user.id}`
      const completed = localStorage.getItem(key) === 'true'
      if (!completed) setShowOnboarding(true)
    } catch {}
  }, [isAuthenticated, user])

  // Evitar setState dentro do render: tratar navegação para "profile" aqui
  useEffect(() => {
    if (activeView !== 'profile') return
    setShowEditProfile(true)
    setActiveView('timer')
  }, [activeView])

  // Mostrar tela de verificação se necessário
  if (pendingVerification) {
    return (
      <EmailVerificationScreen 
        onBack={() => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('codefocus-user')
            window.location.reload()
          }
        }} 
      />
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        {authView === 'login' ? (
          <LoginScreen onGoToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterScreen onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case 'timer':
        return <Timer ref={timerRef} />
      case 'dashboard':
        return <Dashboard onClose={() => setActiveView('timer')} />
      case 'tasks':
        return <TagManager />
      case 'settings':
        return (
          <div className="min-h-screen animate-fade-in">
            <h1 className="text-4xl font-bold text-white mb-6">Configurações</h1>
            <SettingsScreen isOpen={true} onClose={() => setActiveView('timer')} asPage={true} />
          </div>
        )
      default:
        return <Timer ref={timerRef} />
    }
  }

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
          {offlineModeEnabled && (
            <div className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-3 text-yellow-200">
              <p className="text-sm">
                <strong>Modo offline ativo</strong>: seus dados podem ficar apenas no seu navegador (localStorage).
                Para desativar, defina <code>NEXT_PUBLIC_OFFLINE_MODE=false</code>.
              </p>
            </div>
          )}
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

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        userId={user?.id}
        onClose={() => {
          try {
            if (user?.id) localStorage.setItem(`codefocus-onboarding-completed-${user.id}`, 'true')
          } catch {}
          setShowOnboarding(false)
        }}
        onGoToSettings={() => {
          setActiveView('settings')
        }}
        onGoToTags={() => {
          setActiveView('tasks')
        }}
        onGoToTimer={() => {
          setActiveView('timer')
        }}
      />
    </div>
  )
}

