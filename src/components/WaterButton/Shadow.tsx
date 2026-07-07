'use client'

/**
 * Shadow — Round 4: softer, wider shadow for physical grounding.
 *
 * A sphere of water sitting on a surface needs a shadow that communicates
 * real weight and volume. Wider spread + higher blur = premium cosmetic
 * product render feel, not a graphics demo artifact.
 */

import { ContactShadows } from '@react-three/drei'

export function WaterShadow() {
  return (
    <ContactShadows
      position={[0, -1.06, 0]}
      opacity={0.28}
      scale={5}
      blur={4.5}
      far={2.5}
      color="#5a3f2f"
    />
  )
}
