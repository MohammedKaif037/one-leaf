import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export function useJar() {
  const { user } = useAuth()
  const [seeds, setSeeds] = useState([])

  useEffect(() => {
    if (user) {
      loadFromSupabase()
    } else {
      loadFromLocal()
    }
  }, [user])

  function loadFromLocal() {
    try {
      const stored = localStorage.getItem('one-leaf-jar')
      setSeeds(stored ? JSON.parse(stored) : [])
    } catch {
      setSeeds([])
    }
  }

  async function loadFromSupabase() {
    const { data } = await supabase
      .from('seeds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setSeeds(data || [])
  }

  async function addSeed(seed) {
    const newSeed = {
      id: Date.now().toString(),
      text: seed.text,
      icon: seed.icon || '🌱',
      type: seed.type || 'gathering',
      ephemeral: seed.ephemeral || false,
      created_at: new Date().toISOString(),
      expires_at: seed.ephemeral
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null
    }

    if (user) {
      const { data } = await supabase
        .from('seeds')
        .insert({ ...newSeed, user_id: user.id })
        .select()
        .single()
      if (data) setSeeds(prev => [data, ...prev])
    } else {
      const updated = [newSeed, ...seeds]
      localStorage.setItem('one-leaf-jar', JSON.stringify(updated))
      setSeeds(updated)
    }
    return newSeed
  }

  // Filter out expired ephemeral seeds
  const activeSeds = seeds.filter(s => {
    if (!s.ephemeral || !s.expires_at) return true
    return new Date(s.expires_at) > new Date()
  })

  return { seeds: activeSeds, addSeed }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem('one-leaf-prefs')
      return stored ? JSON.parse(stored) : { categories: [], onboarded: false, ephemeralMode: false }
    } catch {
      return { categories: [], onboarded: false, ephemeralMode: false }
    }
  })

  function updatePrefs(updates) {
    const next = { ...prefs, ...updates }
    setPrefs(next)
    localStorage.setItem('one-leaf-prefs', JSON.stringify(next))
  }

  return { prefs, updatePrefs }
}
