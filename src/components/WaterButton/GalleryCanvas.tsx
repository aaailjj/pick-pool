'use client'

/**
 * GalleryCanvas — the ONE WebGL context for all WaterButtonViews.
 *
 * Position: fixed overlay (pointer-events: none) over the entire page.
 * Renders <View.Port /> which processes all <View> portals registered by
 * WaterButtonView instances anywhere in the DOM.
 *
 * Place exactly once per page that uses WaterButtonView.
 * All WaterButtonViews on that page share this single renderer.
 */

import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import * as THREE from 'three'

export function GalleryCanvas() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',  // clicks pass through to DOM below
        zIndex: 100,            // canvas on TOP — 3D renders appear above DOM
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        dpr={[1, 2]}
        frameloop="always"
      >
        <View.Port />
      </Canvas>
    </div>
  )
}
