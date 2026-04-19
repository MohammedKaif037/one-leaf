import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { reflectOnGathering } from '../lib/chatanywhere'

const ILLUSTRATIONS = ['🌱', '✨', '🌙', '🍃', '🫧', '🌿', '💫', '🪷']

export default function HeroCircle({ onGather, onDryDay, gathered }) {
  const [phase, setPhase] = useState('idle') // idle | writing | done
  const [text, setText] = useState('')
  const [reflection, setReflection] = useState('')
  const [loadingReflection, setLoadingReflection] = useState(false)
  const [illustration] = useState(() => ILLUSTRATIONS[Math.floor(Math.random() * ILLUSTRATIONS.length)])
  const textareaRef = useRef(null)

  useEffect(() => {
    if (gathered) setPhase('done')
  }, [gathered])

  function handleCircleClick() {
    if (phase === 'idle') {
      setPhase('writing')
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }

  async function handleSubmit() {
    if (!text.trim()) return
    setLoadingReflection(true)
    const r = await reflectOnGathering(text)
    setReflection(r)
    setLoadingReflection(false)
    onGather({ text: text.trim(), icon: '🌱', type: 'gathering' })
    setPhase('done')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const circleSize = 'min(300px, 72vw)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      <AnimatePresence mode="wait">

        {/* IDLE: The main circle */}
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
          >
            <motion.button
              onClick={handleCircleClick}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: circleSize, height: circleSize,
                borderRadius: '50%',
                background: 'var(--glass-bg)',
                border: '1.5px solid var(--glass-border)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-lift), 0 0 80px var(--accent-glow)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '1rem',
                animation: 'breathe 5s ease-in-out infinite'
              }}
            >
              <span style={{ fontSize: 'clamp(3rem, 10vw, 4.5rem)', lineHeight: 1 }}>
                {illustration}
              </span>
              <p style={{
                fontFamily: 'var(--serif)', fontStyle: 'italic', fontWeight: 300,
                fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
                color: 'var(--text-secondary)', letterSpacing: '0.02em',
                textAlign: 'center', padding: '0 1.5rem', lineHeight: 1.5
              }}>
                What did you gather today?
              </p>
            </motion.button>

            <motion.button
              onClick={onDryDay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: '0.88rem', color: 'var(--text-muted)',
                letterSpacing: '0.04em', padding: '0.5rem 1rem',
                borderBottom: '1px solid transparent',
                transition: 'color 0.2s, border-color 0.2s'
              }}
              onMouseOver={e => {
                e.target.style.color = 'var(--text-secondary)'
                e.target.style.borderColor = 'var(--text-muted)'
              }}
              onMouseOut={e => {
                e.target.style.color = 'var(--text-muted)'
                e.target.style.borderColor = 'transparent'
              }}
            >
              The soil is dry today.
            </motion.button>
          </motion.div>
        )}

        {/* WRITING: Expanded canvas */}
        {phase === 'writing' && (
          <motion.div
            key="writing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass"
            style={{
              width: 'min(480px, 90vw)', padding: '2rem',
              display: 'flex', flexDirection: 'column', gap: '1.25rem'
            }}
          >
            <p style={{
              fontFamily: 'var(--serif)', fontSize: '1.2rem', fontWeight: 300,
              fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.5
            }}>
              What small thing grew in you today?
            </p>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="I learned that… I noticed… I felt… I wondered…"
              rows={4}
              style={{
                width: '100%', background: 'var(--surface)',
                border: '1px solid var(--glass-border)',
                borderRadius: 12, padding: '0.875rem',
                fontFamily: 'var(--sans)', fontSize: '0.92rem',
                color: 'var(--text-primary)', lineHeight: 1.7,
                resize: 'none', outline: 'none',
                letterSpacing: '0.02em'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                ↵ Enter to plant it
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setPhase('idle')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--sans)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={!text.trim()}
                  whileHover={text.trim() ? { scale: 1.04 } : {}}
                  whileTap={text.trim() ? { scale: 0.97 } : {}}
                  style={{
                    background: text.trim() ? 'var(--accent)' : 'var(--glass-border)',
                    color: text.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none', borderRadius: 50,
                    padding: '0.55rem 1.25rem', fontFamily: 'var(--sans)',
                    fontSize: '0.82rem', letterSpacing: '0.06em',
                    cursor: text.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s'
                  }}
                >
                  Plant it 🌱
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* DONE: Celebration */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', maxWidth: 'min(400px, 88vw)' }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ fontSize: '4rem', marginBottom: '1.25rem' }}
            >
              🫙
            </motion.div>
            <h2 style={{
              fontFamily: 'var(--serif)', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
              fontWeight: 300, color: 'var(--text-primary)', marginBottom: '0.75rem'
            }}>
              Into the jar it goes.
            </h2>
            {loadingReflection && (
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                reflecting…
              </p>
            )}
            {reflection && !loadingReflection && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1rem',
                  color: 'var(--text-secondary)', lineHeight: 1.7,
                  background: 'var(--glass-bg)', borderRadius: 12,
                  padding: '1rem 1.25rem', border: '1px solid var(--glass-border)'
                }}
              >
                "{reflection}"
              </motion.p>
            )}
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
