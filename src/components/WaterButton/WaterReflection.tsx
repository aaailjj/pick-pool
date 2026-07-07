'use client'

import { Environment } from '@react-three/drei'

export function WaterReflection() {
  return (
    <Environment
      preset="apartment"
      // @ts-ignore
      environmentIntensity={0.5}
    />
  )
}
