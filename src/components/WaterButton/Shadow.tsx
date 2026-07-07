'use client'

/**
 * Shadow — soft warm contact shadow.
 * Wider and heavier than a thin glass shell to communicate solid water weight.
 */

import { ContactShadows } from '@react-three/drei'

export function WaterShadow() {
  return (
    <ContactShadows
      position={[0, -1.05, 0]}
      opacity={0.35}
      scale={4.5}
      blur={3.5}
      far={2.5}
      color="#5a3f2f"
    />
  )
}
