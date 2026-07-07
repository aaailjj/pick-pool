'use client'

/**
 * WaterButtonView — shared-context version of WaterButton.
 *
 * Instead of creating its own Canvas (and its own WebGL context), this
 * component uses drei's <View> to render into a single shared Canvas that
 * lives somewhere higher in the tree (see GalleryCanvas).
 *
 * All singleton assets (material, geometries) from WaterMaterial.ts are
 * reused — same singletons that WaterButton uses.
 *
 * Usage:
 *   1. Place <GalleryCanvas /> somewhere in the page (creates ONE Canvas).
 *   2. Render <WaterButtonView> anywhere — each one claims a scissored
 *      rect in that shared Canvas. Zero extra WebGL contexts.
 */

import { Suspense, useEffect, useRef, useState } from 'react'
import { View, useTexture, OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getWaterMaterial, getWaterSphereGeo } from './WaterMaterial'
import { WaterLighting } from './WaterLighting'
import { WaterReflection } from './WaterReflection'
import { LipstickLayer } from './LipstickLayer'
import { WaterShadow } from './Shadow'

const _sv = new THREE.Vector3()

// ── Inner R3F scene (runs inside the View context) ────────────────────────

function ViewScene({
  textureUrl,
  zoom,
  onHover,
}: {
  textureUrl: string
  zoom: number
  onHover?: (h: boolean) => void
}) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const mat      = getWaterMaterial()
  const geo      = getWaterSphereGeo()
  const texture  = useTexture(textureUrl)

  useEffect(() => {
    texture.colorSpace  = THREE.SRGBColorSpace
    texture.wrapS       = texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(0.72, 0.72)
    texture.offset.set(0.14, 0.14)
    texture.needsUpdate = true
  }, [texture])

  useFrame((_, dt) => {
    if (!groupRef.current) return
    _sv.setScalar(hovered ? 1.05 : 1.0)
    groupRef.current.scale.lerp(_sv, Math.min(1, dt * 6))
  })

  const over  = (e: { stopPropagation(): void }) => { e.stopPropagation(); setHovered(true);  onHover?.(true)  }
  const out   = ()                               => {                       setHovered(false); onHover?.(false) }

  return (
    <>
      <color attach="background" args={['#ede8e0']} />
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={zoom} near={0.01} far={50} />
      <WaterLighting />
      <WaterReflection />

      <group ref={groupRef}>
        <group position={[0, 0, -0.18]}>
          <LipstickLayer texture={texture} />
        </group>

        <mesh
          geometry={geo}
          material={mat}
          onPointerOver={over}
          onPointerOut={out}
        />

        <WaterShadow />
      </group>
    </>
  )
}

// ── Public component ──────────────────────────────────────────────────────

export interface WaterButtonViewProps {
  textureUrl: string
  size?: number
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function WaterButtonView({
  textureUrl,
  size = 220,
  onClick,
  className,
  style,
}: WaterButtonViewProps) {
  const [hovered, setHovered] = useState(false)
  const zoom = size * 0.4

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        cursor: hovered ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* View claims this div's screen rect inside the shared Canvas */}
      <View style={{ width: '100%', height: '100%' }}>
        <Suspense fallback={null}>
          <ViewScene textureUrl={textureUrl} zoom={zoom} onHover={setHovered} />
        </Suspense>
      </View>
    </div>
  )
}
