import { motion } from 'framer-motion'

const MOODS = [
  { name: 'Storm Grey', hex: '#6b7a8a', light: '#c8d0d8' },
  { name: 'Sun Yellow', hex: '#d4a017', light: '#f5e5a0' },
  { name: 'Moss Green', hex: '#5a7a3a', light: '#b8d0a0' },
  { name: 'Burnt Orange', hex: '#c05a35', light: '#e8b090' },
  { name: 'Twilight Lavender', hex: '#7a5a9a', light: '#c8b0e0' },
  { name: 'Rose Blush', hex: '#b05070', light: '#e0b0c0' },
  { name: 'Ink Blue', hex: '#2a4a7a', light: '#90a8d0' },
]

export default function MoodPicker({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ textAlign: 'center', width: '100%', maxWidth: 480 }}
    >
      <p style={{
        fontFamily: 'var(--serif)', fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
        fontWeight: 300, fontStyle: 'italic',
        color: 'var(--text-primary)', marginBottom: '2rem',
        lineHeight: 1.5
      }}>
        No gathering today. Just receiving.<br/>
        <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>What color is the light?</span>
      </p>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
        justifyContent: 'center', marginBottom: '2rem'
      }}>
        {MOODS.map((mood, i) => (
          <motion.button
            key={mood.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            onClick={() => onSelect(mood.name)}
            whileHover={{ scale: 1.12, y: -4 }}
            whileTap={{ scale: 0.95 }}
            title={mood.name}
            style={{
              width: 52, height: 52,
              borderRadius: '50%',
              background: `radial-gradient(circle at 35% 35%, ${mood.light}, ${mood.hex})`,
              border: '2px solid rgba(255,255,255,0.5)',
              cursor: 'pointer',
              boxShadow: `0 4px 16px ${mood.hex}60`,
              transition: 'box-shadow 0.2s'
            }}
          />
        ))}
      </div>

      <p style={{
        fontFamily: 'var(--sans)', fontSize: '0.78rem',
        letterSpacing: '0.08em', color: 'var(--text-muted)',
        textTransform: 'uppercase'
      }}>
        Hover to name each shade
      </p>
    </motion.div>
  )
}
