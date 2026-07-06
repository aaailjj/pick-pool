// src/components/traveller/TravellerPanel.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePoolStore } from '@/store/pool-store'
import { Traveller, Discovery, Friendship } from '@/types'

export default function TravellerPanel({ travellerId }: { travellerId: string }) {
  const { myTraveller, setSelectedTravellerId } = usePoolStore()
  const supabase = createClient()
  const [traveller, setTraveller] = useState<Traveller | null>(null)
  const [discoveries, setDiscoveries] = useState<Discovery[]>([])
  const [friendship, setFriendship] = useState<Friendship | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [tRes, dRes, fRes] = await Promise.all([
        supabase.from('travellers').select('*').eq('id', travellerId).single(),
        supabase.from('discoveries').select('*')
          .eq('traveller_id', travellerId).order('created_at', { ascending: false }).limit(5),
        myTraveller
          ? supabase.from('friendships').select('*')
              .or(`requester_id.eq.${myTraveller.id},addressee_id.eq.${myTraveller.id}`)
              .or(`requester_id.eq.${travellerId},addressee_id.eq.${travellerId}`)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ])
      setTraveller(tRes.data)
      setDiscoveries(dRes.data || [])
      setFriendship(fRes.data)
      setLoading(false)
    }
    load()
  }, [travellerId])

  async function sendFriendRequest() {
    if (!myTraveller) return
    const { data } = await supabase.from('friendships')
      .insert({ requester_id: myTraveller.id, addressee_id: travellerId })
      .select().single()
    if (data) setFriendship(data)
  }

  const STATUS_COLOR: Record<string, string> = {
    online: '#34d399', do_not_disturb: '#f87171', offline: '#6b7280',
  }

  if (loading) return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-56 glass-dark rounded-2xl p-4 z-40 animate-pulse">
      <div className="h-12 w-12 rounded-full bg-purple-500/20 mx-auto mb-3" />
      <div className="h-3 bg-purple-500/20 rounded mb-2" />
      <div className="h-3 bg-purple-500/20 rounded w-2/3 mx-auto" />
    </div>
  )

  if (!traveller) return null

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-60 glass-dark rounded-2xl p-4 z-40">
      <button
        onClick={() => setSelectedTravellerId(null)}
        className="absolute top-3 right-3 text-purple-300/50 hover:text-purple-200 text-sm">✕</button>

      {/* Avatar */}
      <div className="text-center mb-4">
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white font-bold text-lg mb-2"
          style={{
            background: traveller.avatar_color,
            boxShadow: `0 0 20px ${traveller.avatar_color}60`,
          }}>
          {traveller.avatar_url
            ? <img src={traveller.avatar_url} className="w-full h-full object-cover rounded-full" alt="" />
            : traveller.nickname.slice(0, 2).toUpperCase()
          }
        </div>
        <h3 className="text-sm font-bold text-white">{traveller.nickname}</h3>
        <div className="flex items-center justify-center gap-1.5 mt-1">
          <div className="w-2 h-2 rounded-full"
            style={{ background: STATUS_COLOR[traveller.status] }} />
          <span className="text-xs capitalize" style={{ color: STATUS_COLOR[traveller.status] }}>
            {traveller.status.replace('_', ' ')}
          </span>
        </div>
        {traveller.bio && (
          <p className="text-xs text-purple-300/60 mt-2">{traveller.bio}</p>
        )}
      </div>

      {/* Recent discoveries */}
      <div className="mb-4">
        <p className="text-xs text-purple-300/50 uppercase tracking-widest mb-2">Recent Finds</p>
        {discoveries.length > 0 ? (
          <div className="space-y-1.5">
            {discoveries.map(d => (
              <div key={d.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                style={{ background: 'rgba(124,58,237,0.1)' }}>
                <span className="text-xs">✦</span>
                <div className="min-w-0">
                  <p className="text-xs text-white truncate">{d.product_name}</p>
                  {d.brand && <p className="text-xs text-purple-300/50 truncate">{d.brand}</p>}
                </div>
                <span className="text-xs text-purple-300/50 ml-auto">{d.lightup_count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-purple-300/30 text-center">No discoveries yet</p>
        )}
      </div>

      {/* Actions */}
      {myTraveller && myTraveller.id !== travellerId && (
        <div className="space-y-2">
          {!friendship ? (
            <button
              onClick={sendFriendRequest}
              className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
              + Invite to Pool
            </button>
          ) : friendship.status === 'pending' ? (
            <div className="text-center text-xs text-purple-300/50">Invite sent ✓</div>
          ) : (
            <div className="text-center text-xs text-emerald-400">Friends ✓</div>
          )}
        </div>
      )}
    </div>
  )
}
