// src/components/traveller/PickListPanel.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePoolStore } from '@/store/pool-store'
import { PickList, PickListCategory } from '@/types'

const CATEGORIES: { key: PickListCategory; label: string; icon: string; color: string }[] = [
  { key: 'foundation', label: 'Foundation', icon: '🌟', color: '#fbbf24' },
  { key: 'lipstick', label: 'Lipstick', icon: '💄', color: '#f472b6' },
  { key: 'skincare', label: 'Skincare', icon: '🌿', color: '#34d399' },
]

export default function PickListPanel() {
  const { myTraveller, setIsPickListOpen } = usePoolStore()
  const supabase = createClient()
  const [lists, setLists] = useState<PickList[]>([])
  const [activeCategory, setActiveCategory] = useState<PickListCategory>('foundation')
  const [isCreating, setIsCreating] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!myTraveller) return
    async function load() {
      const { data } = await supabase
        .from('pick_lists')
        .select('*')
        .eq('traveller_id', myTraveller!.id)
        .order('created_at', { ascending: true })
      setLists(data || [])
      setLoading(false)
    }
    load()
  }, [myTraveller?.id])

  async function createList() {
    if (!myTraveller || !newListName.trim()) return
    const { data } = await supabase
      .from('pick_lists')
      .insert({
        traveller_id: myTraveller.id,
        category: activeCategory,
        name: newListName.trim(),
      })
      .select().single()
    if (data) {
      setLists(l => [...l, data])
      setNewListName('')
      setIsCreating(false)
    }
  }

  async function deleteList(id: string) {
    await supabase.from('pick_lists').delete().eq('id', id)
    setLists(l => l.filter(x => x.id !== id))
  }

  const filtered = lists.filter(l => l.category === activeCategory)
  const activeCat = CATEGORIES.find(c => c.key === activeCategory)!

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={() => setIsPickListOpen(false)} />
      <div className="w-80 h-full glass-dark overflow-y-auto">
        <div className="sticky top-0 glass-dark p-4 border-b border-purple-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-sm font-bold text-white">My Pick Lists</h2>
          </div>
          <button onClick={() => setIsPickListOpen(false)}
            className="text-purple-300/50 hover:text-white transition-colors">✕</button>
        </div>

        {/* Category tabs */}
        <div className="p-3 flex gap-2 border-b border-purple-500/10">
          {CATEGORIES.map(cat => (
            <button key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat.key ? `${cat.color}20` : 'rgba(26,10,46,0.4)',
                border: `1px solid ${activeCategory === cat.key ? cat.color + '40' : 'rgba(167,139,250,0.1)'}`,
                color: activeCategory === cat.key ? cat.color : 'rgba(167,139,250,0.5)',
              }}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {loading ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-12 rounded-xl bg-purple-500/10 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(list => (
                <div key={list.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl group"
                  style={{ background: `${activeCat.color}10`, border: `1px solid ${activeCat.color}20` }}>
                  <span style={{ color: activeCat.color }}>{activeCat.icon}</span>
                  <span className="text-sm text-white flex-1">{list.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-300/40">
                      {list.is_public ? '🌐' : '🔒'}
                    </span>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="text-xs text-purple-300/30 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100">
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && !isCreating && (
                <div className="text-center py-6">
                  <p className="text-xs text-purple-300/30">
                    No {activeCategory} lists yet.
                  </p>
                </div>
              )}

              {/* Create new */}
              {isCreating ? (
                <div className="flex gap-2 mt-3">
                  <input
                    autoFocus
                    value={newListName}
                    onChange={e => setNewListName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') createList(); if (e.key === 'Escape') setIsCreating(false) }}
                    placeholder={`My ${activeCategory} picks...`}
                    className="flex-1 px-3 py-2 rounded-xl text-sm text-white placeholder-purple-300/30 outline-none"
                    style={{ background: 'rgba(26,10,46,0.6)', border: '1px solid rgba(167,139,250,0.2)' }}
                  />
                  <button onClick={createList}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}>
                    Add
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full py-2.5 rounded-xl text-xs transition-all mt-2"
                  style={{
                    border: `1px dashed ${activeCat.color}40`,
                    color: activeCat.color + '80',
                  }}>
                  + New {activeCat.label} List
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
