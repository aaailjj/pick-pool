// src/components/pool/VoiceBar.tsx
'use client'

import { useState, useCallback } from 'react'
import { usePoolStore } from '@/store/pool-store'
import {
  LiveKitRoom,
  useLocalParticipant,
  useParticipants,
  ParticipantTile,
  RoomAudioRenderer,
} from '@livekit/components-react'

export default function VoiceBar() {
  const { myTraveller, activeVoiceRoom, setActiveVoiceRoom } = usePoolStore()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function startVoiceRoom() {
    if (!myTraveller) return
    setLoading(true)
    try {
      const res = await fetch('/api/voice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traveller_id: myTraveller.id }),
      })
      const data = await res.json()
      if (data.token && data.room) {
        setToken(data.token)
        setActiveVoiceRoom(data.room)
      }
    } finally {
      setLoading(false)
    }
  }

  async function joinVoiceRoom(roomName: string) {
    if (!myTraveller) return
    setLoading(true)
    try {
      const res = await fetch('/api/voice/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: roomName,
          traveller_id: myTraveller.id,
          nickname: myTraveller.nickname,
        }),
      })
      const data = await res.json()
      if (data.token) setToken(data.token)
    } finally {
      setLoading(false)
    }
  }

  function leaveRoom() {
    setToken(null)
    setActiveVoiceRoom(null)
  }

  if (token && activeVoiceRoom) {
    return (
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        connect
        audio
        video={false}
        onDisconnected={leaveRoom}>
        <VoiceRoomHUD onLeave={leaveRoom} roomName={activeVoiceRoom.livekit_room_name} />
        <RoomAudioRenderer />
      </LiveKitRoom>
    )
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="glass rounded-2xl px-5 py-3 flex items-center gap-3">
        <span className="text-sm text-purple-300/50">Voice Room</span>
        <div className="w-px h-4 bg-purple-500/20" />
        <button
          onClick={startVoiceRoom}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-medium text-white transition-all hover:opacity-80 disabled:opacity-40">
          <span className="text-base">🎙</span>
          {loading ? 'Connecting...' : 'Start Room'}
        </button>
        <span className="text-xs text-purple-300/30">max 4</span>
      </div>
    </div>
  )
}

function VoiceRoomHUD({ onLeave, roomName }: { onLeave: () => void; roomName: string }) {
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()
  const [muted, setMuted] = useState(false)

  const toggleMute = useCallback(async () => {
    await localParticipant.setMicrophoneEnabled(muted)
    setMuted(!muted)
  }, [localParticipant, muted])

  async function copyInvite() {
    await navigator.clipboard.writeText(
      `${window.location.origin}/pool?voice=${roomName}`
    )
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="glass-dark rounded-2xl px-4 py-3 flex items-center gap-3">
        {/* Participants */}
        <div className="flex -space-x-2">
          {participants.slice(0, 4).map(p => (
            <div key={p.sid}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2"
              style={{
                background: '#7c3aed',
                borderColor: '#1a0a2e',
                boxShadow: p.isMicrophoneEnabled ? '0 0 8px #34d399' : 'none',
              }}>
              {(p.name || '?').slice(0, 2).toUpperCase()}
            </div>
          ))}
        </div>

        <div className="w-px h-4 bg-purple-500/20" />

        {/* Mute */}
        <button onClick={toggleMute}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
            muted ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
          {muted ? '🔇 Muted' : '🎙 Live'}
        </button>

        {/* Invite */}
        <button onClick={copyInvite}
          className="text-xs text-purple-300/60 hover:text-purple-200 transition-colors">
          🔗 Invite
        </button>

        {/* Leave */}
        <button onClick={onLeave}
          className="text-xs text-rose-400/70 hover:text-rose-400 transition-colors">
          Leave
        </button>
      </div>
    </div>
  )
}
