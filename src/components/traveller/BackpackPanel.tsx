// src/components/traveller/BackpackPanel.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePoolStore } from '@/store/pool-store'
import { Backpack } from '@/types'

export default function BackpackPanel() {
  const { myTraveller, setIsBackpackOpen } = usePoolStore()
  const supabase = createClient()
  const [items, setItems] = useState<Backpack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!myTraveller) return
    async function load() {
      const { data } = await supabase
        .from('backpacks')
        .select('*, discovery:discoveries(*, traveller:travellers(nickname, avatar_color))')
        .eq('traveller_id', myTraveller!.id)
        .order('saved_at', { ascending: false })
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [myTraveller?.id])

  const CATEGORY_LABELS: Record<string, string> = {
    foundation: '🌟 Foundation',
    lipstick: '💄 Lipstick',
    skincare: '🌿 Skincare',
  }

  const grouped = items.reduce((acc, item) => {
    const cat = item.discovery?.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, Backpack[]>)

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={() => setIsBackpackOpen(false)} />
      <div className="w-80 h-full glass-dark overflow-y-auto">
        <div className="sticky top-0 glass-dark p-4 border-b border-purple-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎒</span>
            <h2 className="text-sm font-bold text-white">My Backpack</h2>
          </div>
          <button onClick={() => setIsBackpackOpen(false)}
            className="text-purple-300/50 hover:text-white transition-colors">✕</button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-purple-500/10 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center mt-12">
              <div className="text-4xl mb-3">🎒</div>
              <p className="text-sm text-purple-300/50">Your backpack is empty.</p>
              <p className="text-xs text-purple-300/30 mt-1">Scan discoveries from other travelers to collect them.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {Object.entries(grouped).map(([cat, catItems]) => (
                <div key={cat}>
                  <p className="text-xs text-purple-300/50 uppercase tracking-widest mb-2">
                    {CATEGORY_LABELS[cat] || '✦ Other'}
                  </p>
                  <div className="space-y-2">
                    {catItems.map(item => (
                      <div key={item.id}
                        className="rounded-xl p-3"
                        style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(167,139,250,0.1)' }}>
                        <p className="text-sm font-semibold text-white">{item.discovery?.product_name}</p>
                        {item.discovery?.brand && (
                          <p className="text-xs text-purple-300/60 mt-0.5">{item.discovery.brand}</p>
                        )}
                        {item.discovery?.notes && (
                          <p className="text-xs text-purple-200/60 mt-1 line-clamp-2">{item.discovery.notes}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-purple-300/40">
                            from {item.discovery?.traveller?.nickname || 'Unknown'}
                          </span>
                          <span className="text-xs text-purple-300/30">
                            {new Date(item.saved_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
