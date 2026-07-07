'use client'

/**
 * LipstickLayer — the texture disc that floats inside the water sphere.
 *
 * Rules:
 * - Uses the shared circle geometry (never recreated).
 * - Per-instance material holds only the texture map.
 * - alphaTest=0.5: renders in the OPAQUE pass so Three.js includes it in the
 *   transmission render buffer → visible through the glass via physical IOR.
 * - Raycasting disabled: pointer events belong to the sphere, not this disc.
 */

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { getLipstickCircleGeo } from './WaterMaterial'

interface LipstickLayerProps {
  texture: THREE.Texture
}

export function LipstickLayer({ texture }: LipstickLayerProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geo     = getLipstickCircleGeo() // shared singleton

  // Disable raycasting — sphere handles all pointer events
  useEffect(() => {
    if (meshRef.current) meshRef.current.raycast = () => {}
  }, [])

  return (
    <mesh
      ref={meshRef}
      geometry={geo}
      rotation={[0.12, 0.10, 0.05]}
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
