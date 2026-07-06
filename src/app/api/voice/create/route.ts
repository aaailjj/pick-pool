// src/app/api/voice/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLiveKitToken, generateRoomName } from '@/lib/livekit'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { traveller_id } = await req.json()

  // Fetch traveller
  const { data: traveller } = await supabase
    .from('travellers')
    .select('*')
    .eq('id', traveller_id)
    .single()

  if (!traveller) return NextResponse.json({ error: 'Traveller not found' }, { status: 404 })

  // Check existing active rooms (host)
  const { data: existingRoom } = await supabase
    .from('voice_rooms')
    .select('*')
    .eq('host_traveller_id', traveller_id)
    .eq('status', 'active')
    .maybeSingle()

  let roomName: string

  if (existingRoom) {
    roomName = existingRoom.livekit_room_name
  } else {
    roomName = generateRoomName(traveller_id)

    const { data: room, error } = await supabase
      .from('voice_rooms')
      .insert({
        livekit_room_name: roomName,
        host_traveller_id: traveller_id,
        status: 'active',
        max_participants: 4,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Add host as participant
    await supabase.from('voice_room_participants').insert({
      room_id: room.id,
      traveller_id,
    })
  }

  const token = await generateLiveKitToken(roomName, traveller.nickname, traveller_id)

  const { data: fullRoom } = await supabase
    .from('voice_rooms')
    .select('*, participants:voice_room_participants(*, traveller:travellers(*))')
    .eq('livekit_room_name', roomName)
    .single()

  return NextResponse.json({ token, room: fullRoom })
}
