import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// All 9 interest categories — was missing Brush, Globe, Flask, Quill in original
const CARDS = [
  { id: 'Gear',      symbol: '⚙️',  label: 'How Things Work',  desc: 'Mechanisms, science, math' },
  { id: 'Book',      symbol: '📖',  label: 'Narrative & History', desc: 'Stories, culture, language' },
  { id: 'Telescope', symbol: '🔭',  label: 'Wonder & Cosmos',   desc: 'Nature, space, exploration' },
  { id: 'Handshake', symbol: '🤝',  label: 'Human Behavior',    desc: 'Psychology, society' },
  { id: 'Leaf',      symbol: '🍃',  label: 'Slow & Natural',    desc: 'Ecology, seasons, growth' },
  { id: 'Brush',     symbol: '🖌️', label: 'Art & Making',      desc: 'Craft, creativity, design' },
  { id: 'Globe',     symbol: '🌍',  label: 'Other Cultures',    desc: 'Music, food, traditions' },
  { id: 'Flask',     symbol: '🧪',  label: 'Strange Science',   desc: 'Weird biology, chemistry' },
  { id: 'Quill',     symbol: '🪶',  label: 'Philosophy',        desc: 'Ideas, ethics, meaning' },
]

export default function Onboarding({ onComplete }) {
  const [selected, setSelected] = useState([])

  function toggle(id) {
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(s => s !== id))
    } else if (selected.length < 3) {
      setSelected(prev => [...prev, id])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        background: 'rgba(0,0,0,0.04)',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ textAlign: 'center', marginBottom: '2rem' }}
      >
        <h1 style={{
          fontFamily: 'var(--serif)',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 300,
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
        }}>
          What draws your eye?
        </h1>
        <p style={{
          fontFamily: 'var(--sans)',
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem',
        }}>
          Choose three. Your daily wonders will lean that way.
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ backgroundColor: i < selected.length ? 'var(--accent)' : 'var(--text-muted)' }}
              style={{ width: 24, height: 3, borderRadius: 2, opacity: i < selected.length ? 1 : 0.3 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.875rem',
        maxWidth: '560px',
        width: '100%',
        marginBottom: '2rem',
      }}>
        {CARDS.map((card, i) => {
          const isSelected = selected.includes(card.id)
          const isDisabled = !isSelected && selected.length >= 3

          return (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isDisabled ? 0.35 : 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              onClick={() => !isDisabled && toggle(card.id)}
              whileHover={!isDisabled ? { scale: 1.04, y: -3 } : {}}
              whileTap={!isDisabled ? { scale: 0.97 } : {}}
              style={{
                background: isSelected ? 'var(--accent)' : 'var(--glass-bg)',
                border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--glass-border)',
                backdropFilter: 'blur(16px)',
                borderRadius: 16,
                padding: '1.1rem 0.6rem',
                cursor: isDisabled ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.4rem',
                textAlign: 'center',
                transition: 'background 0.3s, border 0.3s',
                boxShadow: isSelected ? '0 8px 30px var(--accent-glow)' : 'var(--shadow)',
              }}
            >
              <span style={{ fontSize: '1.75rem' }}>{card.symbol}</span>
              <span style={{
                fontFamily: 'var(--serif)', fontSize: '0.9rem', fontWeight: 400,
                color: isSelected ? '#fff' : 'var(--text-primary)',
                lineHeight: 1.2,
              }}>
                {card.label}
              </span>
              <span style={{
                fontFamily: 'var(--sans)', fontSize: '0.7rem', letterSpacing: '0.04em',
                color: isSelected ? 'rgba(255,255,255,0.75)' : 'var(--text-muted)',
              }}>
                {card.desc}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* CTA — only shows when 3 selected */}
      <AnimatePresence>
        {selected.length === 3 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => onComplete(selected)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 50,
              padding: '0.9rem 2.5rem',
              fontFamily: 'var(--sans)',
              fontSize: '0.95rem',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 8px 30px var(--accent-glow)',
            }}
          >
            Begin gathering →
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}