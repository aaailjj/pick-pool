'use client'

/**
 * WaterButton Gallery
 *
 * All lipstick PNGs in the project, sorted by LAB hue for perceptual
 * color order. Only buttons near the viewport are rendered (Intersection
 * Observer lazy load) so 99 WebGL canvases don't all fire at once.
 */

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import paletteRaw from '../../../public/textures/lipstick/palette.json'

const WaterButton = dynamic(
  () => import('@/components/WaterButton').then(m => ({ default: m.WaterButton })),
  { ssr: false }
)

// Known display-name overrides
const LABEL_MAP: Record<string, string> = {
  '01.png': 'Terracotta',
  '02.png': 'Dark Rose',
  '03.png': 'Mahogany',
  '04.png': 'Maroon',
  '05.png': 'Rose Pink',
  'real.png': 'Terracotta Real',
}

type Entry = {
  file: string; url: string; label: string
  rgb: { r: number; g: number; b: number }
  lab: { L: number; a: number; b: number }
  hsv: { h: number; s: number; v: number }
}

const items: Entry[] = (paletteRaw as Entry[]).map(p => ({
  ...p,
  label: LABEL_MAP[p.file] ?? p.label,
}))

// ── Lazy-rendered button ───────────────────────────────────────────────────
const SIZE = 140

function LazyButton({ item, selected, onSelect }: {
  item: Entry
  selected: boolean
  onSelect: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      onClick={onSelect}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 6, cursor: 'pointer', userSelect: 'none',
      }}
    >
      <div style={{
        borderRadius: '50%',
        boxShadow: selected
          ? '0 0 0 2px rgba(42,31,26,0.5), 0 4px 20px rgba(0,0,0,0.08)'
          : '0 0 0 2px transparent',
        transition: 'box-shadow 0.2s',
        width: SIZE, height: SIZE,
      }}>
        {visible ? (
          <WaterButton texture={item.url} size={SIZE} />
        ) : (
          <div style={{
            width: SIZE, height: SIZE, borderRadius: '50%',
            background: `rgb(${item.rgb.r},${item.rgb.g},${item.rgb.b})`,
            opacity: 0.25,
          }} />
        )}
      </div>

      <span style={{
        fontSize: 9, letterSpacing: '0.09em', textTransform: 'uppercase',
        color: selected ? 'rgba(42,31,26,0.75)' : 'rgba(42,31,26,0.38)',
        transition: 'color 0.2s', textAlign: 'center', maxWidth: 90,
        lineHeight: 1.4,
      }}>
        {item.label}
      </span>

      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: `rgb(${item.rgb.r},${item.rgb.g},${item.rgb.b})`,
        opacity: 0.65,
      }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function GalleryPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const sel = items.find(i => i.file === selected)

  return (
    <main style={{
      minHeight: '100vh',
      background: '#ede8e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '56px 24px 100px', gap: 0,
    }}>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 52 }}>
        <h1 style={{
          color: '#2a1f1a', fontSize: 17, fontWeight: 300,
          letterSpacing: '0.28em', textTransform: 'uppercase', margin: 0,
        }}>
          WaterButton Gallery
        </h1>
        <p style={{
          color: 'rgba(42,31,26,0.38)', fontSize: 10,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 8,
        }}>
          {items.length} colors · sorted by LAB hue
        </p>
      </header>

      {/* Grid */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
        gap: '16px 12px', maxWidth: 1200,
      }}>
        {items.map(item => (
          <LazyButton
            key={item.file}
            item={item}
            selected={selected === item.file}
            onSelect={() => setSelected(item.file === selected ? null : item.file)}
          />
        ))}
      </div>

      {/* Selected detail panel */}
      {sel && (
        <div style={{
          position: 'sticky', bottom: 24, marginTop: 40,
          padding: '18px 28px',
          background: 'rgba(255,254,252,0.85)',
          borderRadius: 14, display: 'flex', gap: 20, alignItems: 'center',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 2px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(42,31,26,0.08)',
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: `rgb(${sel.rgb.r},${sel.rgb.g},${sel.rgb.b})`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#2a1f1a', letterSpacing: '0.04em' }}>
              {sel.label}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(42,31,26,0.45)', letterSpacing: '0.07em', fontFamily: 'monospace' }}>
              L {sel.lab.L} · a {sel.lab.a} · b {sel.lab.b}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(42,31,26,0.35)', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
              rgb({sel.rgb.r}, {sel.rgb.g}, {sel.rgb.b}) · {sel.file}
            </span>
          </div>
        </div>
      )}

    </main>
  )
}
