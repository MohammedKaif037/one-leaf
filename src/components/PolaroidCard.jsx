import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_LABELS = {
  fact: 'A small truth',
  exercise: 'An invitation',
  puzzle: 'A riddle',
  observation: 'A noticing'
}

export default function PolaroidCard({ card, onSave, onDismiss }) {
  const [flipped, setFlipped] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    onSave?.(card)
    setTimeout(() => onDismiss?.(), 800)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: -2, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      style={{
        width: 'min(340px, 88vw)',
        perspective: 800
      }}
    >
      {/* Polaroid frame */}
      <div
        style={{
          background: '#fefcf8',
          borderRadius: 4,
          padding: '1.5rem 1.5rem 3rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
          cursor: card.type === 'puzzle' ? 'pointer' : 'default',
          userSelect: 'none'
        }}
        onClick={() => card.type === 'puzzle' && setFlipped(!flipped)}
      >
        {/* Type label */}
        <div style={{
          fontFamily: 'var(--sans)', fontSize: '0.68rem', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: 'var(--accent)',
          marginBottom: '1rem', opacity: 0.8
        }}>
          {TYPE_LABELS[card.type] || card.type}
        </div>

        {/* Icon */}
        <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>
          {card.icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--serif)', fontSize: '1.4rem', fontWeight: 300,
          color: '#2a2018', marginBottom: '0.75rem', lineHeight: 1.3
        }}>
          {card.title}
        </h2>

        {/* Body */}
        <AnimatePresence mode="wait">
          {!flipped ? (
            <motion.p
              key="front"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                fontFamily: 'var(--sans)', fontSize: '0.88rem', lineHeight: 1.7,
                color: '#5a4a38', fontWeight: 300
              }}
            >
              {card.body}
            </motion.p>
          ) : (
            <motion.p
              key="back"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'var(--sans)', fontSize: '0.88rem', lineHeight: 1.7,
                color: '#3a5a38', fontWeight: 400, fontStyle: 'italic',
                background: '#f0f5f0', borderRadius: 8, padding: '0.75rem',
                borderLeft: '3px solid #5a7a3a'
              }}
            >
              ✦ {card.hint}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Flip hint for puzzles */}
        {card.type === 'puzzle' && !flipped && (
          <p style={{
            marginTop: '0.75rem', fontFamily: 'var(--sans)',
            fontSize: '0.72rem', color: '#a09080', letterSpacing: '0.06em'
          }}>
            tap to reveal →
          </p>
        )}

        {/* CTA */}
        {card.cta && !flipped && (
          <p style={{
            marginTop: '0.75rem', fontFamily: 'var(--sans)',
            fontSize: '0.78rem', color: 'var(--accent)',
            letterSpacing: '0.04em', fontStyle: 'italic'
          }}>
            {card.cta}
          </p>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saved}
          style={{
            background: saved ? '#5a7a3a' : 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: 50,
            padding: '0.65rem 1.75rem', fontFamily: 'var(--sans)',
            fontSize: '0.82rem', letterSpacing: '0.06em',
            cursor: saved ? 'default' : 'pointer',
            boxShadow: '0 4px 16px var(--accent-glow)',
            transition: 'background 0.3s'
          }}
        >
          {saved ? '✓ Into the jar' : 'Keep this'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDismiss}
          style={{
            background: 'transparent', color: 'var(--text-muted)',
            border: '1px solid var(--glass-border)',
            borderRadius: 50, padding: '0.65rem 1.25rem',
            fontFamily: 'var(--sans)', fontSize: '0.82rem',
            letterSpacing: '0.06em', cursor: 'pointer'
          }}
        >
          Let it pass
        </motion.button>
      </div>
    </motion.div>
  )
}
