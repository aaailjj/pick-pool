// src/components/discovery/DiscoveryFeed.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePoolStore } from '@/store/pool-store'
import { Discovery } from '@/types'

export default function DiscoveryFeed() {
  const { recentDiscoveries, setRecentDiscoveries, myTraveller } = usePoolStore()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('discoveries')
        .select('*, traveller:travellers(id, nickname, avatar_color)')
        .order('created_at', { ascending: false })
        .limit(30)
      if (data) setRecentDiscoveries(data as Discovery[])
    }
    load()
  }, [])

  async function handleLightUp(discoveryId: string) {
    if (!myTraveller) return
    const { error } = await supabase
      .from('lightups')
      .insert({ traveller_id: myTraveller.id, discovery_id: discoveryId })
    if (!error) {
      setRecentDiscoveries(
        recentDiscoveries.map(d =>
          d.id === discoveryId ? { ...d, lightup_count: d.lightup_count + 1, is_lit_up: true } : d
        )
      )
    }
  }

  async function handleScan(discovery: Discovery) {
    if (!myTraveller) return
    await supabase.from('backpacks').insert({
      traveller_id: myTraveller.id,
      discovery_id: discovery.id,
      scanned_from_traveller_id: discovery.traveller_id,
    })
  }

  return (
    <div className="absolute right-4 top-16 bottom-20 w-64 z-30 flex flex-col gap-2">
      {/* Add discovery button */}
      <button
        onClick={() => setIsAddOpen(true)}
        className="glass rounded-xl px-3 py-2.5 text-xs flex items-center gap-2 text-purple-200 hover:text-white transition-colors">
        <span className="text-base">＋</span>
        <span>Share a Discovery</span>
      </button>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {recentDiscoveries.map(d => (
          <DiscoveryCard
            key={d.id}
            discovery={d}
            onLightUp={() => handleLightUp(d.id)}
            onScan={() => handleScan(d)}
            isOwn={d.traveller_id === myTraveller?.id}
          />
        ))}
        {recentDiscoveries.length === 0 && (
          <div className="text-center text-purple-300/40 text-xs mt-8">
            <div className="text-2xl mb-2">✨</div>
            No discoveries yet.<br />Be the first!
          </div>
        )}
      </div>

      {isAddOpen && <AddDiscoveryModal onClose={() => setIsAddOpen(false)} />}
    </div>
  )
}

function DiscoveryCard({
  discovery,
  onLightUp,
  onScan,
  isOwn,
}: {
  discovery: Discovery
  onLightUp: () => void
  onScan: () => void
  isOwn: boolean
}) {
  const CATEGORY_COLORS: Record<string, string> = {
    foundation: '#fbbf24',
    lipstick: '#f472b6',
    skincare: '#34d399',
  }
  const catColor = discovery.category ? CATEGORY_COLORS[discovery.category] : '#a78bfa'

  return (
    <div className="glass rounded-xl p-3 group">
      <div className="flex items-start gap-2">
        {/* Traveller dot */}
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
          style={{
            background: discovery.traveller?.avatar_color || '#7c3aed',
            boxShadow: `0 0 6px ${discovery.traveller?.avatar_color || '#7c3aed'}60`,
          }}>
          {(discovery.traveller?.nickname || '?').slice(0, 1)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-purple-300/60 truncate">
              {discovery.traveller?.nickname || 'Unknown'}
            </span>
            {discovery.category && (
              <span className="text-xs px-1.5 py-0 rounded-full"
                style={{ background: `${catColor}20`, color: catColor, fontSize: '9px' }}>
                {discovery.category}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white leading-tight">{discovery.product_name}</p>
          {discovery.brand && (
            <p className="text-xs text-purple-300/60 mt-0.5">{discovery.brand}</p>
          )}
          {discovery.notes && (
            <p className="text-xs text-purple-200/70 mt-1 line-clamp-2">{discovery.notes}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isOwn && (
        <div className="flex gap-1.5 mt-2 pt-2 border-t border-purple-500/10">
          <button
            onClick={onLightUp}
            disabled={discovery.is_lit_up}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all disabled:opacity-50"
            style={{
              background: discovery.is_lit_up ? 'rgba(251,191,36,0.2)' : 'rgba(251,191,36,0.1)',
              color: '#fbbf24',
            }}>
            ✦ {discovery.lightup_count}
          </button>
          <button
            onClick={onScan}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all hover:bg-purple-500/20"
            style={{ color: '#a78bfa' }}>
            🎒 Scan
          </button>
        </div>
      )}
      {isOwn && (
        <div className="mt-2 pt-2 border-t border-purple-500/10">
          <span className="text-xs text-purple-300/40">✦ {discovery.lightup_count} light-ups</span>
        </div>
      )}
    </div>
  )
}

function AddDiscoveryModal({ onClose }: { onClose: () => void }) {
  const { myTraveller, addDiscovery } = usePoolStore()
  const supabase = createClient()
  const [form, setForm] = useState({
    product_name: '',
    brand: '',
    category: '' as '' | 'foundation' | 'lipstick' | 'skincare',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!myTraveller || !form.product_name.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('discoveries')
      .insert({
        traveller_id: myTraveller.id,
        product_name: form.product_name.trim(),
        brand: form.brand.trim() || null,
        category: form.category || null,
        notes: form.notes.trim() || null,
      })
      .select('*, traveller:travellers(id, nickname, avatar_color)')
      .single()

    if (!error && data) {
      addDiscovery(data as Discovery)
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}>
      <div className="glass-dark rounded-2xl p-6 w-80 max-w-full mx-4"
        onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-white mb-4">Share a Discovery</h3>

        <div className="space-y-3">
          <Input label="Product Name *" value={form.product_name}
            onChange={v => setForm(f => ({ ...f, product_name: v }))}
            placeholder="e.g. 毛戈平粉膏" />
          <Input label="Brand" value={form.brand}
            onChange={v => setForm(f => ({ ...f, brand: v }))}
            placeholder="e.g. 毛戈平" />
          <div>
            <label className="text-xs text-purple-300/70 uppercase tracking-widest mb-1.5 block">Category</label>
            <div className="flex gap-2">
              {(['foundation', 'lipstick', 'skincare'] as const).map(cat => (
                <button key={cat}
                  onClick={() => setForm(f => ({ ...f, category: f.category === cat ? '' : cat }))}
                  className="flex-1 py-1.5 rounded-lg text-xs capitalize transition-all"
                  style={{
                    background: form.category === cat ? 'rgba(124,58,237,0.5)' : 'rgba(26,10,46,0.6)',
                    border: `1px solid ${form.category === cat ? 'rgba(167,139,250,0.5)' : 'rgba(167,139,250,0.1)'}`,
                    color: form.category === cat ? 'white' : 'rgba(167,139,250,0.5)',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <Input label="Notes" value={form.notes}
            onChange={v => setForm(f => ({ ...f, notes: v }))}
            placeholder="Why you love it..." />
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-purple-300/60 hover:text-purple-200 transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={loading || !form.product_name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs text-purple-300/70 uppercase tracking-widest mb-1.5 block">{label}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-white placeholder-purple-300/30 text-sm outline-none focus:ring-1 focus:ring-purple-500/50"
        style={{ background: 'rgba(26,10,46,0.6)', border: '1px solid rgba(167,139,250,0.15)' }}
      />
    </div>
  )
}
