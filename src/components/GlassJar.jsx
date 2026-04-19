import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function GlassJar({ seeds, onClick }) {
  const [open, setOpen] = useState(false)
  const [hoveredSeed, setHoveredSeed] = useState(null)

  const recentSeeds = seeds.slice(0, 8)
  const count = seeds.length

  return (
    <>
      {/* Jar button */}
      <motion.button
        onClick={() => { setOpen(true); onClick?.() }}
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.4rem', padding: '0.5rem'
        }}
        title="Open your jar"
      >
        {/* Jar SVG */}
        <div style={{ position: 'relative' }}>
          <svg width="52" height="64" viewBox="0 0 52 64">
            {/* Lid */}
            <rect x="12" y="4" width="28" height="8" rx="3" fill="rgba(200,180,140,0.8)" stroke="rgba(180,160,120,0.9)" strokeWidth="1"/>
            {/* Jar body */}
            <path d="M10 14 Q8 20 8 28 L8 52 Q8 58 14 58 L38 58 Q44 58 44 52 L44 28 Q44 20 42 14 Z"
              fill="rgba(200,220,240,0.35)" stroke="rgba(180,200,220,0.7)" strokeWidth="1.5"/>
            {/* Shine */}
            <path d="M14 18 Q12 28 12 36" stroke="rgba(255,255,255,0.6)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {/* Seeds inside */}
            {recentSeeds.slice(0, 5).map((s, i) => (
              <text key={s.id || i} x={18 + (i % 3) * 10} y={32 + Math.floor(i / 3) * 12} fontSize="9">
                {s.icon || '🌱'}
              </text>
            ))}
          </svg>
          {count > 0 && (
            <div style={{
              position: 'absolute', top: -2, right: -2,
              background: 'var(--accent)', color: '#fff',
              borderRadius: '50%', width: 18, height: 18,
              fontSize: '0.65rem', fontFamily: 'var(--sans)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 500
            }}>{count > 99 ? '99+' : count}</div>
          )}
        </div>
        <span style={{
          fontFamily: 'var(--sans)', fontSize: '0.65rem',
          letterSpacing: '0.08em', color: 'var(--text-muted)',
          textTransform: 'uppercase'
        }}>Your jar</span>
      </motion.button>

      {/* Jar modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.5rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="glass"
              style={{
                width: 'min(480px, 92vw)', maxHeight: '80vh',
                overflow: 'hidden', display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ padding: '1.75rem 1.75rem 1rem' }}>
                <h2 style={{
                  fontFamily: 'var(--serif)', fontSize: '1.6rem', fontWeight: 300,
                  color: 'var(--text-primary)', marginBottom: '0.25rem'
                }}>Your Jar</h2>
                <p style={{ fontFamily: 'var(--sans)', fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  {count === 0 ? 'Empty for now. Begin gathering.' : `${count} thing${count === 1 ? '' : 's'} gathered`}
                </p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.75rem 1.75rem' }}>
                {seeds.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🫙</div>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontStyle: 'italic' }}>
                      The jar awaits its first seed.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {seeds.map((seed, i) => (
                      <motion.div
                        key={seed.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: 12,
                          padding: '0.85rem 1rem',
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem'
                        }}
                      >
                        <span style={{ fontSize: '1.4rem', lineHeight: 1 }}>{seed.icon || '🌱'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            fontFamily: 'var(--sans)', fontSize: '0.88rem',
                            color: 'var(--text-primary)', lineHeight: 1.6
                          }}>{seed.text}</p>
                          <p style={{
                            fontFamily: 'var(--sans)', fontSize: '0.7rem',
                            color: 'var(--text-muted)', marginTop: '0.25rem',
                            letterSpacing: '0.04em'
                          }}>
                            {new Date(seed.created_at).toLocaleDateString('en', { month: 'long', day: 'numeric' })}
                            {seed.ephemeral && ' · fades in 24h'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
