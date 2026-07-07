'use client'

/**
 * WaterButton Gallery
 *
 * Displays every lipstick PNG in the project as a WaterButton,
 * sorted by perceptual color similarity (LAB color space, hue-first).
 *
 * Color order: Pink → Rose → Coral → Terracotta → Mahogany → Maroon
 * (computed by /tmp/analyze-lipstick.js → public/textures/lipstick/palette.json)
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import palette from '../../../public/textures/lipstick/palette.json'

const WaterButton = dynamic(
  () => import('@/components/WaterButton').then(m => ({ default: m.WaterButton })),
  {
    ssr: false,
    loading: () => (
      <div style={{
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(180,150,140,0.12)',
      }} />
    ),
  },
)

// Known label overrides (filename → display label)
const LABEL_MAP: Record<string, string> = {
  '01.png': 'Terracotta',
  '02.png': 'Dark Rose',
  '03.png': 'Mahogany',
  '04.png': 'Maroon',
  '05.png': 'Rose Pink',
  'real.png': 'Terracotta Real',
}

type PaletteEntry = {
  file: string
  url: string
  label: string
  rgb: { r: number; g: number; b: number }
  lab: { L: number; a: number; b: number }
  hsv: { h: number; s: number; v: number }
  sortKey: number
}

const items = (palette as PaletteEntry[]).map(p => ({
  ...p,
  label: LABEL_MAP[p.file] ?? p.label,
}))

export default function GalleryPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const sel = items.find(i => i.file === selected)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#ede8e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '60px 24px 80px',
      gap: 0,
    }}>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{
          color: '#2a1f1a', fontSize: 18, fontWeight: 300,
          letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0,
        }}>
          WaterButton Gallery
        </h1>
        <p style={{
          color: 'rgba(42,31,26,0.38)', fontSize: 10,
          letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 8,
        }}>
          {items.length} colors · sorted by LAB hue
        </p>
      </header>

      {/* Button grid — one row, scrollable on mobile */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
        maxWidth: 1100,
      }}>
        {items.map(({ file, url, label, lab, rgb }) => (
          <div
            key={file}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}
            onClick={() => setSelected(file === selected ? null : file)}
          >
            {/* Selection ring */}
            <div style={{
              borderRadius: '50%',
              boxShadow: selected === file
                ? '0 0 0 2px rgba(42,31,26,0.5), 0 4px 24px rgba(0,0,0,0.08)'
                : '0 0 0 2px transparent',
              transition: 'box-shadow 0.2s ease',
            }}>
              <WaterButton texture={url} size={160} onClick={() => {}} />
            </div>

            {/* Label */}
            <span style={{
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: selected === file ? 'rgba(42,31,26,0.8)' : 'rgba(42,31,26,0.4)',
              transition: 'color 0.2s',
              textAlign: 'center',
              maxWidth: 100,
            }}>
              {label}
            </span>

            {/* Small color swatch dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: `rgb(${rgb.r},${rgb.g},${rgb.b})`,
              opacity: 0.7,
            }} />
          </div>
        ))}
      </div>

      {/* Selected color detail */}
      {sel && (
        <div style={{
          marginTop: 48,
          padding: '24px 32px',
          background: 'rgba(255,255,255,0.55)',
          borderRadius: 16,
          display: 'flex',
          gap: 32,
          alignItems: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 24px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `rgb(${sel.rgb.r},${sel.rgb.g},${sel.rgb.b})`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#2a1f1a', letterSpacing: '0.05em' }}>
              {sel.label}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(42,31,26,0.5)', letterSpacing: '0.08em' }}>
              L {sel.lab.L} · a {sel.lab.a} · b {sel.lab.b}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(42,31,26,0.4)', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
              rgb({sel.rgb.r}, {sel.rgb.g}, {sel.rgb.b})
            </span>
          </div>
        </div>
      )}

    </main>
  )
}
