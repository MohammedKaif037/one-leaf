export function getTimeTheme() {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 8) return {
    name: 'dawn',
    from: '#f9e8d8', to: '#d4e8cc',
    accent: '#c05a35',
    label: 'Dawn'
  }
  if (hour >= 8 && hour < 12) return {
    name: 'morning',
    from: '#fdf1e3', to: '#e8f0d5',
    accent: '#8b3a2f',
    label: 'Morning'
  }
  if (hour >= 12 && hour < 15) return {
    name: 'noon',
    from: '#fef9ef', to: '#e5eedd',
    accent: '#5a7a2e',
    label: 'Noon'
  }
  if (hour >= 15 && hour < 18) return {
    name: 'afternoon',
    from: '#fdf4e3', to: '#e0e8d4',
    accent: '#7a5c2e',
    label: 'Afternoon'
  }
  if (hour >= 18 && hour < 20) return {
    name: 'dusk',
    from: '#f0dce8', to: '#c8b8d8',
    accent: '#7a3a5a',
    label: 'Dusk'
  }
  if (hour >= 20 && hour < 22) return {
    name: 'evening',
    from: '#d8cce8', to: '#9888b8',
    accent: '#6a4a8a',
    label: 'Evening'
  }
  return {
    name: 'night',
    from: '#1a1628', to: '#0d1220',
    accent: '#9b7fd4',
    label: 'Night',
    dark: true
  }
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.style.setProperty('--bg-from', theme.from)
  root.style.setProperty('--bg-to', theme.to)
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-light', `${theme.accent}20`)
  root.style.setProperty('--accent-glow', `${theme.accent}40`)

  if (theme.dark) {
    root.style.setProperty('--text-primary', '#f0ead8')
    root.style.setProperty('--text-secondary', '#b8a8d0')
    root.style.setProperty('--text-muted', '#7868a0')
    root.style.setProperty('--glass-bg', 'rgba(30,20,50,0.55)')
    root.style.setProperty('--glass-border', 'rgba(180,160,220,0.2)')
    root.style.setProperty('--surface', 'rgba(30,20,50,0.45)')
  } else {
    root.style.setProperty('--text-primary', '#2a2018')
    root.style.setProperty('--text-secondary', '#6b5c4a')
    root.style.setProperty('--text-muted', '#a09080')
    root.style.setProperty('--glass-bg', 'rgba(255,255,255,0.45)')
    root.style.setProperty('--glass-border', 'rgba(255,255,255,0.65)')
    root.style.setProperty('--surface', 'rgba(255,255,255,0.55)')
  }
}
