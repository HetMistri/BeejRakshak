import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Registration from './pages/Registration'
import Dashboard from './pages/Dashboard'
import { TranslationProvider } from './translation/TranslationProvider'

function App() {
  const { session, registrationComplete, loading, refresh, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-900 flex flex-col items-center justify-center gap-6">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-blob-slow" />
        </div>

        {/* Logo */}
        <div className="relative animate-float">
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-glow-emerald bg-white/5 flex items-center justify-center">
            <img src="/tea.png" alt="BeejRakshak" className="w-full h-full object-contain p-1" />
          </div>
        </div>

        {/* Spinner */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-[3px] border-white/10 border-t-emerald-400 animate-spin" />
        </div>

        <p className="text-emerald-200/80 font-medium tracking-wide text-sm">Loading BeejRakshak...</p>
      </div>
    )
  }

  return (
    <TranslationProvider>
      <Routes>
        {/* Login: only accessible when NOT logged in */}
        <Route
          path="/login"
          element={
            !session
              ? <Login onLogin={refresh} />
              : registrationComplete
                ? <Navigate to="/dashboard" replace />
                : <Navigate to="/registration" replace />
          }
        />

        {/* Registration: only accessible when logged in and NOT registered */}
        <Route
          path="/registration"
          element={
            !session
              ? <Navigate to="/login" replace />
              : registrationComplete
                ? <Navigate to="/dashboard" replace />
                : <Registration session={session} onComplete={refresh} onSignOut={signOut} />
          }
        />

        {/* Dashboard: only accessible when logged in and registered */}
        <Route
          path="/dashboard"
          element={
            !session
              ? <Navigate to="/login" replace />
              : !registrationComplete
                ? <Navigate to="/registration" replace />
                : <Dashboard session={session} onSignOut={signOut} />
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </TranslationProvider>
  )
}

export default App
