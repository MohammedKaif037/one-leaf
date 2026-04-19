import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Home from './pages/Home'
import AuthWall from './components/AuthWall'
import './index.css'

function AppContent() {
  const { user, loading } = useAuth()

  // Full-screen loader while Supabase checks existing session
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-from)',
      }}>
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { repeat: Infinity, duration: 2, ease: 'linear' },
            scale: { repeat: Infinity, duration: 2 }
          }}
          style={{ fontSize: '2.5rem' }}
        >
          🍃
        </motion.div>
      </div>
    )
  }

  // No authenticated user → show full-screen auth wall. Cannot be bypassed or dismissed.
  if (!user) {
    return <AuthWall />
  }

  // Authenticated user → full app
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )

}
