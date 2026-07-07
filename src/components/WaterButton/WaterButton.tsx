'use client'

/**
 * WaterButton — PickPool official water droplet colour button.
 *
 * Layer structure (matches reference spec):
 *   1. Water Body   — colorless MeshPhysicalMaterial, IOR 1.33
 *   2. Lipstick     — real texture disc, opaque pass → visible via refraction
 *   3. Highlight    — from clearcoat + environment reflections
 *   4. Shadow       — soft warm contact shadow
 *   + Caustic glow  — synthetic starburst plane simulating focused light
 *
 * Only `texture` changes between instances.
 * All water assets (material, geometry, lights, env) are shared singletons.
 */

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

import { getWaterMaterial, getWaterSphereGeo } from './WaterMaterial'
import { WaterLighting }    from './WaterLighting'
import { WaterReflection }  from './WaterReflection'
import { LipstickLayer }    from './LipstickLayer'
import { WaterShadow }      from './Shadow'
import type { WaterButtonProps } from './types'

// ── Statics ────────────────────────────────────────────────────────────────
const _sv = new THREE.Vector3()

/**
 * Caustic glow texture — bright starburst matching the reference.
 * Higher resolution + denser rays + stronger central bloom.
 */
let _causticTex: THREE.CanvasTexture | null = null
function getCausticTexture(): THREE.CanvasTexture {
  if (_causticTex) return _causticTex
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = S
  const ctx = canvas.getContext('2d')!
  const cx = S / 2, cy = S / 2, R = S / 2

  // Central bloom — bright warm white
  const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.35)
  bloom.addColorStop(0,   'rgba(255,255,248,1.0)')
  bloom.addColorStop(0.5, 'rgba(255,253,238,0.6)')
  bloom.addColorStop(1,   'rgba(255,250,225,0)')
  ctx.fillStyle = bloom
  ctx.fillRect(0, 0, S, S)

  // Outer radial fade
  const outer = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R)
  outer.addColorStop(0,   'rgba(255,252,230,0.35)')
  outer.addColorStop(0.6, 'rgba(255,250,218,0.12)')
  outer.addColorStop(1,   'rgba(255,248,210,0)')
  ctx.fillStyle = outer
  ctx.fillRect(0, 0, S, S)

  // Starburst rays — 16 rays matching the reference pattern
  ctx.save()
  ctx.translate(cx, cy)
  const totalRays = 16
  for (let i = 0; i < totalRays; i++) {
    const angle = (i * Math.PI * 2) / totalRays
    const isPrimary = i % 4 === 0
    const isSecondary = i % 2 === 0 && !isPrimary
    const alpha = isPrimary ? 0.75 : isSecondary ? 0.45 : 0.22
    const width = isPrimary ? 3.5 : isSecondary ? 2 : 1.2
    const reach = isPrimary ? R - 4 : isSecondary ? R * 0.88 : R * 0.75

    ctx.save()
    ctx.rotate(angle)
    const rg = ctx.createLinearGradient(8, 0, reach, 0)
    rg.addColorStop(0,   `rgba(255,255,242,${alpha})`)
    rg.addColorStop(0.6, `rgba(255,252,235,${alpha * 0.5})`)
    rg.addColorStop(1,   'rgba(255,250,230,0)')
    ctx.strokeStyle = rg
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(8, 0)
    ctx.lineTo(reach, 0)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()

  _causticTex = new THREE.CanvasTexture(canvas)
  return _causticTex
}

// ── Inner scene (inside Canvas) ────────────────────────────────────────────

interface SceneProps {
  texture: THREE.Texture
  onClick?: () => void
  onHoverChange?: (h: boolean) => void
}

function WaterScene({ texture, onClick, onHoverChange }: SceneProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef   = useRef<THREE.Group>(null)
  const mat        = useMemo(() => getWaterMaterial(), [])
  const sphereGeo  = useMemo(() => getWaterSphereGeo(), [])
  const causticTex = useMemo(() => getCausticTexture(), [])

  // Hover scale
  useFrame((_, dt) => {
    if (!groupRef.current) return
    _sv.setScalar(hovered ? 1.05 : 1.0)
    groupRef.current.scale.lerp(_sv, Math.min(1, dt * 6))
  })

  const over  = (e: { stopPropagation(): void }) => { e.stopPropagation(); setHovered(true);  onHoverChange?.(true)  }
  const out   = ()                               => {                       setHovered(false); onHoverChange?.(false) }
  const click = (e: { stopPropagation(): void }) => { e.stopPropagation(); onClick?.() }

  return (
    <group ref={groupRef}>

      {/* Layer 1 — Lipstick: pushed back in z so it sits deep inside the
          sphere volume. The glass then refracts the disc slightly at edges,
          creating optical depth without fisheye distortion. */}
      <group position={[0, 0, -0.18]}>
        <LipstickLayer texture={texture} />
      </group>

      {/* Layer 2 — Water sphere (colorless physical transmission) */}
      <mesh
        geometry={sphereGeo}
        material={mat}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
      />

      {/* Layer 3 — Highlight from clearcoat + env (WaterMaterial) */}

      {/* Layer 4 — Contact shadow */}
      <WaterShadow />

      {/* Layer 5 — Natural caustic: subtle warm glow below sphere.
          AdditiveBlending on cream surface = very gentle brightening,
          not a graphic effect. */}
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.5, 3.5]} />
        <meshBasicMaterial
          map={causticTex}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

    </group>
  )
}

// ── Texture loader wrapper (handles string URL) ────────────────────────────

interface LoaderProps {
  textureUrl: string
  onClick?: () => void
  onHoverChange?: (h: boolean) => void
}

function TextureLoader({ textureUrl, ...rest }: LoaderProps) {
  const raw = useTexture(textureUrl)

  useEffect(() => {
    raw.colorSpace  = THREE.SRGBColorSpace
    raw.wrapS       = raw.wrapT = THREE.ClampToEdgeWrapping
    raw.repeat.set(0.72, 0.72)
    raw.offset.set(0.14, 0.14)
    raw.needsUpdate = true
  }, [raw])

  return <WaterScene texture={raw} {...rest} />
}

// ── Direct texture wrapper (handles THREE.Texture prop) ───────────────────

function DirectTexture({ texture, ...rest }: SceneProps) {
  return <WaterScene texture={texture} {...rest} />
}

// ── Public component ───────────────────────────────────────────────────────

export function WaterButton({
  texture,
  size = 220,
  onClick,
  className,
  style,
}: WaterButtonProps) {
  const [hovered, setHovered] = useState(false)

  // zoom scales proportionally so the sphere always fills ~80 % of the canvas
  const zoom = size * 0.4

  const isUrl = typeof texture === 'string'

  return (
    <div
      className={className}
      style={{ width: size, height: size, cursor: hovered ? 'pointer' : 'default', ...style }}
    >
      <Canvas
        style={{ background: 'transparent' }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        orthographic
        camera={{ zoom, position: [0, 0, 10], near: 0.01, far: 50 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          {/*
           * Scene background — warm cream matching the PickPool reference surface.
           * This is what the transmission buffer captures in empty areas, giving
           * the glass sphere its silvery-cream appearance.
           */}
          <color attach="background" args={['#ede8e0']} />

          <WaterLighting />
          <WaterReflection />

          {isUrl ? (
            <TextureLoader
              textureUrl={texture as string}
              onClick={onClick}
              onHoverChange={setHovered}
            />
          ) : (
            <DirectTexture
              texture={texture as THREE.Texture}
              onClick={onClick}
              onHoverChange={setHovered}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
