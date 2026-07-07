'use client'

/**
 * WaterButton Gallery
 *
 * Single WebGL context architecture:
 *   <GalleryCanvas />  ← ONE Canvas, ONE WebGL context, position: fixed overlay
 *   <WaterButtonView>  ← each button is a View portal in that shared Canvas
 *
 * All 99 buttons share the same renderer. No per-button WebGL context.
 * Only the current page's 18 buttons have active Views — off-page items
 * are not mounted so they consume no GPU resources.
 */

import { useState } from 'react'
import dynamic from 'next/dynamic'
import paletteRaw from '../../../public/textures/lipstick/palette.json'

// GalleryCanvas must be SSR-disabled — it creates a WebGL context
const GalleryCanvas = dynamic(
  () => import('@/components/WaterButton/GalleryCanvas').then(m => ({ default: m.GalleryCanvas })),
  { ssr: false }
)

const WaterButtonView = dynamic(
  () => import('@/components/WaterButton/WaterButtonView').then(m => ({ default: m.WaterButtonView })),
  { ssr: false }
)

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
}

const PAGE_SIZE = 18
const items: Entry[] = (paletteRaw as Entry[]).map(p => ({
  ...p,
  label: LABEL_MAP[p.file] ?? p.label,
}))
const TOTAL_PAGES = Math.ceil(items.length / PAGE_SIZE)
const SIZE = 150

export default function GalleryPage() {
  const [page, setPage]         = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const sel = items.find(i => i.file === selected)

  const goto = (p: number) => {
    setPage(p)
    setSelected(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* ONE WebGL context for all WaterButtonViews on this page */}
      <GalleryCanvas />

      <main style={{
        minHeight: '100vh',
        background: '#ede8e0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '52px 24px 100px',
        position: 'relative',
        // No z-index needed — Canvas (z:100) overlays on top, pointer-events:none
        // lets clicks fall through to DOM elements here
      }}>

        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 48 }}>
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
            {items.length} colors · sorted by LAB hue · single WebGL context
          </p>
        </header>

        {/* Grid — current page */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '16px 10px', maxWidth: 1160,
        }}>
          {pageItems.map(item => (
            <div
              key={item.file}
              onClick={() => setSelected(item.file === selected ? null : item.file)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 7, cursor: 'pointer',
              }}
            >
              <div style={{
                borderRadius: '50%',
                boxShadow: selected === item.file
                  ? '0 0 0 2px rgba(42,31,26,0.5)'
                  : '0 0 0 2px transparent',
                transition: 'box-shadow 0.2s',
              }}>
                <WaterButtonView textureUrl={item.url} size={SIZE} />
              </div>

              <span style={{
                fontSize: 9, letterSpacing: '0.09em', textTransform: 'uppercase',
                color: selected === item.file
                  ? 'rgba(42,31,26,0.75)' : 'rgba(42,31,26,0.38)',
                transition: 'color 0.2s', textAlign: 'center', maxWidth: 100,
              }}>
                {item.label}
              </span>

              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: `rgb(${item.rgb.r},${item.rgb.g},${item.rgb.b})`,
                opacity: 0.65,
              }} />
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 52 }}>
          <button
            onClick={() => goto(page - 1)}
            disabled={page === 0}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: page === 0 ? 'rgba(42,31,26,0.08)' : 'rgba(42,31,26,0.14)',
              color: page === 0 ? 'rgba(42,31,26,0.28)' : '#2a1f1a',
              cursor: page === 0 ? 'default' : 'pointer',
              fontSize: 11, letterSpacing: '0.1em',
            }}
          >
            ← PREV
          </button>

          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none',
                background: i === page ? '#2a1f1a' : 'rgba(42,31,26,0.1)',
                color: i === page ? '#ede8e0' : 'rgba(42,31,26,0.5)',
                cursor: 'pointer', fontSize: 11,
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goto(page + 1)}
            disabled={page === TOTAL_PAGES - 1}
            style={{
              padding: '8px 18px', borderRadius: 8, border: 'none',
              background: page === TOTAL_PAGES - 1
                ? 'rgba(42,31,26,0.08)' : 'rgba(42,31,26,0.14)',
              color: page === TOTAL_PAGES - 1
                ? 'rgba(42,31,26,0.28)' : '#2a1f1a',
              cursor: page === TOTAL_PAGES - 1 ? 'default' : 'pointer',
              fontSize: 11, letterSpacing: '0.1em',
            }}
          >
            NEXT →
          </button>
        </div>

        <p style={{
          marginTop: 12, fontSize: 10,
          color: 'rgba(42,31,26,0.3)', letterSpacing: '0.1em',
        }}>
          Page {page + 1} / {TOTAL_PAGES} · {pageItems.length} of {items.length} colors
        </p>

        {/* Selected color detail */}
        {sel && (
          <div style={{
            position: 'sticky', bottom: 20, marginTop: 32,
            padding: '16px 24px',
            background: 'rgba(255,254,252,0.9)',
            borderRadius: 12, display: 'flex', gap: 16, alignItems: 'center',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 2px 24px rgba(0,0,0,0.08)',
            border: '1px solid rgba(42,31,26,0.07)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: `rgb(${sel.rgb.r},${sel.rgb.g},${sel.rgb.b})`,
              boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#2a1f1a' }}>
                {sel.label}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(42,31,26,0.4)', fontFamily: 'monospace' }}>
                L {sel.lab.L} · a {sel.lab.a} · b {sel.lab.b}
              </span>
              <span style={{ fontSize: 9, color: 'rgba(42,31,26,0.32)', fontFamily: 'monospace' }}>
                rgb({sel.rgb.r}, {sel.rgb.g}, {sel.rgb.b}) · {sel.file}
              </span>
            </div>
          </div>
        )}

      </main>
    </>
  )
}
