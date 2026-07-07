'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const WaterButton = dynamic(
  () => import('@/components/WaterButton').then(m => ({ default: m.WaterButton })),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: 220, height: 220, borderRadius: '50%', background: 'rgba(237,232,224,0.3)' }} />
    ),
  },
)

const LIPSTICKS = [
  { id: '01', url: '/textures/lipstick/01.png', label: 'Terracotta' },
  { id: '02', url: '/textures/lipstick/02.png', label: 'Dark Rose'  },
  { id: '03', url: '/textures/lipstick/03.png', label: 'Mahogany'   },
  { id: '04', url: '/textures/lipstick/04.png', label: 'Maroon'     },
  { id: '05', url: '/textures/lipstick/05.png', label: 'Rose Pink'  },
]

export default function WaterButtonDemoPage() {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#ede8e0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#2a1f1a', fontSize: 20, fontWeight: 300, letterSpacing: '0.22em', margin: 0 }}>
          PICKPOOL
        </h1>
        <p style={{ color: 'rgba(42,31,26,0.4)', fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', marginTop: 6 }}>
          Water Button
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
        {LIPSTICKS.map(({ id, url, label }) => (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              borderRadius: '50%',
              boxShadow: selected === id ? '0 0 0 2px rgba(42,31,26,0.5)' : '0 0 0 2px transparent',
              transition: 'box-shadow 0.2s ease',
            }}>
              <WaterButton
                texture={url}
                size={220}
                onClick={() => setSelected(id)}
              />
            </div>
            <span style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: selected === id ? 'rgba(42,31,26,0.75)' : 'rgba(42,31,26,0.35)',
              transition: 'color 0.2s ease',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {selected && (
        <p style={{ fontSize: 11, color: 'rgba(42,31,26,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          {LIPSTICKS.find(l => l.id === selected)?.label}
        </p>
      )}
    </main>
  )
}
