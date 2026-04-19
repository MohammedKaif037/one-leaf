import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeroCircle from '../components/HeroCircle'
import MoodPicker from '../components/MoodPicker'
import PolaroidCard from '../components/PolaroidCard'
import GlassJar from '../components/GlassJar'
import InkRain from '../components/InkRain'
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

  const [view, setView] = useState('home')
  const [card, setCard] = useState(null)
  const [gathered, setGathered] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(!prefs.onboarded)
  const [ephemeralMode, setEphemeralMode] = useState(prefs.ephemeralMode || false)
  const [silenceTimer, setSilenceTimer] = useState(null)
  const [inkRainActive, setInkRainActive] = useState(false)

  useEffect(() => {
    const theme = getTimeTheme()
    applyTheme(theme)
  }, [])

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

  async function handleMoodSelect(mood) {
    setView('loading')
    const content = await generateCuratedContent(mood, prefs.categories.length ? prefs.categories : ['Telescope'])
    setCard(content)
    setView('card')
  }

  async function handleSaveCard(c) {
    await addSeed({ text: c.title + ': ' + c.body, icon: c.icon || '✨', type: c.type, ephemeral: ephemeralMode })
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
      <div className="gradient-bg" />

      {/* Silence / ink rain */}
      <AnimatePresence>
        {inkRainActive && (
          <motion.div
            onClick={() => setInkRainActive(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 45, cursor: 'pointer' }}
          >
            <InkRain onWord={generateWordOfSilence} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding overlay */}
      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      {/* App shell */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(1rem, 3vw, 1.75rem) clamp(1.25rem, 4vw, 2.5rem)'
        }}>
          <button onClick={() => { setView('home'); setGathered(false) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              fontWeight: 300, letterSpacing: '0.12em', color: 'var(--text-primary)', opacity: 0.75
            }}>
              One Leaf.
            </span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Time of day label */}
            <span style={{
              fontFamily: 'var(--sans)', fontSize: '0.7rem', letterSpacing: '0.12em',
              color: 'var(--text-muted)', textTransform: 'uppercase'
            }}>
              {timeLabel}
            </span>

            {/* Ephemeral toggle */}
            <button
              onClick={toggleEphemeral}
              title={ephemeralMode ? 'Ephemeral: thoughts vanish in 24h' : 'Permanent mode'}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.1rem', opacity: ephemeralMode ? 1 : 0.35,
                transition: 'opacity 0.2s'
              }}
            >
              {ephemeralMode ? '🌙' : '☀️'}
            </button>

            {/* User info + sign out — always shown since only authed users reach here */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {user?.email && (
                <span style={{
                  fontFamily: 'var(--sans)', fontSize: '0.7rem',
                  color: 'var(--text-muted)', letterSpacing: '0.04em',
                  maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {user.email}
                </span>
              )}
              <button
                onClick={() => signOut()}
                style={{
                  background: 'none', border: '1px solid var(--glass-border)',
                  borderRadius: 50, padding: '0.35rem 0.875rem',
                  fontFamily: 'var(--sans)', fontSize: '0.72rem',
                  letterSpacing: '0.06em', color: 'var(--text-muted)', cursor: 'pointer'
                }}
              >
                sign out
              </button>
            </div>
          </div>
        </header>

        {/* Main canvas */}
        <main style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2rem clamp(1rem, 4vw, 2rem)'
        }}>
          <AnimatePresence mode="wait">

            {view === 'home' && (
              <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <HeroCircle onGather={handleGather} onDryDay={() => setView('mood')} gathered={gathered} />
              </motion.div>
            )}

            {view === 'mood' && (
              <motion.div key="mood" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <MoodPicker onSelect={handleMoodSelect} />
              </motion.div>
            )}

            {view === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🍃</motion.div>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1rem' }}>
                  Finding something worth knowing…
                </p>
              </motion.div>
            )}

            {view === 'card' && card && (
              <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <PolaroidCard card={card} onSave={handleSaveCard} onDismiss={() => setView('home')} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer — glass jar */}
        <footer style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: 'clamp(1rem, 3vw, 1.75rem) clamp(1.25rem, 4vw, 2.5rem)'
        }}>
          <GlassJar seeds={seeds} />
        </footer>

        {/* Secret Wunderkammer */}
        <WunderkammerDrawer seeds={seeds} />
      </div>
    </div>
  )
}

function WunderkammerDrawer({ seeds }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const OBJECTS = ['🦕', '💎', '🗝️', '🐚', '🧲', '🌀', '🔮', '🪬', '🫧', '🌸']

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Open the cabinet"
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.08)', border: 'none',
          width: 48, height: 6, borderRadius: '4px 4px 0 0',
          cursor: 'pointer', zIndex: 10, transition: 'background 0.2s'
        }}
        onMouseOver={e => e.target.style.background = 'rgba(0,0,0,0.2)'}
        onMouseOut={e => e.target.style.background = 'rgba(0,0,0,0.08)'}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setOpen(false); setSelected(null) }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(20,10,5,0.85)', backdropFilter: 'blur(12px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: 'min(600px, 100%)',
                background: 'linear-gradient(160deg, #2a1a0a, #1a0a05)',
                borderRadius: '20px 20px 0 0',
                padding: '2rem',
                border: '1px solid rgba(180,140,80,0.3)',
                boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
                maxHeight: '80vh', overflowY: 'auto'
              }}
            >
              <h2 style={{
                fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 300,
                color: '#d4b870', marginBottom: '0.4rem', letterSpacing: '0.08em'
              }}>Wunderkammer</h2>
              <p style={{
                fontFamily: 'var(--sans)', fontSize: '0.72rem',
                color: 'rgba(180,140,80,0.5)', marginBottom: '2rem',
                letterSpacing: '0.1em', textTransform: 'uppercase'
              }}>Cabinet of curiosities</p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {OBJECTS.map((obj, i) => (
                  <motion.button key={i}
                    onClick={() => setSelected(seeds[i] || null)}
                    whileHover={{ scale: 1.2, y: -4 }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                      animation: `float ${4 + i * 0.3}s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  >{obj}</motion.button>
                ))}
              </div>

              <AnimatePresence>
                {selected && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{
                      background: 'rgba(180,140,80,0.08)', border: '1px solid rgba(180,140,80,0.2)',
                      borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', textAlign: 'center'
                    }}>
                    <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem', color: '#d4b870', lineHeight: 1.7 }}>
                      {selected.text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ textAlign: 'center' }}>
                <button onClick={() => setOpen(false)} style={{
                  background: 'none', border: '1px solid rgba(180,140,80,0.3)',
                  borderRadius: 50, padding: '0.5rem 1.5rem',
                  fontFamily: 'var(--sans)', fontSize: '0.78rem',
                  color: 'rgba(180,140,80,0.6)', cursor: 'pointer', letterSpacing: '0.1em'
                }}>close cabinet</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


