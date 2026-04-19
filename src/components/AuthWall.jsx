import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn, signUp } from '../lib/supabase'
import { getTimeTheme, applyTheme } from '../lib/theme'

export default function AuthWall() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const theme = getTimeTheme()
    applyTheme(theme)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, { data: { display_name: name } })
        if (error) throw error
        setMessage('Almost there — check your email to confirm, then come back and sign in.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1.1rem',
    fontFamily: 'var(--sans)',
    fontSize: '0.92rem',
    background: 'var(--surface)',
    color: 'var(--text-primary)',
    border: '1px solid var(--glass-border)',
    borderRadius: 12,
    outline: 'none',
    letterSpacing: '0.02em',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  function focusInput(e) {
    e.target.style.borderColor = 'var(--accent)'
    e.target.style.boxShadow = '0 0 0 3px var(--accent-light)'
  }
  function blurInput(e) {
    e.target.style.borderColor = 'var(--glass-border)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="gradient-bg" />

      {/* Floating ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {[
          { size: 400, x: '10%', y: '15%', delay: 0 },
          { size: 300, x: '75%', y: '60%', delay: 2 },
          { size: 200, x: '55%', y: '10%', delay: 4 },
        ].map((blob, i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.18, 0.12] }}
            transition={{ duration: 7 + i * 2, repeat: Infinity, delay: blob.delay, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              width: blob.size, height: blob.size,
              left: blob.x, top: blob.y,
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.25rem',
      }}>
        {/* Logo + tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: '3.5rem', marginBottom: '1rem', display: 'block' }}
          >
            🍃
          </motion.div>
          <h1 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
            fontWeight: 300, letterSpacing: '0.08em',
            color: 'var(--text-primary)', marginBottom: '0.6rem',
          }}>
            One Leaf.
          </h1>
          <p style={{
            fontFamily: 'var(--sans)',
            fontSize: 'clamp(0.82rem, 2vw, 0.92rem)',
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            A daily ritual for curious minds
          </p>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="glass"
          style={{ width: 'min(420px, 100%)', padding: 'clamp(1.75rem, 5vw, 2.5rem)' }}
        >
          {/* Mode tabs */}
          <div style={{
            display: 'flex', background: 'var(--surface)',
            borderRadius: 50, padding: '4px',
            marginBottom: '2rem', border: '1px solid var(--glass-border)',
          }}>
            {['signin', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage('') }}
                style={{
                  flex: 1, padding: '0.55rem', borderRadius: 50,
                  border: 'none', fontFamily: 'var(--sans)',
                  fontSize: '0.82rem', letterSpacing: '0.06em', cursor: 'pointer',
                  transition: 'all 0.25s',
                  background: mode === m ? 'var(--accent)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--text-muted)',
                  fontWeight: mode === m ? 500 : 400,
                }}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ marginBottom: '1.5rem' }}
            >
              <h2 style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(1.3rem, 3.5vw, 1.65rem)',
                fontWeight: 300, color: 'var(--text-primary)', marginBottom: '0.35rem',
              }}>
                {mode === 'signin' ? 'Welcome back.' : 'Begin your practice.'}
              </h2>
              <p style={{
                fontFamily: 'var(--sans)', fontSize: '0.8rem',
                color: 'var(--text-muted)', letterSpacing: '0.04em', lineHeight: 1.6,
              }}>
                {mode === 'signin'
                  ? 'Your jar and all its gatherings are waiting.'
                  : "One small thing every day. That's all it takes."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(90,122,58,0.12)',
                  border: '1px solid rgba(90,122,58,0.35)',
                  borderRadius: 10, padding: '1rem 1.1rem',
                  marginBottom: '1.25rem', color: '#4a6a2a',
                  fontFamily: 'var(--sans)', fontSize: '0.86rem', lineHeight: 1.6,
                }}
              >
                ✓ {message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          {!message && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <input
                      type="text"
                      placeholder="Your name (optional)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={inputStyle}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
              <input
                type="password"
                placeholder={mode === 'signup' ? 'Choose a password (min 6 chars)' : 'Password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ color: '#c05a35', fontSize: '0.82rem', fontFamily: 'var(--sans)', lineHeight: 1.5 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 30px var(--accent-glow)' } : {}}
                whileTap={!loading ? { scale: 0.97 } : {}}
                style={{
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', borderRadius: 50, padding: '0.9rem',
                  marginTop: '0.25rem', fontFamily: 'var(--sans)',
                  fontSize: '0.9rem', letterSpacing: '0.07em',
                  cursor: loading ? 'default' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '0 4px 20px var(--accent-glow)',
                  transition: 'opacity 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {loading ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                      🍃
                    </motion.span>
                    <span>{mode === 'signin' ? 'Signing in…' : 'Creating…'}</span>
                  </>
                ) : (
                  mode === 'signin' ? 'Sign in' : 'Create my account'
                )}
              </motion.button>
            </form>
          )}

          {/* Switch mode */}
          {!message && (
            <p style={{
              marginTop: '1.5rem', textAlign: 'center',
              fontFamily: 'var(--sans)', fontSize: '0.8rem',
              color: 'var(--text-muted)', letterSpacing: '0.03em',
            }}>
              {mode === 'signin' ? (
                <>No account yet?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError('') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: '0.8rem', textDecoration: 'underline' }}
                  >
                    Begin here.
                  </button>
                </>
              ) : (
                <>Already gathering?{' '}
                  <button
                    onClick={() => { setMode('signin'); setError('') }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: '0.8rem', textDecoration: 'underline' }}
                  >
                    Sign in.
                  </button>
                </>
              )}
            </p>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: '2.5rem', fontFamily: 'var(--serif)', fontStyle: 'italic',
            fontSize: '0.85rem', color: 'var(--text-muted)', opacity: 0.6,
            textAlign: 'center', maxWidth: 320, lineHeight: 1.6,
          }}
        >
          "Not all those who wander are lost — some are just gathering."
        </motion.p>
      </div>
    </div>
  )
}