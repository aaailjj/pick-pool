// src/lib/livekit.ts
import { AccessToken } from 'livekit-server-sdk'

export async function generateLiveKitToken(
  roomName: string,
  participantName: string,
  participantId: string
): Promise<string> {
  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: participantId,
      name: participantName,
      ttl: '2h',
    }
  )

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  return await at.toJwt()
}

export function generateRoomName(hostId: string): string {
  return `pool-voice-${hostId}-${Date.now()}`
}
