// src/app/onboard/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const AVATAR_COLORS = [
  '#7c3aed', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
]

export default function OnboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!nickname.trim()) { setError('Nickname is required'); return }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    // Ensure user row exists
    await supabase.from('users').upsert({ id: user.id, email: user.email! })

    const { error: tErr } = await supabase.from('travellers').insert({
      user_id: user.id,
      nickname: nickname.trim(),
      bio: bio.trim() || null,
      avatar_color: selectedColor,
    })

    if (tErr) {
      setError(tErr.message)
      setLoading(false)
      return
    }

    router.push('/pool')
  }

  const initials = nickname.slice(0, 2).toUpperCase() || '💧'

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 100%)' }}>
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Create Your Traveler</h1>
          <p className="text-purple-300/60 text-sm mt-1">You're a water drop entering the Beauty Pool</p>
        </div>

        {/* Avatar preview */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white transition-all"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${lighten(selectedColor)}, ${selectedColor})`,
                boxShadow: `0 0 30px ${selectedColor}60`,
              }}>
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-purple-900" />
          </div>
        </div>

        {/* Color picker */}
        <div className="flex justify-center gap-2 mb-6">
          {AVATAR_COLORS.map(color => (
            <button key={color}
              onClick={() => setSelectedColor(color)}
              className="w-7 h-7 rounded-full transition-all"
              style={{
                background: color,
                outline: selectedColor === color ? `3px solid white` : 'none',
                outlineOffset: '2px',
                boxShadow: `0 0 8px ${color}80`,
              }} />
          ))}
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <div>
            <label className="text-xs text-purple-300/70 uppercase tracking-widest mb-1.5 block">
              Traveler Nickname *
            </label>
            <input
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="e.g. PearlDrop, RoseWave"
              maxLength={20}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-purple-300/30 text-sm outline-none focus:ring-1 focus:ring-purple-500/50"
              style={{ background: 'rgba(26,10,46,0.6)', border: '1px solid rgba(167,139,250,0.2)' }}
            />
          </div>
          <div>
            <label className="text-xs text-purple-300/70 uppercase tracking-widest mb-1.5 block">
              About You (optional)
            </label>
            <input
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Your beauty vibe..."
              maxLength={80}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-purple-300/30 text-sm outline-none focus:ring-1 focus:ring-purple-500/50"
              style={{ background: 'rgba(26,10,46,0.6)', border: '1px solid rgba(167,139,250,0.2)' }}
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={loading || !nickname.trim()}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-40"
            style={{
              background: `linear-gradient(135deg, ${selectedColor}, ${lighten(selectedColor)})`,
              boxShadow: `0 4px 20px ${selectedColor}60`,
            }}>
            {loading ? 'Entering Pool...' : 'Enter Beauty Pool 💧'}
          </button>
        </div>
      </div>
    </div>
  )
}

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.min(255, r+60)}, ${Math.min(255, g+60)}, ${Math.min(255, b+60)})`
}
