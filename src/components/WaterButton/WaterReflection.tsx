'use client'

import { Environment } from '@react-three/drei'

export function WaterReflection() {
  return (
    /* Very low intensity — provides subtle wrap-around background reflections
       without adding competing bright spots that fight the RectAreaLights */
    <Environment
      preset="apartment"
      // @ts-ignore
      environmentIntensity={0.4}
    />
  )
}
