// src/app/api/voice/token/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLiveKitToken } from '@/lib/livekit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { room_name, traveller_id, nickname } = await req.json()

  // Verify room exists and is active
  const { data: room } = await supabase
    .from('voice_rooms')
    .select('*, participants:voice_room_participants(traveller_id, left_at)')
    .eq('livekit_room_name', room_name)
    .eq('status', 'active')
    .single()

  if (!room) return NextResponse.json({ error: 'Room not found or ended' }, { status: 404 })

  // Check max participants
  const activeParticipants = (room.participants || []).filter((p: { left_at: string | null }) => !p.left_at)
  if (activeParticipants.length >= room.max_participants) {
    return NextResponse.json({ error: 'Room is full (max 4)' }, { status: 400 })
  }

  // Add participant record
  await supabase.from('voice_room_participants').upsert({
    room_id: room.id,
    traveller_id,
  })

  const token = await generateLiveKitToken(room_name, nickname, traveller_id)
  return NextResponse.json({ token })
}
