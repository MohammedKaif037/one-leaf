import { useState, useEffect, useRef, useCallback } from 'react'
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

const SILENCE_TIMEOUT = 50000

const DAILY_WHISPERS = [
  'A single observation is worth a thousand assumptions.',
  'Wonder is the beginning of wisdom.',
  'Notice one small thing. That\'s enough.',
  'The curious mind never runs dry.',
  'Every day hides something worth keeping.',
  'Pay attention. Almost everything is interesting.',
  'Small things remembered become big things understood.',
  'Collect moments the way others collect things.',
  'Today will teach you something — if you\'re willing.',
  'The world is full of overlooked marvels.',
  'Slow down. The interesting things don\'t announce themselves.',
  'What did the day whisper that you almost missed?',
]

const TYPE_COLORS = {
  fact:        { bg: 'rgba(90,122,58,0.1)',  border: 'rgba(90,122,58,0.25)',  text: '#4a6a2a' },
  observation: { bg: 'rgba(42,74,122,0.1)',  border: 'rgba(42,74,122,0.25)',  text: '#2a4a7a' },
  exercise:    { bg: 'rgba(122,90,42,0.1)',  border: 'rgba(122,90,42,0.25)',  text: '#7a5a2a' },
  puzzle:      { bg: 'rgba(122,42,90,0.1)',  border: 'rgba(122,42,90,0.25)',  text: '#7a2a5a' },
  gathering:   { bg: 'rgba(100,80,60,0.07)', border: 'rgba(100,80,60,0.18)', text: '#6b5c4a' },
}

function getDailyWhisper() {
  return DAILY_WHISPERS[new Date().getDate() % DAILY_WHISPERS.length]
}

function getGreeting(hour, name) {
  const first = name?.split(' ')[0] || ''
  const label = first ? `, ${first}` : ''
  if (hour >= 5  && hour < 12) return `Good morning${label}.`
  if (hour >= 12 && hour < 17) return `Good afternoon${label}.`
  if (hour >= 17 && hour < 21) return `Good evening${label}.`
  return `Still awake${label}?`
}

function calcStreak(seeds) {
  if (!seeds.length) return 0
  const dates = [...new Set(seeds.map(s => new Date(s.created_at).toDateString()))]
    .map(d => new Date(d)).sort((a, b) => b - a)
  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const diff = (dates[i-1] - dates[i]) / 86400000
    if (diff <= 1.5) streak++
    else break
  }
  if ((new Date() - dates[0]) / 86400000 > 1.5) return 0
  return streak
}

function AmbientParticles() {
  const particles = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i, size: 3 + Math.random() * 5,
      x: Math.random() * 100, y: Math.random() * 100,
      duration: 14 + Math.random() * 18, delay: Math.random() * 12,
      opacity: 0.05 + Math.random() * 0.09,
    }))
  ).current

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <motion.div key={p.id}
          animate={{
            y: [0, -28, -12, -32, 0], x: [0, 8, -6, 4, 0],
            rotate: [0, 8, -4, 10, 0],
            opacity: [p.opacity, p.opacity * 1.7, p.opacity, p.opacity * 1.5, p.opacity],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: '50%',
            background: 'var(--accent)',
          }}
        />
      ))}
    </div>
  )
}

const pageV = {
  enter:  { opacity: 0, y: 22, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  exit:   { opacity: 0, y: -14, scale: 0.98, transition: { duration: 0.28 } },
}

export default function Home() {
  const { user } = useAuth()
  const { seeds, addSeed } = useJar()
  const { prefs, updatePrefs } = usePreferences()

  const [view, setView] = useState('home')
  const [card, setCard] = useState(null)
  const [gathered, setGathered] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [ephemeralMode, setEphemeralMode] = useState(false)
  const [inkRainActive, setInkRainActive] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const silenceRef = useRef(null)

  const hour = new Date().getHours()
  const theme = getTimeTheme()
  const streak = calcStreak(seeds)
  const todayCount = seeds.filter(s =>
    new Date(s.created_at).toDateString() === new Date().toDateString()
  ).length
  const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || ''

  useEffect(() => {
    if (prefs !== null) {
      setShowOnboarding(!prefs.onboarded)
      setEphemeralMode(prefs.ephemeralMode || false)
    }
  }, [prefs])

  useEffect(() => { applyTheme(getTimeTheme()) }, [])

  const resetSilence = useCallback(() => {
    clearTimeout(silenceRef.current)
    if (view !== 'home' || gathered || showOnboarding) return
    silenceRef.current = setTimeout(() => setInkRainActive(true), SILENCE_TIMEOUT)
  }, [view, gathered, showOnboarding])

  useEffect(() => {
    window.addEventListener('mousemove', resetSilence)
    window.addEventListener('keydown', resetSilence)
    window.addEventListener('click', resetSilence)
    resetSilence()
    return () => {
      clearTimeout(silenceRef.current)
      window.removeEventListener('mousemove', resetSilence)
      window.removeEventListener('keydown', resetSilence)
      window.removeEventListener('click', resetSilence)
    }
  }, [resetSilence])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = () => setMenuOpen(false)
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [menuOpen])

  async function handleMoodSelect(mood) {
    setView('loading')
    const categories = prefs?.categories?.length ? prefs.categories : ['Telescope']
    const content = await generateCuratedContent(mood, categories)
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

  function goHome() { setView('home'); setGathered(false); setCard(null) }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="gradient-bg" />
      <AmbientParticles />

      <AnimatePresence>
        {inkRainActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setInkRainActive(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 45, cursor: 'pointer' }}>
            <InkRain onWord={generateWordOfSilence} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && <Onboarding onComplete={cats => { updatePrefs({ categories: cats, onboarded: true }); setShowOnboarding(false) }} />}
      </AnimatePresence>

      <div style={{ position: 'relative', zIndex: 5, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(1rem,2.5vw,1.5rem) clamp(1.25rem,4vw,2.5rem)',
          position: 'relative', zIndex: 20,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
            <button onClick={goHome} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
              <span style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1rem,2.5vw,1.2rem)', fontWeight: 300, letterSpacing: '0.12em', color: 'var(--text-primary)', opacity: 0.8 }}>
                One Leaf.
              </span>
            </button>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              {getGreeting(hour, displayName)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {theme.label}
            </span>

            {/* Look Back */}
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setView('archive')}
              style={{
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(12px)', borderRadius: 50, padding: '0.38rem 0.85rem',
                cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.7rem',
                color: 'var(--text-secondary)', letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
              📖 Look back
            </motion.button>

            {/* Ephemeral */}
            <button onClick={() => { const n = !ephemeralMode; setEphemeralMode(n); updatePrefs({ ephemeralMode: n }) }}
              title={ephemeralMode ? 'Ephemeral: fades in 24h' : 'Permanent mode'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: ephemeralMode ? 1 : 0.32, transition: 'opacity 0.2s' }}>
              {ephemeralMode ? '🌙' : '☀️'}
            </button>

            {/* User menu */}
            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <button onClick={() => setMenuOpen(m => !m)}
                style={{
                  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(12px)', borderRadius: 50,
                  padding: '0.38rem 0.85rem', cursor: 'pointer',
                  fontFamily: 'var(--sans)', fontSize: '0.7rem',
                  color: 'var(--text-muted)', letterSpacing: '0.04em',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                <span style={{ maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName || user?.email}
                </span>
                <span style={{ opacity: 0.4, fontSize: '0.6rem' }}>▾</span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.16 }}
                    style={{
                      position: 'absolute', top: 'calc(100% + 6px)', right: 0, minWidth: 178,
                      background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)',
                      border: '1px solid var(--glass-border)', borderRadius: 14,
                      padding: '0.45rem', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    }}>
                    {[
                      { icon: '🌿', label: 'Edit interests', fn: () => setShowOnboarding(true) },
                      { icon: '📖', label: 'Look back', fn: () => setView('archive') },
                      { sep: true },
                      { icon: '🚪', label: 'Sign out', fn: () => signOut(), danger: true },
                    ].map((item, i) => item.sep
                      ? <div key={i} style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '0.25rem 0.5rem' }} />
                      : (
                        <button key={i} onClick={() => { item.fn(); setMenuOpen(false) }}
                          style={{
                            width: '100%', background: 'none', border: 'none', borderRadius: 9,
                            padding: '0.52rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.55rem',
                            cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.79rem',
                            letterSpacing: '0.04em', color: item.danger ? '#c05a35' : 'var(--text-secondary)',
                            transition: 'background 0.15s', textAlign: 'left',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                          <span>{item.icon}</span><span>{item.label}</span>
                        </button>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* ── Main canvas ── */}
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem clamp(1rem,4vw,2rem) 1rem' }}>
          <AnimatePresence mode="wait">

            {view === 'home' && (
              <motion.div key="home" variants={pageV} initial="enter" animate="center" exit="exit">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                  {/* Daily whisper */}
                  <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    style={{
                      fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
                      fontSize: 'clamp(0.88rem,2vw,1rem)', color: 'var(--text-muted)',
                      letterSpacing: '0.03em', textAlign: 'center', maxWidth: 340,
                    }}>
                    "{getDailyWhisper()}"
                  </motion.p>

                  <HeroCircle onGather={handleGather} onDryDay={() => setView('mood')} gathered={gathered} streak={streak} todayCount={todayCount} />

                  {/* Stats row */}
                  {!gathered && seeds.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
                      style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <StatPill icon="🫙" label={`${seeds.length} gathered`} />
                      {streak > 1 && <StatPill icon="🔥" label={`${streak} day streak`} />}
                      {todayCount > 0 && <StatPill icon="✨" label={`${todayCount} today`} />}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {view === 'mood' && (
              <motion.div key="mood" variants={pageV} initial="enter" animate="center" exit="exit"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <MoodPicker onSelect={handleMoodSelect} onBack={goHome} />
              </motion.div>
            )}

            {view === 'loading' && (
              <motion.div key="loading" variants={pageV} initial="enter" animate="center" exit="exit" style={{ textAlign: 'center' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
                  style={{ fontSize: '2.75rem', marginBottom: '1.25rem', display: 'block' }}>
                  🍃
                </motion.div>
                <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.05rem' }}>
                  Finding something worth knowing…
                </p>
              </motion.div>
            )}

            {view === 'card' && card && (
              <motion.div key="card" variants={pageV} initial="enter" animate="center" exit="exit">
                <PolaroidCard card={card} onSave={handleSaveCard} onDismiss={goHome} />
              </motion.div>
            )}

            {view === 'archive' && (
              <motion.div key="archive" variants={pageV} initial="enter" animate="center" exit="exit"
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <ArchiveView seeds={seeds} onClose={goHome} />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* ── Footer ── */}
        <footer style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: 'clamp(0.75rem,2vw,1.25rem) clamp(1.25rem,4vw,2.5rem)',
        }}>
          <GlassJar seeds={seeds} />
        </footer>

        <WunderkammerDrawer seeds={seeds} />
      </div>
    </div>
  )
}

function StatPill({ icon, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.26rem 0.7rem',
      background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
      borderRadius: 50, backdropFilter: 'blur(12px)',
      fontSize: '0.7rem', fontFamily: 'var(--sans)',
      color: 'var(--text-secondary)', letterSpacing: '0.05em',
    }}>
      <span style={{ fontSize: '0.82rem' }}>{icon}</span>
      <span>{label}</span>
    </div>
  )
}

// ── Archive View ──
function ArchiveView({ seeds, onClose }) {
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = seeds.filter(s =>
    (tab === 'all' || s.type === tab) &&
    (!search || s.text.toLowerCase().includes(search.toLowerCase()))
  )

  const grouped = filtered.reduce((acc, seed) => {
    const d = new Date(seed.created_at).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!acc[d]) acc[d] = []
    acc[d].push(seed)
    return acc
  }, {})

  const tabs = ['all', 'gathering', 'fact', 'observation', 'exercise', 'puzzle']

  return (
    <div style={{ width: 'min(580px, 96vw)', maxHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--text-primary)' }}>
            Your gathering
          </h2>
          <p style={{ fontFamily: 'var(--sans)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '0.12rem' }}>
            {seeds.length} thing{seeds.length !== 1 ? 's' : ''} collected
          </p>
        </div>
        <button onClick={onClose} className="btn-ghost" style={{ padding: '0.42rem 1rem', fontSize: '0.74rem', marginTop: '0.25rem' }}>
          ← Back
        </button>
      </div>

      <input className="leaf-input" placeholder="Search your gatherings…" value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ fontSize: '0.86rem', padding: '0.6rem 1rem' }} />

      <div style={{ overflowX: 'auto', paddingBottom: '2px' }}>
        <div className="pill-tabs" style={{ width: 'max-content', minWidth: '100%' }}>
          {tabs.map(t => (
            <button key={t} className={`pill-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.4rem', paddingRight: '2px' }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌱</div>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem' }}>
              {search ? 'Nothing matches that search.' : 'Nothing gathered yet in this category.'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dateSeds]) => (
            <div key={date}>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.66rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.55rem', paddingLeft: '0.2rem' }}>
                {date}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {dateSeds.map((seed, i) => {
                  const c = TYPE_COLORS[seed.type] || TYPE_COLORS.gathering
                  return (
                    <motion.div key={seed.id || i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, padding: '0.8rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.7rem' }}>
                      <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>{seed.icon || '🌱'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: 'var(--sans)', fontSize: '0.86rem', color: 'var(--text-primary)', lineHeight: 1.65 }}>
                          {seed.text}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.28rem', flexWrap: 'wrap' }}>
                          {seed.type && seed.type !== 'gathering' && (
                            <span style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: c.text, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 50, padding: '0.12rem 0.5rem', fontFamily: 'var(--sans)', fontWeight: 500 }}>
                              {seed.type}
                            </span>
                          )}
                          {seed.ephemeral && <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>🌙 ephemeral</span>}
                          <span style={{ fontSize: '0.63rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
                            {new Date(seed.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Wunderkammer ──
function WunderkammerDrawer({ seeds }) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const OBJECTS = ['🦕', '💎', '🗝️', '🐚', '🧲', '🌀', '🔮', '🪬', '🫧', '🌸']

  return (
    <>
      <button onClick={() => setOpen(true)} title="Cabinet of curiosities"
        style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.07)', border: 'none', width: 52, height: 5, borderRadius: '4px 4px 0 0', cursor: 'pointer', zIndex: 15, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.18)'; e.currentTarget.style.height = '7px' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.07)'; e.currentTarget.style.height = '5px' }}
      />
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => { setOpen(false); setSelected(null) }}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,10,5,0.82)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              onClick={e => e.stopPropagation()}
              style={{ width: 'min(640px,100%)', background: 'linear-gradient(165deg,#2a1a0a,#1a0e04)', borderRadius: '22px 22px 0 0', padding: '2rem 2rem 2.5rem', border: '1px solid rgba(180,140,80,0.25)', boxShadow: '0 -24px 80px rgba(0,0,0,0.5)', maxHeight: '78vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.65rem', fontWeight: 300, color: '#d4b870', letterSpacing: '0.08em' }}>Wunderkammer</h2>
                <button onClick={() => setOpen(false)} style={{ background: 'rgba(180,140,80,0.15)', border: '1px solid rgba(180,140,80,0.25)', borderRadius: 50, width: 28, height: 28, cursor: 'pointer', color: 'rgba(180,140,80,0.7)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: 'rgba(180,140,80,0.42)', marginBottom: '1.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Cabinet of curiosities · {seeds.length} specimen{seeds.length !== 1 ? 's' : ''}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {OBJECTS.map((obj, i) => (
                  <motion.button key={i} onClick={() => setSelected(seeds[i] || null)}
                    whileHover={{ scale: 1.22, y: -5 }} whileTap={{ scale: 0.92 }}
                    style={{ background: selected === seeds[i] ? 'rgba(180,140,80,0.15)' : 'none', border: selected === seeds[i] ? '1px solid rgba(180,140,80,0.35)' : '1px solid transparent', borderRadius: 12, width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: seeds[i] ? 'pointer' : 'default', fontSize: 'clamp(1.6rem,4.5vw,2.2rem)', filter: seeds[i] ? 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))' : 'grayscale(1) opacity(0.28)', transition: 'all 0.2s' }}>
                    {obj}
                  </motion.button>
                ))}
              </div>
              <AnimatePresence>
                {selected && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ background: 'rgba(180,140,80,0.07)', border: '1px solid rgba(180,140,80,0.18)', borderRadius: 14, padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{selected.icon || '🌱'}</span>
                      <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '0.97rem', color: '#d4b870', lineHeight: 1.7 }}>{selected.text}</p>
                    </div>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: '0.63rem', color: 'rgba(180,140,80,0.38)', marginTop: '0.5rem', letterSpacing: '0.04em' }}>
                      {new Date(selected.created_at).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              {seeds.length === 0 && (
                <p style={{ textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'rgba(180,140,80,0.38)', fontSize: '0.95rem', padding: '1rem' }}>
                  The cabinet awaits its first specimen.
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}