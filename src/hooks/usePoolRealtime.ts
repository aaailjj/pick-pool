// src/hooks/usePoolRealtime.ts
'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePoolStore } from '@/store/pool-store'
import { PoolPresence, Discovery } from '@/types'

const POOL_CHANNEL = 'beauty-pool'

export function usePoolRealtime() {
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const {
    myTraveller,
    setPoolPresences,
    upsertPresence,
    removePresence,
    addDiscovery,
  } = usePoolStore()

  useEffect(() => {
    if (!myTraveller) return

    // Random starting position
    const position_x = 20 + Math.random() * 60
    const position_y = 20 + Math.random() * 60

    const myPresence: PoolPresence = {
      traveller_id: myTraveller.id,
      nickname: myTraveller.nickname,
      avatar_url: myTraveller.avatar_url,
      avatar_color: myTraveller.avatar_color,
      status: myTraveller.status,
      position_x,
      position_y,
      online_at: new Date().toISOString(),
    }

    const channel = supabase.channel(POOL_CHANNEL, {
      config: {
        presence: { key: myTraveller.id },
      },
    })

    // Presence: sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PoolPresence>()
      const all: PoolPresence[] = []
      Object.values(state).forEach((entries) => {
        if (entries[0]) all.push(entries[0] as unknown as PoolPresence)
      })
      setPoolPresences(all.filter((p) => p.traveller_id !== myTraveller.id))
    })

    // Presence: join
    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      newPresences.forEach((p) => {
        if (p.traveller_id !== myTraveller.id) {
          upsertPresence(p as unknown as PoolPresence)
        }
      })
    })

    // Presence: leave
    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach((p) => {
        removePresence((p as unknown as PoolPresence).traveller_id)
      })
    })

    // DB: new discovery broadcast
    channel
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'discoveries' },
        (payload) => {
          addDiscovery(payload.new as Discovery)
        }
      )

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(myPresence)
      }
    })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [myTraveller?.id])

  // Update position in presence
  const updatePosition = async (x: number, y: number) => {
    if (!channelRef.current || !myTraveller) return
    await channelRef.current.track({
      traveller_id: myTraveller.id,
      nickname: myTraveller.nickname,
      avatar_url: myTraveller.avatar_url,
      avatar_color: myTraveller.avatar_color,
      status: myTraveller.status,
      position_x: x,
      position_y: y,
      online_at: new Date().toISOString(),
    } as PoolPresence)
  }

  return { updatePosition }
}
