// src/components/pool/BeautyPool.tsx
'use client'

import { useRef, useEffect, useCallback } from 'react'
import { usePoolStore } from '@/store/pool-store'
import { usePoolRealtime } from '@/hooks/usePoolRealtime'
import { PoolPresence } from '@/types'
import TravellerAvatar from './TravellerAvatar'
import DiscoveryFeed from '../discovery/DiscoveryFeed'
import TravellerPanel from '../traveller/TravellerPanel'
import BackpackPanel from '../traveller/BackpackPanel'
import PickListPanel from '../traveller/PickListPanel'
import PoolHeader from './PoolHeader'
import VoiceBar from './VoiceBar'

export default function BeautyPool() {
  const poolRef = useRef<HTMLDivElement>(null)
  const { updatePosition } = usePoolRealtime()

  const {
    myTraveller,
    poolPresences,
    selectedTravellerId,
    setSelectedTravellerId,
    isBackpackOpen,
    isPickListOpen,
  } = usePoolStore()

  // Click-to-move: update my position in realtime presence
  const handlePoolClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!poolRef.current) return
      const rect = poolRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      updatePosition(x, y)
      setSelectedTravellerId(null)
    },
    [updatePosition, setSelectedTravellerId]
  )

  return (
    <div className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: 'linear-gradient(160deg, #0f0520 0%, #1a0a2e 40%, #2d1b69 100%)' }}>

      {/* 2.5D Pool Island Background */}
      <PoolIslandSVG />

      {/* Pool water surface — clickable area */}
      <div
        ref={poolRef}
        className="absolute inset-0 cursor-pointer"
        onClick={handlePoolClick}
        style={{ zIndex: 10 }}>

        {/* Other travelers */}
        {poolPresences.map((presence: PoolPresence) => (
          <TravellerAvatar
            key={presence.traveller_id}
            presence={presence}
            isSelected={selectedTravellerId === presence.traveller_id}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedTravellerId(
                selectedTravellerId === presence.traveller_id
                  ? null
                  : presence.traveller_id
              )
            }}
          />
        ))}

        {/* My avatar — center-ish initial position, moves via presence */}
        {myTraveller && (
          <TravellerAvatar
            presence={{
              traveller_id: myTraveller.id,
              nickname: myTraveller.nickname,
              avatar_url: myTraveller.avatar_url,
              avatar_color: myTraveller.avatar_color,
              status: myTraveller.status,
              position_x: 50,
              position_y: 50,
              online_at: new Date().toISOString(),
            }}
            isMe
            isSelected={false}
            onClick={() => {}}
          />
        )}
      </div>

      {/* Header HUD */}
      <PoolHeader />

      {/* Discovery feed — right side */}
      <DiscoveryFeed />

      {/* Selected traveller panel */}
      {selectedTravellerId && (
        <TravellerPanel travellerId={selectedTravellerId} />
      )}

      {/* Sliding panels */}
      {isBackpackOpen && <BackpackPanel />}
      {isPickListOpen && <PickListPanel />}

      {/* Voice bar — bottom */}
      <VoiceBar />
    </div>
  )
}

function PoolIslandSVG() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ zIndex: 1 }}>

      <defs>
        <radialGradient id="poolGrad" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#4c2a8a" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#1a0a2e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="islandGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2d1b69" stopOpacity="0.05" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="shimmerLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="rgba(167,139,250,0.3)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Deep pool glow */}
      <ellipse cx="600" cy="450" rx="700" ry="350" fill="url(#poolGrad)" />

      {/* Island platform — 2.5D perspective */}
      {/* Top face */}
      <ellipse cx="600" cy="380" rx="480" ry="160"
        fill="#2d1b69" fillOpacity="0.5"
        stroke="rgba(167,139,250,0.15)" strokeWidth="1" />

      {/* Island gradient overlay */}
      <ellipse cx="600" cy="370" rx="460" ry="148" fill="url(#islandGrad)" />

      {/* Side face — 2.5D depth */}
      <path d="M 120 380 Q 600 400 1080 380 L 1080 440 Q 600 470 120 440 Z"
        fill="#1a0a2e" fillOpacity="0.7" />

      {/* Inner pool circle */}
      <ellipse cx="600" cy="370" rx="300" ry="100"
        fill="#0f0520" fillOpacity="0.4"
        stroke="rgba(124,58,237,0.2)" strokeWidth="1" />

      {/* Shimmer lines across pool */}
      {[0, 20, 40, 60, 80].map((y, i) => (
        <line key={i}
          x1="150" y1={320 + y} x2="1050" y2={320 + y}
          stroke="url(#shimmerLine)"
          strokeWidth="0.5"
          strokeOpacity="0.4" />
      ))}

      {/* Decorative corner elements — 2.5D pillars */}
      {[
        [180, 360], [1020, 360], [380, 310], [820, 310],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx="14" ry="8"
            fill="#7c3aed" fillOpacity="0.3"
            filter="url(#glow)" />
          <ellipse cx={cx} cy={cy} rx="7" ry="4"
            fill="#a78bfa" fillOpacity="0.6" />
        </g>
      ))}

      {/* Floating petals / sparkles */}
      {[
        [200, 280, '#f472b6'], [950, 300, '#a78bfa'],
        [400, 250, '#fbbf24'], [750, 260, '#f472b6'],
        [580, 230, '#a78bfa'],
      ].map(([x, y, color], i) => (
        <g key={i}>
          <circle cx={Number(x)} cy={Number(y)} r="3"
            fill={String(color)} fillOpacity="0.6"
            filter="url(#glow)" />
          <circle cx={Number(x)} cy={Number(y)} r="1.5"
            fill="white" fillOpacity="0.8" />
        </g>
      ))}

      {/* Beauty pool label */}
      <text x="600" y="375" textAnchor="middle"
        fontFamily="Inter, sans-serif" fontSize="11"
        fill="rgba(167,139,250,0.35)" letterSpacing="6">
        BEAUTY POOL
      </text>
    </svg>
  )
}
