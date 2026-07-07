'use client'

/**
 * WaterLighting — Round 2: RectAreaLight softbox setup.
 *
 * On roughness=0 (mirror), RectAreaLight reflects as a rectangle shape
 * — like a real studio softbox — instead of a perfect circle dot.
 * Three.js 0.185+ handles LTC initialisation automatically.
 */

export function WaterLighting() {
  return (
    <>
      {/* Main softbox — large upper-left rectangle, primary soft highlight */}
      <rectAreaLight
        position={[-1.5, 2.5, 2.5]}
        rotation={[-0.65, 0.45, 0]}
        width={5}
        height={4}
        intensity={4}
        color="#fffaf5"
      />

      {/* Secondary fill — smaller upper-right, secondary highlight */}
      <rectAreaLight
        position={[2, 1.5, 2]}
        rotation={[-0.5, -0.55, 0]}
        width={1.5}
        height={1}
        intensity={1.5}
        color="#ffffff"
      />

      <ambientLight intensity={0.1} color="#fff8f4" />
    </>
  )
}
