import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroCircle from '../components/HeroCircle'
import MoodPicker from '../components/MoodPicker'
import PolaroidCard from '../components/PolaroidCard'
import GlassJar from '../components/GlassJar'
import InkRain from '../components/InkRain'
import AuthModal from '../components/AuthModal'
import Onboarding from '../components/Onboarding'
import { generateCuratedContent, generateWordOfSilence } from '../lib/chatanywhere'
import { useJar, usePreferences } from '../hooks/useJar'
import { useAuth } from '../hooks/useAuth'
import { signOut } from '../lib/supabase'
import { getTimeTheme, applyTheme } from '../lib/theme'

const SILENCE_TIMEOUT = 45000

export default function Home() {
  const { user } = useAuth()
  const { seeds, addSeed } = useJar()
  const { prefs, updatePrefs } = usePreferences()

  const [view, setView] = useState('home') // home | mood | card | inkrain
  const [card, setCard] = useState(null)
  const [loadingCard, setLoadingCard] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [gathered, setGathered] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(!prefs.onboarded)
  const [ephemeralMode, setEphemeralMode] = useState(prefs.ephemeralMode || false)
  const [silenceTimer, setSilenceTimer] = useState(null)
  const [inkRainActive, setInkRainActive] = useState(false)

  // Apply time-of-day theme
  useEffect(() => {
    const theme = getTimeTheme()
    applyTheme(theme)
  }, [])

  // Silence detection — 45s of no interaction
  useEffect(() => {
    if (view !== 'home' || gathered) return

    const reset = () => {
      clearTimeout(silenceTimer)
      const t = setTimeout(() => setInkRainActive(true), SILENCE_TIMEOUT)
      setSilenceTimer(t)
    }

    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    window.addEventListener('click', reset)
    reset()

    return () => {
      clearTimeout(silenceTimer)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('keydown', reset)
      window.removeEventListener('click', reset)
    }
  }, [view, gathered])

  function dismissInkRain() {
    setInkRainActive(false)
  }

  async function handleMoodSelect(mood) {
    setSelectedMood(mood)
    setView('loading')
    setLoadingCard(true)
    const content = await generateCuratedContent(mood, prefs.categories.length ? prefs.categories : ['Telescope'])
    setCard(content)
    setLoadingCard(false)
    setView('card')
  }

  async function handleSaveCard(c) {
    await addSeed({
      text: c.title + ': ' + c.body,
      icon: c.icon || '✨',
      type: c.type,
      ephemeral: ephemeralMode
    })
  }

  async function handleGather(entry) {
    await addSeed({ ...entry, ephemeral: ephemeralMode })
    setGathered(true)
  }

  function handleOnboardingComplete(categories) {
    updatePrefs({ categories, onboarded: true })
    setShowOnboarding(false)
  }

  function toggleEphemeral() {
    const next = !ephemeralMode
    setEphemeralMode(next)
    updatePrefs({ ephemeralMode: next })
  }

  const timeLabel = getTimeTheme().label

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Gradient background */}
      <div className="gradient-bg" />

      {/* Ink rain silence mode */}
      <AnimatePresence>
        {inkRainActive && (
          <motion.div
            onClick={dismissInkRain}
            style={{ position: 'fixed', inset: 0, zIndex: 45, cursor: 'pointer' }}
          >
            <InkRain onWord={generateWordOfSilence} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSuccess={() => setShowAuth(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(1rem, 3vw, 1.75rem) clamp(1.25rem, 4vw, 2.5rem)'
        }}>
          <button
            onClick={() => { setView('home'); setGathered(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontWeight: 300, letterSpacing: '0.12em', color: 'var(--text-primary)',
              opacity: 0.75
            }}>
              One Leaf.
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Time of day */}
            <span style={{
              fontFamily: 'var(--sans)', fontSize: '0.7rem',
              letterSpacing: '0.12em', color: 'var(--text-muted)',
              textTransform: 'uppercase', display: 'none'
            }} className="time-label">
              {timeLabel}
            </span>

            {/* Ephemeral mode toggle */}
            <button
              onClick={toggleEphemeral}
              title={ephemeralMode ? 'Ephemeral mode: thoughts fade in 24h' : 'Permanent mode'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', opacity: ephemeralMode ? 1 : 0.4,
                transition: 'opacity 0.2s'
              }}
            >
              {ephemeralMode ? '🌙' : '☀️'}
            </button>

            {/* Auth */}
            {user ? (
              <button
                onClick={() => signOut()}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)',
                  borderRadius: 50, padding: '0.35rem 0.875rem',
                  fontFamily: 'var(--sans)', fontSize: '0.72rem',
                  letterSpacing: '0.06em', color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                sign out
              </button>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)',
                  borderRadius: 50, padding: '0.35rem 0.875rem',
                  fontFamily: 'var(--sans)', fontSize: '0.72rem',
                  letterSpacing: '0.06em', color: 'var(--text-muted)',
                  cursor: 'pointer', backdropFilter: 'blur(8px)'
                }}
              >
                sign in
              </button>
            )}
          </div>
        </header>

        {/* Center content */}
        <main style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem clamp(1rem, 4vw, 2rem)'
        }}>
          <AnimatePresence mode="wait">

            {/* Home view */}
            {view === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <HeroCircle
                  onGather={handleGather}
                  onDryDay={() => setView('mood')}
                  gathered={gathered}
                />
              </motion.div>
            )}

            {/* Mood picker */}
            {view === 'mood' && (
              <motion.div
                key="mood"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <MoodPicker onSelect={handleMoodSelect} />
              </motion.div>
            )}

            {/* Loading */}
            {view === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
                >
                  🍃
                </motion.div>
                <p style={{
                  fontFamily: 'var(--serif)', fontStyle: 'italic',
                  color: 'var(--text-muted)', fontSize: '1rem'
                }}>
                  Finding something worth knowing…
                </p>
              </motion.div>
            )}

            {/* Polaroid card */}
            {view === 'card' && card && (
              <motion.div
                key="card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <PolaroidCard
                  card={card}
                  onSave={handleSaveCard}
                  onDismiss={() => setView('home')}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Bottom bar */}
        <footer style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: 'clamp(1rem, 3vw, 1.75rem) clamp(1.25rem, 4vw, 2.5rem)'
        }}>
          <GlassJar seeds={seeds} />
        </footer>

        {/* Secret Wunderkammer drawer */}
        <WunderkammerDrawer seeds={seeds} />
      </div>
    </div>
  )
}

// The secret unlabeled drawer at the bottom edge
function WunderkammerDrawer({ seeds }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)

  const OBJECTS = ['🦕', '💎', '🗝️', '🐚', '🧲', '🌀', '🔮', '🪬', '🫧', '🌸']

  return (
    <>
      {/* Drawer handle - tiny, barely visible */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.08)', border: 'none',
          width: 48, height: 6, borderRadius: '4px 4px 0 0',
          cursor: 'pointer', zIndex: 10, transition: 'background 0.2s'
        }}
        onMouseOver={e => e.target.style.background = 'rgba(0,0,0,0.2)'}
        onMouseOut={e => e.target.style.background = 'rgba(0,0,0,0.08)'}
        title="Open the cabinet"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setOpen(false); setSelected(null) }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(20, 10, 5, 0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(600px, 95vw)',
                background: 'linear-gradient(160deg, #2a1a0a, #1a0a05)',
                borderRadius: '20px 20px 0 0',
                padding: '2rem',
                border: '1px solid rgba(180,140,80,0.3)',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
                maxHeight: '80vh', overflow: 'auto'
              }}
            >
              <h2 style={{
                fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 300,
                color: '#d4b870', marginBottom: '0.5rem', letterSpacing: '0.08em'
              }}>
                Wunderkammer
              </h2>
              <p style={{
                fontFamily: 'var(--sans)', fontSize: '0.78rem',
                color: 'rgba(180,140,80,0.5)', marginBottom: '2rem',
                letterSpacing: '0.08em', textTransform: 'uppercase'
              }}>
                Cabinet of curiosities
              </p>

              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '1rem',
                justifyContent: 'center', marginBottom: '1.5rem'
              }}>
                {OBJECTS.map((obj, i) => (
                  <motion.button
                    key={i}
                    onClick={() => setSelected(seeds[i] || null)}
                    whileHover={{ scale: 1.2, y: -4, rotate: Math.random() * 10 - 5 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                      animation: `float ${4 + i * 0.3}s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  >
                    {obj}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: 'rgba(180,140,80,0.08)',
                      border: '1px solid rgba(180,140,80,0.2)',
                      borderRadius: 12, padding: '1rem 1.25rem',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--serif)', fontStyle: 'italic',
                      fontSize: '1rem', color: '#d4b870', lineHeight: 1.7
                    }}>
                      {selected.text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    background: 'none', border: '1px solid rgba(180,140,80,0.3)',
                    borderRadius: 50, padding: '0.5rem 1.5rem',
                    fontFamily: 'var(--sans)', fontSize: '0.78rem',
                    color: 'rgba(180,140,80,0.6)', cursor: 'pointer',
                    letterSpacing: '0.1em'
                  }}
                >
                  close cabinet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
