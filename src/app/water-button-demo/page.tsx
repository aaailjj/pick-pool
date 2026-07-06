'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

// SSR disabled — Canvas requires WebGL (browser only)
const PickPoolWaterButton = dynamic(
  () => import('@/components/PickPoolWaterButton'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}
      />
    ),
  },
)

const LIPSTICKS = [
  { id: '01', url: '/textures/lipstick/01.png', label: 'Terracotta' },
  { id: '02', url: '/textures/lipstick/02.png', label: 'Dark Rose' },
  { id: '03', url: '/textures/lipstick/03.png', label: 'Mahogany' },
  { id: '04', url: '/textures/lipstick/04.png', label: 'Maroon' },
  { id: '05', url: '/textures/lipstick/05.png', label: 'Rose Pink' },
]

export default function WaterButtonDemoPage() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0c0c14',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Heading */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            color: '#fff',
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '0.22em',
            margin: 0,
          }}
        >
          PICKPOOL
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            marginTop: 8,
          }}
        >
          Water Button Demo
        </p>
      </div>

      {/* Button grid */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {LIPSTICKS.map(({ id, url, label }) => (
          <div
            key={id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {/* Selection ring */}
            <div
              style={{
                borderRadius: '50%',
                boxShadow:
                  selected === id
                    ? '0 0 0 2px rgba(255,255,255,0.55), 0 0 20px rgba(255,255,255,0.08)'
                    : '0 0 0 2px transparent',
                transition: 'box-shadow 0.25s ease',
              }}
            >
              <PickPoolWaterButton
                textureUrl={url}
                onClick={() => setSelected(id)}
              />
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color:
                  selected === id
                    ? 'rgba(255,255,255,0.7)'
                    : 'rgba(255,255,255,0.28)',
                transition: 'color 0.2s ease',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Selected indicator */}
      <div
        style={{
          height: 20,
          fontSize: 11,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          transition: 'opacity 0.2s ease',
          opacity: selected ? 1 : 0,
        }}
      >
        {selected
          ? `Selected — ${LIPSTICKS.find((l) => l.id === selected)?.label}`
          : ''}
      </div>
    </main>
  )
}
