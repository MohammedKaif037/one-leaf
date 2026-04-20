import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_COLORS = {
  fact:        { bg: 'rgba(90,122,58,0.1)',  border: 'rgba(90,122,58,0.25)',  text: '#4a6a2a' },
  observation: { bg: 'rgba(42,74,122,0.1)',  border: 'rgba(42,74,122,0.25)',  text: '#2a4a7a' },
  exercise:    { bg: 'rgba(122,90,42,0.1)',  border: 'rgba(122,90,42,0.25)',  text: '#7a5a2a' },
  puzzle:      { bg: 'rgba(122,42,90,0.1)',  border: 'rgba(122,42,90,0.25)',  text: '#7a2a5a' },
  gathering:   { bg: 'rgba(100,80,60,0.07)', border: 'rgba(100,80,60,0.18)', text: '#6b5c4a' },
}

export default function GlassJar({ seeds, onClick }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')

  const count = seeds.length
  const recentSeeds = seeds.slice(0, 5)

  const filtered = seeds.filter(s =>
    (tab === 'all' || s.type === tab) &&
    (!search || s.text.toLowerCase().includes(search.toLowerCase()))
  )

  const grouped = filtered.reduce((acc, seed) => {
    const d = new Date(seed.created_at).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })
    if (!acc[d]) acc[d] = []
    acc[d].push(seed)
    return acc
  }, {})

  const tabs = [
    { id: 'all',        label: 'All' },
    { id: 'gathering',  label: 'Gathered' },
    { id: 'fact',       label: 'Facts' },
    { id: 'observation',label: 'Observations' },
    { id: 'exercise',   label: 'Exercises' },
    { id: 'puzzle',     label: 'Puzzles' },
  ]

  return (
    <>
      {/* Jar button */}
      <motion.button
        onClick={() => { setOpen(true); onClick?.() }}
        whileHover={{ scale: 1.08, y: -4 }}
        whileTap={{ scale: 0.95 }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', padding: '0.5rem' }}
        title="Open your jar"
      >
        <div style={{ position: 'relative' }}>
          <svg width="52" height="64" viewBox="0 0 52 64">
            <rect x="12" y="4" width="28" height="8" rx="3" fill="rgba(200,180,140,0.82)" stroke="rgba(180,160,120,0.9)" strokeWidth="1"/>
            <path d="M10 14 Q8 20 8 28 L8 52 Q8 58 14 58 L38 58 Q44 58 44 52 L44 28 Q44 20 42 14 Z" fill="rgba(200,220,240,0.38)" stroke="rgba(180,200,220,0.7)" strokeWidth="1.5"/>
            <path d="M14 18 Q12 28 12 36" stroke="rgba(255,255,255,0.65)" strokeWidth="2" fill="none" strokeLinecap="round"/>
            {recentSeeds.map((s, i) => (
              <text key={s.id || i} x={17 + (i % 3) * 10} y={32 + Math.floor(i / 3) * 13} fontSize="9">
                {s.icon || '🌱'}
              </text>
            ))}
          </svg>
          {count > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{
                position: 'absolute', top: -3, right: -3,
                background: 'var(--accent)', color: '#fff',
                borderRadius: '50%', width: 19, height: 19,
                fontSize: '0.62rem', fontFamily: 'var(--sans)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 500, boxShadow: '0 2px 8px var(--accent-glow)',
              }}
            >
              {count > 99 ? '99+' : count}
            </motion.div>
          )}
        </div>
        <span style={{ fontFamily: 'var(--sans)', fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Your jar
        </span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }} animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.88, y: 20 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              onClick={e => e.stopPropagation()}
              className="glass-heavy"
              style={{ width: 'min(520px, 94vw)', maxHeight: '84vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Modal header */}
              <div style={{ padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.55rem', fontWeight: 300, color: 'var(--text-primary)' }}>
                      Your Jar
                    </h2>
                    <p style={{ fontFamily: 'var(--sans)', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.05em', marginTop: '0.15rem' }}>
                      {count === 0 ? 'Empty for now. Begin gathering.' : `${count} thing${count !== 1 ? 's' : ''} gathered`}
                    </p>
                  </div>
                  <button onClick={() => setOpen(false)}
                    style={{ background: 'rgba(0,0,0,0.06)', border: 'none', borderRadius: 50, width: 30, height: 30, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                    ×
                  </button>
                </div>

                {/* Search */}
                <input className="leaf-input" placeholder="Search…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ fontSize: '0.84rem', padding: '0.55rem 0.9rem', marginBottom: '0.75rem' }}
                />

                {/* Tabs */}
                <div style={{ overflowX: 'auto', paddingBottom: '2px' }}>
                  <div className="pill-tabs" style={{ width: 'max-content', minWidth: '100%' }}>
                    {tabs.map(t => (
                      <button key={t.id} className={`pill-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seeds list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem 1.5rem' }}>
                {count === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.875rem' }}>🫙</div>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '1.05rem', fontStyle: 'italic' }}>
                      The jar awaits its first seed.
                    </p>
                  </div>
                ) : Object.keys(grouped).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '0.95rem' }}>
                      {search ? 'Nothing matches.' : 'Nothing in this category yet.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                    {Object.entries(grouped).map(([date, dateSeds]) => (
                      <div key={date}>
                        <p style={{ fontFamily: 'var(--sans)', fontSize: '0.64rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.2rem' }}>
                          {date}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.42rem' }}>
                          {dateSeds.map((seed, i) => {
                            const c = TYPE_COLORS[seed.type] || TYPE_COLORS.gathering
                            return (
                              <motion.div key={seed.id || i}
                                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.035 }}
                                style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 13, padding: '0.78rem 0.95rem', display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                                <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0, marginTop: '0.05rem' }}>{seed.icon || '🌱'}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontFamily: 'var(--sans)', fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.62 }}>
                                    {seed.text}
                                  </p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                    {seed.type && seed.type !== 'gathering' && (
                                      <span style={{ fontSize: '0.59rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: c.text, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 50, padding: '0.1rem 0.48rem', fontFamily: 'var(--sans)', fontWeight: 500 }}>
                                        {seed.type}
                                      </span>
                                    )}
                                    {seed.ephemeral && <span style={{ fontSize: '0.59rem', color: 'var(--text-muted)' }}>🌙</span>}
                                    <span style={{ fontSize: '0.61rem', color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
                                      {new Date(seed.created_at).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
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