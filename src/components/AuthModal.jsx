import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, signUp } from '../lib/supabase'

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        onSuccess?.()
        onClose?.()
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setMessage('Check your email to confirm your account.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    fontFamily: 'var(--sans)', fontSize: '0.9rem',
    background: 'var(--surface)', color: 'var(--text-primary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 10, outline: 'none',
    letterSpacing: '0.02em',
    transition: 'border 0.2s'
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="glass"
        style={{ width: 'min(400px, 92vw)', padding: '2rem' }}
      >
        <h2 style={{
          fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 300,
          color: 'var(--text-primary)', marginBottom: '0.25rem'
        }}>
          {mode === 'signin' ? 'Welcome back' : 'Begin your practice'}
        </h2>
        <p style={{
          fontFamily: 'var(--sans)', fontSize: '0.8rem', color: 'var(--text-muted)',
          marginBottom: '1.75rem', letterSpacing: '0.04em'
        }}>
          {mode === 'signin' ? 'Your jar awaits.' : 'Save your gatherings across all your devices.'}
        </p>

        {message ? (
          <div style={{
            background: 'rgba(90,122,58,0.1)', border: '1px solid rgba(90,122,58,0.3)',
            borderRadius: 10, padding: '1rem', color: '#5a7a3a',
            fontFamily: 'var(--sans)', fontSize: '0.88rem', lineHeight: 1.6
          }}>
            {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <input
              type="email" placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)}
              required style={inputStyle}
            />
            <input
              type="password" placeholder="password" value={password}
              onChange={e => setPassword(e.target.value)}
              required minLength={6} style={inputStyle}
            />

            {error && (
              <p style={{ color: '#c05a35', fontSize: '0.82rem', fontFamily: 'var(--sans)' }}>
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: 50, padding: '0.85rem', marginTop: '0.5rem',
                fontFamily: 'var(--sans)', fontSize: '0.9rem', letterSpacing: '0.06em',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </motion.button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <button
            onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: '0.82rem',
              color: 'var(--text-muted)', letterSpacing: '0.04em'
            }}
          >
            {mode === 'signin' ? "Don't have an account? Begin here." : 'Already gathering? Sign in.'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
