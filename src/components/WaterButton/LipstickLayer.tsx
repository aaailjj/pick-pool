'use client'

/**
 * LipstickLayer — Round 3: real cosmetic material.
 *
 * meshBasicMaterial ignores all lighting → flat PNG appearance.
 * meshStandardMaterial responds to the approved RectAreaLight softboxes,
 * creating natural directional shading across the texture surface.
 * This is what makes the lipstick feel like a real 3D smear suspended
 * inside the water rather than a texture printed on glass.
 *
 * roughness=0.80  → matte/powdery cosmetic finish
 * metalness=0     → non-metallic, natural pigment
 * alphaTest keeps the disc in the OPAQUE pass → captured by transmission buffer
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getLipstickCircleGeo } from './WaterMaterial'

interface LipstickLayerProps {
  texture: THREE.Texture
}

export function LipstickLayer({ texture }: LipstickLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geo     = getLipstickCircleGeo()

  useEffect(() => {
    if (meshRef.current) meshRef.current.raycast = () => {}
  }, [])

  return (
    <mesh
      ref={meshRef}
      geometry={geo}
      rotation={[0.1, 0.08, 0.04]}
    >
      <meshStandardMaterial
        map={texture}
        roughness={0.80}
        metalness={0}
        alphaTest={0.5}
        side={THREE.FrontSide}
        depthWrite={true}
      />
    </mesh>
  )
}
