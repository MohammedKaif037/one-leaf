import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { reflectOnGathering } from '../lib/chatanywhere'

const ILLUSTRATIONS = ['🌱', '✨', '🌙', '🍃', '🫧', '🌿', '💫', '🪷']

export default function HeroCircle({ onGather, onDryDay, gathered, streak = 0, todayCount = 0 }) {
  const [phase, setPhase] = useState('idle')
  const [text, setText] = useState('')
  const [reflection, setReflection] = useState('')
  const [loadingReflection, setLoadingReflection] = useState(false)
  const [illustration] = useState(() => ILLUSTRATIONS[Math.floor(Math.random() * ILLUSTRATIONS.length)])
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef(null)

  useEffect(() => { if (gathered) setPhase('done') }, [gathered])

  function handleCircleClick() {
    if (phase === 'idle') {
      setPhase('writing')
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }

  async function handleSubmit() {
    if (!text.trim()) return
    setLoadingReflection(true)
    setPhase('done')
    const r = await reflectOnGathering(text)
    setReflection(r)
    setLoadingReflection(false)
    onGather({ text: text.trim(), icon: '🌱', type: 'gathering' })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  function handleTextChange(e) {
    setText(e.target.value)
    setCharCount(e.target.value.length)
  }

  const circleSize = 'min(280px, 68vw)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem' }}>
      <AnimatePresence mode="wait">

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <motion.div key="idle"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>

            {/* Animated rings */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Outer ring */}
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.12, 0.06, 0.12] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  width: `calc(${circleSize} + 48px)`,
                  height: `calc(${circleSize} + 48px)`,
                  borderRadius: '50%',
                  border: '1px solid var(--accent)',
                  pointerEvents: 'none',
                }}
              />
              {/* Middle ring */}
              <motion.div
                animate={{ scale: [1, 1.04, 1], opacity: [0.18, 0.08, 0.18] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{
                  position: 'absolute',
                  width: `calc(${circleSize} + 22px)`,
                  height: `calc(${circleSize} + 22px)`,
                  borderRadius: '50%',
                  border: '1px solid var(--accent)',
                  pointerEvents: 'none',
                }}
              />

              {/* Main circle */}
              <motion.button
                onClick={handleCircleClick}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: circleSize, height: circleSize,
                  borderRadius: '50%',
                  background: 'var(--glass-bg)',
                  border: '1.5px solid var(--glass-border)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: 'var(--shadow-lift), 0 0 60px var(--accent-glow)',
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.875rem',
                  animation: 'breathe 5s ease-in-out infinite',
                  position: 'relative', zIndex: 2,
                }}
              >
                <motion.span
                  animate={{ rotate: [0, 3, -2, 0], y: [0, -3, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 'clamp(2.75rem, 9vw, 4rem)', lineHeight: 1 }}
                >
                  {illustration}
                </motion.span>
                <p style={{
                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
                  fontSize: 'clamp(0.9rem, 2.3vw, 1.08rem)',
                  color: 'var(--text-secondary)', letterSpacing: '0.02em',
                  textAlign: 'center', padding: '0 1.5rem', lineHeight: 1.5,
                }}>
                  What did you gather today?
                </p>

                {/* Streak badge inside circle */}
                {streak > 0 && (
                  <div style={{
                    position: 'absolute', bottom: '1.2rem',
                    display: 'flex', alignItems: 'center', gap: '0.28rem',
                    background: 'var(--accent-light)', border: '1px solid var(--accent-glow)',
                    borderRadius: 50, padding: '0.18rem 0.6rem',
                    fontFamily: 'var(--sans)', fontSize: '0.62rem',
                    letterSpacing: '0.06em', color: 'var(--accent)', fontWeight: 500,
                  }}>
                    🔥 {streak} day{streak > 1 ? 's' : ''}
                  </div>
                )}
              </motion.button>
            </div>

            {/* Dry day link */}
            <motion.button
              onClick={onDryDay}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: '0.88rem', color: 'var(--text-muted)',
                letterSpacing: '0.04em', padding: '0.5rem 1rem',
                borderBottom: '1px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent' }}
            >
              The soil is dry today.
            </motion.button>
          </motion.div>
        )}

        {/* ── WRITING ── */}
        {phase === 'writing' && (
          <motion.div key="writing"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ width: 'min(500px, 92vw)' }}>

            <div className="glass-heavy" style={{ padding: '1.75rem 1.75rem 1.5rem' }}>
              <p style={{
                fontFamily: 'var(--serif)', fontSize: '1.25rem', fontWeight: 300,
                fontStyle: 'italic', color: 'var(--text-secondary)',
                lineHeight: 1.5, marginBottom: '1.25rem',
              }}>
                What small thing grew in you today?
              </p>

              <div style={{ position: 'relative' }}>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder="I learned that… I noticed… I felt… I wondered…"
                  rows={4}
                  className="leaf-input"
                  style={{ paddingBottom: '2rem' }}
                />
                {/* Char count */}
                <span style={{
                  position: 'absolute', bottom: '0.6rem', right: '0.8rem',
                  fontFamily: 'var(--sans)', fontSize: '0.62rem',
                  color: charCount > 280 ? 'var(--accent)' : 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}>
                  {charCount}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  ↵ Enter to plant it
                </span>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <button onClick={() => setPhase('idle')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    cancel
                  </button>
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!text.trim()}
                    whileHover={text.trim() ? { scale: 1.04 } : {}}
                    whileTap={text.trim() ? { scale: 0.97 } : {}}
                    className="btn-primary"
                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
                  >
                    Plant it 🌱
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Prompts carousel */}
            <WritingPrompts />
          </motion.div>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <motion.div key="done"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', maxWidth: 'min(420px, 90vw)' }}>
            <motion.div
              animate={{ rotate: [0, 8, -6, 0] }}
              transition={{ duration: 0.7, delay: 0.15 }}
              style={{ fontSize: '4rem', marginBottom: '1.1rem', display: 'block' }}
            >
              🫙
            </motion.div>
            <h2 style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(1.25rem,3vw,1.65rem)',
              fontWeight: 300, color: 'var(--text-primary)', marginBottom: '0.7rem',
            }}>
              Into the jar it goes.
            </h2>

            {loadingReflection && (
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                reflecting…
              </p>
            )}

            {reflection && !loadingReflection && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass"
                style={{ padding: '1rem 1.25rem', textAlign: 'left' }}
              >
                <p style={{
                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem',
                  color: 'var(--text-secondary)', lineHeight: 1.75,
                }}>
                  "{reflection}"
                </p>
              </motion.div>
            )}

            {/* Today's count */}
            {todayCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                style={{ marginTop: '1rem', fontFamily: 'var(--sans)', fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}
              >
                {todayCount} thing{todayCount !== 1 ? 's' : ''} gathered today ✨
              </motion.p>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}

// Small writing prompts to inspire
const PROMPTS = [
  'Something that surprised me today…',
  'A word I looked up…',
  'A question I can\'t stop thinking about…',
  'Something beautiful I noticed…',
  'A fact that shifted my perspective…',
  'Something I want to remember…',
  'A moment I want to preserve…',
  'Something I\'d like to know more about…',
]

function WritingPrompts() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length))

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
      style={{ marginTop: '0.875rem', textAlign: 'center' }}
    >
      <button
        onClick={() => setIdx(i => (i + 1) % PROMPTS.length)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--serif)', fontStyle: 'italic',
          fontSize: '0.82rem', color: 'var(--text-muted)',
          letterSpacing: '0.03em', transition: 'color 0.2s',
          display: 'flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <span style={{ opacity: 0.6 }}>✦</span>
        <AnimatePresence mode="wait">
          <motion.span key={idx}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            {PROMPTS[idx]}
          </motion.span>
        </AnimatePresence>
        <span style={{ opacity: 0.4, fontSize: '0.7rem' }}>→</span>
      </button>
    </motion.div>
  )
}