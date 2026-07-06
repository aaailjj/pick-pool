// src/components/pool/TravellerAvatar.tsx
'use client'

import { PoolPresence } from '@/types'

interface Props {
  presence: PoolPresence
  isMe?: boolean
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
}

const STATUS_COLORS = {
  online: '#34d399',
  do_not_disturb: '#f87171',
  offline: '#6b7280',
}

const STATUS_LABELS = {
  online: 'Online',
  do_not_disturb: 'Do Not Disturb',
  offline: 'Offline',
}

export default function TravellerAvatar({ presence, isMe, isSelected, onClick }: Props) {
  const statusColor = STATUS_COLORS[presence.status]
  const initials = presence.nickname.slice(0, 2).toUpperCase()

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out"
      style={{
        left: `${presence.position_x}%`,
        top: `${presence.position_y}%`,
        zIndex: isSelected ? 30 : 20,
      }}>

      {/* Ripple on click / selected */}
      {isSelected && (
        <>
          <div className="absolute inset-0 rounded-full border border-purple-400/40 ripple-ring"
            style={{ width: '56px', height: '56px', top: '-4px', left: '-4px' }} />
          <div className="absolute inset-0 rounded-full border border-purple-400/20 ripple-ring"
            style={{ width: '72px', height: '72px', top: '-12px', left: '-12px', animationDelay: '0.2s' }} />
        </>
      )}

      {/* Me indicator ring */}
      {isMe && (
        <div className="absolute inset-0 rounded-full glow-pulse"
          style={{
            width: '52px', height: '52px',
            top: '-2px', left: '-2px',
            border: `2px solid ${statusColor}`,
          }} />
      )}

      {/* Avatar bubble */}
      <button
        onClick={onClick}
        className="traveller-avatar relative flex flex-col items-center cursor-pointer"
        title={`${presence.nickname} — ${STATUS_LABELS[presence.status]}`}>

        <div
          className="relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg overflow-hidden"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${lighten(presence.avatar_color)}, ${presence.avatar_color})`,
            border: `2px solid ${statusColor}40`,
            boxShadow: `0 0 12px ${presence.avatar_color}40, 0 4px 12px rgba(0,0,0,0.5)`,
          }}>

          {presence.avatar_url ? (
            <img src={presence.avatar_url} alt={presence.nickname}
              className="w-full h-full object-cover" />
          ) : (
            <span style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{initials}</span>
          )}

          {/* Water drop shimmer */}
          <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-white/20" />
        </div>

        {/* Status dot */}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{
            background: statusColor,
            borderColor: '#1a0a2e',
            boxShadow: `0 0 6px ${statusColor}`,
          }} />

        {/* Nickname tag */}
        <div
          className="mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
          style={{
            background: 'rgba(26,10,46,0.85)',
            border: '1px solid rgba(167,139,250,0.2)',
            color: isMe ? '#a78bfa' : 'rgba(245,240,255,0.8)',
            fontSize: '10px',
          }}>
          {isMe ? `${presence.nickname} (me)` : presence.nickname}
        </div>
      </button>
    </div>
  )
}

function lighten(hex: string): string {
  // Simple lighten: shift toward white
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const lr = Math.min(255, r + 80)
  const lg = Math.min(255, g + 80)
  const lb = Math.min(255, b + 80)
  return `rgb(${lr}, ${lg}, ${lb})`
}
