import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Home from './pages/Home'
import DetallePuesto from './pages/DetallePuesto'
import SplashScreen from './components/SplashScreen'
import LoginOnboarding from './components/LoginOnboarding'

// Clave para localStorage - recuerda si el usuario ya vio el onboarding
const ONBOARDING_SEEN_KEY = 'antojitos_onboarding_seen'

function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    // Verificar si es la primera vez del usuario
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_SEEN_KEY)

    if (!authLoading && !showSplash) {
      // Si no hay usuario y no ha visto onboarding, mostrarlo
      if (!user && !hasSeenOnboarding) {
        setShowOnboarding(true)
      }
    }
  }, [user, authLoading, showSplash])

  const handleSplashFinish = () => {
    setShowSplash(false)
  }

  const handleSkipOnboarding = () => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, 'true')
    setShowOnboarding(false)
  }

  // Mostrar splash
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />
  }

  // Mostrar loading mientras verifica auth
  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--neutral-100)' }}
      >
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    )
  }

  // Mostrar onboarding si es necesario
  if (showOnboarding && !user) {
    return <LoginOnboarding onSkip={handleSkipOnboarding} />
  }

  // Mostrar app principal
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/puesto/:id" element={<DetallePuesto />} />
      </Routes>
    </BrowserRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
