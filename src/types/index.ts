// src/types/index.ts
// Auto-derivable from DB schema — keep in sync with schema.sql

export type TravelerStatus = 'online' | 'do_not_disturb' | 'offline'
export type PickListCategory = 'foundation' | 'lipstick' | 'skincare'
export type FriendshipStatus = 'pending' | 'accepted' | 'declined'
export type VoiceRoomStatus = 'active' | 'ended'

export interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Traveller {
  id: string
  user_id: string
  nickname: string
  avatar_url: string | null
  avatar_color: string
  status: TravelerStatus
  bio: string | null
  created_at: string
  updated_at: string
}

export interface PickList {
  id: string
  traveller_id: string
  category: PickListCategory
  name: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Discovery {
  id: string
  traveller_id: string
  product_name: string
  brand: string | null
  category: PickListCategory | null
  notes: string | null
  image_url: string | null
  pick_list_id: string | null
  lightup_count: number
  created_at: string
  updated_at: string
  // Joined
  traveller?: Traveller
  is_lit_up?: boolean // by current user
}

export interface Backpack {
  id: string
  traveller_id: string
  discovery_id: string
  scanned_from_traveller_id: string | null
  saved_at: string
  discovery?: Discovery
}

export interface Lightup {
  id: string
  traveller_id: string
  discovery_id: string
  created_at: string
}

export interface Friendship {
  id: string
  requester_id: string
  addressee_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
  requester?: Traveller
  addressee?: Traveller
}

export interface VoiceRoom {
  id: string
  livekit_room_name: string
  host_traveller_id: string
  status: VoiceRoomStatus
  max_participants: number
  created_at: string
  ended_at: string | null
  participants?: VoiceRoomParticipant[]
}

export interface VoiceRoomParticipant {
  id: string
  room_id: string
  traveller_id: string
  joined_at: string
  left_at: string | null
  traveller?: Traveller
}

// Real-time presence payload
export interface PoolPresence {
  traveller_id: string
  nickname: string
  avatar_url: string | null
  avatar_color: string
  status: TravelerStatus
  position_x: number // 0–100 (percentage of pool width)
  position_y: number // 0–100 (percentage of pool height)
  online_at: string
}

// API response wrappers
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}
