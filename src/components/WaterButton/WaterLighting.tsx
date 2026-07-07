'use client'

export function WaterLighting() {
  return (
    <>
      {/* Warm overhead key — main specular dot on sphere */}
      <directionalLight position={[1, 4, 3]} intensity={2.0} color="#fff9f4" />
      {/* Soft front fill — ensures lipstick colour reads clearly */}
      <directionalLight position={[0, 0, 4]} intensity={0.6} color="#ffffff" />
      {/* Dim ambient */}
      <ambientLight intensity={0.15} />
    </>
  )
}
