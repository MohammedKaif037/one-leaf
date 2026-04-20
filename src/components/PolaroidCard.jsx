import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_META = {
  fact:        { label: 'A small truth',  color: '#4a6a2a' },
  exercise:    { label: 'An invitation',  color: '#7a5a2a' },
  puzzle:      { label: 'A riddle',       color: '#7a2a5a' },
  observation: { label: 'A noticing',     color: '#2a4a7a' },
}

export default function PolaroidCard({ card, onSave, onDismiss }) {
  const [flipped, setFlipped] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    onSave?.(card)
    setTimeout(() => onDismiss?.(), 850)
  }

  const meta = TYPE_META[card.type] || { label: card.type, color: 'var(--accent)' }
  const isPuzzle = card.type === 'puzzle'

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -2, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, rotate: -0.8, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 100, damping: 18 }}
      style={{ width: 'min(340px, 90vw)' }}
    >
      {/* Polaroid frame */}
      <motion.div
        whileHover={isPuzzle && !flipped ? { rotate: 0.5 } : {}}
        onClick={() => isPuzzle && setFlipped(f => !f)}
        style={{
          background: 'linear-gradient(160deg, #fefcf8, #faf7f2)',
          borderRadius: 5,
          padding: '1.5rem 1.5rem 3rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.9)',
          cursor: isPuzzle ? 'pointer' : 'default',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        {/* Type label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{
            fontFamily: 'var(--sans)', fontSize: '0.65rem', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: meta.color, opacity: 0.85, fontWeight: 500,
          }}>
            {meta.label}
          </span>
          {isPuzzle && (
            <span style={{ fontSize: '0.62rem', color: '#a09080', letterSpacing: '0.05em', fontFamily: 'var(--sans)' }}>
              {flipped ? 'tap to close ↩' : 'tap to reveal →'}
            </span>
          )}
        </div>

        {/* Icon */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '3rem', marginBottom: '0.875rem', lineHeight: 1, display: 'block' }}
        >
          {card.icon}
        </motion.div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--serif)', fontSize: 'clamp(1.2rem, 3vw, 1.45rem)',
          fontWeight: 300, color: '#2a2018',
          marginBottom: '0.7rem', lineHeight: 1.3,
        }}>
          {card.title}
        </h2>

        {/* Body / Hint */}
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.87rem', lineHeight: 1.73, color: '#5a4a38', fontWeight: 300 }}>
                {card.body}
              </p>
              {card.cta && !isPuzzle && (
                <p style={{ marginTop: '0.75rem', fontFamily: 'var(--sans)', fontSize: '0.76rem', color: meta.color, letterSpacing: '0.04em', fontStyle: 'italic' }}>
                  {card.cta}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="back"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ background: '#f0f5f0', borderRadius: 10, padding: '0.85rem 1rem', borderLeft: '3px solid #5a7a3a' }}>
              <p style={{ fontFamily: 'var(--sans)', fontSize: '0.87rem', lineHeight: 1.73, color: '#3a5a38', fontWeight: 400, fontStyle: 'italic' }}>
                ✦ {card.hint}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Film strip dots at bottom */}
        <div style={{ position: 'absolute', bottom: '0.9rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: 'rgba(0,0,0,0.08)' }} />
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.7rem', marginTop: '1.1rem', justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
          onClick={handleSave} disabled={saved}
          style={{
            background: saved ? '#5a7a3a' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 50,
            padding: '0.65rem 1.8rem', fontFamily: 'var(--sans)',
            fontSize: '0.82rem', letterSpacing: '0.06em',
            cursor: saved ? 'default' : 'pointer',
            boxShadow: saved ? '0 4px 16px rgba(90,122,58,0.4)' : '0 4px 16px var(--accent-glow)',
            transition: 'background 0.3s, box-shadow 0.3s', fontWeight: 500,
          }}
        >
          {saved ? '✓ Into the jar' : 'Keep this'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={onDismiss}
          className="btn-ghost"
        >
          Let it pass
        </motion.button>
      </div>
    </motion.div>
  )
}