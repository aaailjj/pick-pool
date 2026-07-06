// src/components/pool/PoolHeader.tsx
'use client'

import { usePoolStore } from '@/store/pool-store'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function PoolHeader() {
  const { myTraveller, poolPresences, setIsBackpackOpen, setIsPickListOpen } = usePoolStore()
  const router = useRouter()
  const supabase = createClient()
  const onlineCount = poolPresences.filter(p => p.status === 'online').length + (myTraveller ? 1 : 0)

  async function handleStatusChange(status: 'online' | 'do_not_disturb') {
    if (!myTraveller) return
    await supabase.from('travellers').update({ status }).eq('id', myTraveller.id)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-40">
      {/* Left: Logo + pool count */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
          <span className="text-lg">💧</span>
          <span className="text-sm font-bold text-white tracking-wide">Pick Pool</span>
        </div>
        <div className="glass rounded-xl px-3 py-2 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-purple-200">{onlineCount} in pool</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Pick Lists */}
        <button
          onClick={() => setIsPickListOpen(true)}
          className="glass rounded-xl px-3 py-2 text-xs text-purple-200 hover:text-white transition-colors flex items-center gap-1.5">
          <span>✨</span>
          <span>Pick Lists</span>
        </button>

        {/* Backpack */}
        <button
          onClick={() => setIsBackpackOpen(true)}
          className="glass rounded-xl px-3 py-2 text-xs text-purple-200 hover:text-white transition-colors flex items-center gap-1.5">
          <span>🎒</span>
          <span>Backpack</span>
        </button>

        {/* Status toggle */}
        {myTraveller && (
          <div className="glass rounded-xl px-1 py-1 flex gap-1">
            <button
              onClick={() => handleStatusChange('online')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                myTraveller.status === 'online'
                  ? 'bg-emerald-500/30 text-emerald-300'
                  : 'text-purple-300/50 hover:text-purple-200'
              }`}>
              ● Online
            </button>
            <button
              onClick={() => handleStatusChange('do_not_disturb')}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                myTraveller.status === 'do_not_disturb'
                  ? 'bg-rose-500/30 text-rose-300'
                  : 'text-purple-300/50 hover:text-purple-200'
              }`}>
              ⊘ DND
            </button>
          </div>
        )}

        {/* Avatar */}
        {myTraveller && (
          <button
            onClick={signOut}
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white hover:opacity-80 transition-opacity"
            title="Sign out"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${lighten(myTraveller.avatar_color)}, ${myTraveller.avatar_color})`,
              boxShadow: `0 0 10px ${myTraveller.avatar_color}60`,
            }}>
            {myTraveller.nickname.slice(0, 2).toUpperCase()}
          </button>
        )}
      </div>
    </div>
  )
}

function lighten(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.min(255, r+80)}, ${Math.min(255, g+80)}, ${Math.min(255, b+80)})`
}
