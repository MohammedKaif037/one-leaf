import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function InkDrop({ x, delay, size }) {
  return (
    <motion.div
      initial={{ y: '-5vh', opacity: 0, scale: 0 }}
      animate={{ y: '110vh', opacity: [0, 0.4, 0.4, 0], scale: [0, 1, 1, 0.3] }}
      transition={{ duration: 4 + Math.random() * 3, delay, ease: 'easeIn' }}
      style={{
        position: 'fixed',
        left: `${x}%`,
        top: 0,
        width: size,
        height: size,
        borderRadius: '50% 50% 50% 30%',
        background: 'var(--accent)',
        pointerEvents: 'none',
        zIndex: 50,
        filter: 'blur(0.5px)'
      }}
    />
  )
}

export default function InkRain({ onWord }) {
  const [drops, setDrops] = useState([])
  const [word, setWord] = useState(null)
  const [wordVisible, setWordVisible] = useState(false)

  useEffect(() => {
    // Generate drops
    const newDrops = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      size: `${4 + Math.random() * 8}px`
    }))
    setDrops(newDrops)

    // Show word after 2s
    const t = setTimeout(() => {
      onWord?.().then(w => {
        setWord(w)
        setWordVisible(true)
      })
    }, 2000)

    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none' }}>
      {drops.map(d => (
        <InkDrop key={d.id} x={d.x} delay={d.delay} size={d.size} />
      ))}

      <AnimatePresence>
        {wordVisible && word && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, letterSpacing: '0.5em' }}
            animate={{ opacity: 1, scale: 1, letterSpacing: '0.25em' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              position: 'fixed', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none'
            }}
          >
            <span style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(3rem, 12vw, 7rem)',
              fontWeight: 300,
              color: 'var(--accent)',
              opacity: 0.7,
              textTransform: 'uppercase',
              letterSpacing: '0.25em'
            }}>
              {word}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
