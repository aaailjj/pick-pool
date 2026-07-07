'use client'

/**
 * LipstickLayer — a flat PNG plane suspended inside the water sphere.
 *
 * This is NOT projected onto the sphere. It is simply a flat plane that sits
 * inside the sphere volume. The transparent sphere renders on top of it.
 * Because thickness=0.2 (thin glass), the sphere barely distorts the plane —
 * it reads as a real object inside, not a texture on the surface.
 *
 * alphaTest keeps it in the OPAQUE render pass so Three.js captures it in
 * the transmission buffer → visible through the glass.
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

  // Disable raycasting — sphere handles all pointer events
  useEffect(() => {
    if (meshRef.current) meshRef.current.raycast = () => {}
  }, [])

  return (
    <mesh
      ref={meshRef}
      geometry={geo}
      rotation={[0.1, 0.08, 0.04]}
    >
      <meshBasicMaterial
        map={texture}
        alphaTest={0.5}
        side={THREE.FrontSide}
        depthWrite={true}
        toneMapped={false}
      />
    </mesh>
  )
}
