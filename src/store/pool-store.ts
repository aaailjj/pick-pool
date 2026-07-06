// src/store/pool-store.ts
import { create } from 'zustand'
import { Traveller, Discovery, PoolPresence, VoiceRoom } from '@/types'

interface PoolState {
  // Current user's traveller profile
  myTraveller: Traveller | null
  setMyTraveller: (t: Traveller | null) => void

  // All travelers currently in the pool
  poolPresences: PoolPresence[]
  setPoolPresences: (p: PoolPresence[]) => void
  upsertPresence: (p: PoolPresence) => void
  removePresence: (travellerId: string) => void

  // Recent discoveries (feed)
  recentDiscoveries: Discovery[]
  setRecentDiscoveries: (d: Discovery[]) => void
  addDiscovery: (d: Discovery) => void

  // Selected traveller (for side panel)
  selectedTravellerId: string | null
  setSelectedTravellerId: (id: string | null) => void

  // Active voice room
  activeVoiceRoom: VoiceRoom | null
  setActiveVoiceRoom: (room: VoiceRoom | null) => void

  // UI panels
  isBackpackOpen: boolean
  setIsBackpackOpen: (v: boolean) => void

  isPickListOpen: boolean
  setIsPickListOpen: (v: boolean) => void
}

export const usePoolStore = create<PoolState>((set) => ({
  myTraveller: null,
  setMyTraveller: (t) => set({ myTraveller: t }),

  poolPresences: [],
  setPoolPresences: (p) => set({ poolPresences: p }),
  upsertPresence: (p) =>
    set((state) => {
      const existing = state.poolPresences.findIndex(
        (x) => x.traveller_id === p.traveller_id
      )
      if (existing >= 0) {
        const updated = [...state.poolPresences]
        updated[existing] = p
        return { poolPresences: updated }
      }
      return { poolPresences: [...state.poolPresences, p] }
    }),
  removePresence: (id) =>
    set((state) => ({
      poolPresences: state.poolPresences.filter((p) => p.traveller_id !== id),
    })),

  recentDiscoveries: [],
  setRecentDiscoveries: (d) => set({ recentDiscoveries: d }),
  addDiscovery: (d) =>
    set((state) => ({
      recentDiscoveries: [d, ...state.recentDiscoveries].slice(0, 50),
    })),

  selectedTravellerId: null,
  setSelectedTravellerId: (id) => set({ selectedTravellerId: id }),

  activeVoiceRoom: null,
  setActiveVoiceRoom: (room) => set({ activeVoiceRoom: room }),

  isBackpackOpen: false,
  setIsBackpackOpen: (v) => set({ isBackpackOpen: v }),

  isPickListOpen: false,
  setIsPickListOpen: (v) => set({ isPickListOpen: v }),
}))
