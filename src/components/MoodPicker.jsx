import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MOODS = [
  { name: 'Storm Grey',        hex: '#6b7a8a', light: '#c8d0d8', emoji: '🌫️', feeling: 'contemplative' },
  { name: 'Sun Yellow',        hex: '#d4a017', light: '#f5e5a0', emoji: '☀️', feeling: 'curious & bright' },
  { name: 'Moss Green',        hex: '#5a7a3a', light: '#b8d0a0', emoji: '🌿', feeling: 'grounded & calm' },
  { name: 'Burnt Orange',      hex: '#c05a35', light: '#e8b090', emoji: '🍂', feeling: 'warm & restless' },
  { name: 'Twilight Lavender', hex: '#7a5a9a', light: '#c8b0e0', emoji: '🌌', feeling: 'dreamy & open' },
  { name: 'Rose Blush',        hex: '#b05070', light: '#e0b0c0', emoji: '🌸', feeling: 'tender & present' },
  { name: 'Ink Blue',          hex: '#2a4a7a', light: '#90a8d0', emoji: '🌊', feeling: 'deep & reflective' },
]

export default function MoodPicker({ onSelect, onBack }) {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)

  const activeMood = hovered || selected

  function handleSelect(mood) {
    setSelected(mood)
    setTimeout(() => onSelect(mood.name), 350)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ width: '100%', maxWidth: 520, position: 'relative' }}
    >
      {/* Color wash preview behind content */}
      <AnimatePresence>
        {activeMood && (
          <motion.div
            key={activeMood.name}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse at 50% 40%, ${activeMood.light}88 0%, transparent 65%)`,
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.p
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.4rem, 3.5vw, 1.9rem)', fontWeight: 300, fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '0.5rem' }}
          >
            No gathering today. Just receiving.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--text-secondary)', fontStyle: 'italic' }}
          >
            What color is the light right now?
          </motion.p>
        </div>

        {/* Mood name display */}
        <div style={{ height: '2.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <AnimatePresence mode="wait">
            {activeMood ? (
              <motion.div key={activeMood.name}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.22 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}
              >
                <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 300, color: activeMood.hex, letterSpacing: '0.04em' }}>
                  {activeMood.name}
                </span>
                <span style={{ fontFamily: 'var(--sans)', fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.06em', fontStyle: 'italic' }}>
                  {activeMood.feeling}
                </span>
              </motion.div>
            ) : (
              <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontFamily: 'var(--sans)', fontSize: '0.72rem', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Hover or tap a color
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Swatch grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.1rem', justifyContent: 'center', marginBottom: '2rem' }}>
          {MOODS.map((mood, i) => (
            <motion.button
              key={mood.name}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.06 * i, type: 'spring', stiffness: 200, damping: 18 }}
              onClick={() => handleSelect(mood)}
              onMouseEnter={() => setHovered(mood)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ scale: 1.22, y: -6 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: 58, height: 58,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 30%, ${mood.light}, ${mood.hex})`,
                border: selected?.name === mood.name
                  ? `3px solid ${mood.hex}`
                  : '2.5px solid rgba(255,255,255,0.6)',
                cursor: 'pointer',
                boxShadow: selected?.name === mood.name
                  ? `0 6px 24px ${mood.hex}70, 0 0 0 4px ${mood.hex}20`
                  : `0 4px 18px ${mood.hex}50`,
                transition: 'border 0.2s, box-shadow 0.2s',
                position: 'relative',
              }}
            >
              {/* Emoji inside on hover */}
              <AnimatePresence>
                {hovered?.name === mood.name && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.35rem',
                    }}
                  >
                    {mood.emoji}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--serif)', fontStyle: 'italic',
              fontSize: '0.85rem', color: 'var(--text-muted)',
              letterSpacing: '0.04em', padding: '0.5rem 1rem',
              borderBottom: '1px solid transparent', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--text-muted)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent' }}
          >
            ← Back to gathering
          </button>
        </div>
      </div>
    </motion.div>
  )
}