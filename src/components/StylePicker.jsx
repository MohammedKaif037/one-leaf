import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const STYLES = [
  { id: 'Poetic', icon: '🌙', label: 'Poetic', desc: 'Lyrical & dreamy' },
  { id: 'Practical', icon: '⚡', label: 'Practical', desc: 'Direct & useful' },
  { id: 'Whimsical', icon: '✨', label: 'Whimsical', desc: 'Playful & surprising' },
  { id: 'Wise', icon: '🦉', label: 'Wise', desc: 'Profound & timeless' },
  { id: 'Curious', icon: '🔍', label: 'Curious', desc: 'Questioning & exploratory' },
  { id: 'Grounded', icon: '🌱', label: 'Grounded', desc: 'Earthy & embodied' },
]

export default function StylePicker({ onSelect, currentStyle }) {
  const [selected, setSelected] = useState(currentStyle || 'Poetic')

  useEffect(() => {
    onSelect?.(selected)
  }, [selected, onSelect])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 60,
        padding: '0.35rem',
        display: 'flex',
        gap: '0.25rem',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      {STYLES.map((style) => (
        <motion.button
          key={style.id}
          onClick={() => setSelected(style.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: selected === style.id ? 'var(--accent)' : 'transparent',
            color: selected === style.id ? '#fff' : 'rgba(255,255,255,0.7)',
            border: 'none',
            borderRadius: 50,
            padding: '0.5rem 1.2rem',
            fontFamily: 'var(--sans)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{style.icon}</span>
          <span>{style.label}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}
