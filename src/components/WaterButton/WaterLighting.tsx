'use client'

/**
 * WaterLighting — studio lighting tuned to the PickPool reference.
 *
 * Strong overhead warm key creates the caustic spread at the sphere base.
 * Soft fill preserves lipstick colour readability.
 */

export function WaterLighting() {
  return (
    <>
      {/* Primary overhead key — warm, creates caustic at base */}
      <directionalLight position={[0.5, 6, 2]} intensity={2.8} color="#fff8f0" />

      {/* Secondary overhead fill — opens up the top hemisphere */}
      <directionalLight position={[-1, 4, 3]} intensity={1.0} color="#fffef8" />

      {/* Front soft fill — keeps lipstick luminous without washing it out */}
      <directionalLight position={[0, 0, 5]} intensity={0.4} color="#ffffff" />

      {/* Very dim ambient — prevents pure blacks inside */}
      <ambientLight intensity={0.08} />
    </>
  )
}
