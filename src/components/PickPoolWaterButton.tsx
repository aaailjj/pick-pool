'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Float,
  MeshTransmissionMaterial,
  useTexture,
} from '@react-three/drei'
import * as THREE from 'three'

// Reuse a single Vector3 for scale lerp to avoid per-frame allocation
const _target = new THREE.Vector3()

// ─── Inner scene (needs Suspense for useTexture) ─────────────────────────────

interface SphereContentProps {
  textureUrl: string
  onClick?: () => void
  onHoverChange?: (h: boolean) => void
}

function SphereContent({ textureUrl, onClick, onHoverChange }: SphereContentProps) {
  const [hovered, setHovered] = useState(false)
  const [backdropColor, setBackdropColor] = useState('#c06870')
  const groupRef = useRef<THREE.Group>(null)
  const innerPlaneRef = useRef<THREE.Mesh>(null)
  const texture = useTexture(textureUrl)

  // Colour space + UV zoom: portrait swatches have lots of empty space,
  // zooming in (repeat < 1) makes the pigment fill the sphere.
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping
    texture.repeat.set(0.5, 0.5)
    texture.offset.set(0.25, 0.22)
    texture.needsUpdate = true
  }, [texture])

  // Sample dominant lipstick color from the texture for the backdrop sphere
  useEffect(() => {
    const img = texture.image
    if (!img || typeof document === 'undefined') return
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 16; canvas.height = 16
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img as CanvasImageSource, 0, 0, 16, 16)
      const { data } = ctx.getImageData(0, 0, 16, 16)
      let rS = 0, gS = 0, bS = 0, n = 0
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 80) { rS += data[i]; gS += data[i + 1]; bS += data[i + 2]; n++ }
      }
      if (n > 0) setBackdropColor(`rgb(${Math.round(rS/n)},${Math.round(gS/n)},${Math.round(bS/n)})`)
    } catch (_) { /* cross-origin or canvas taint — keep default */ }
  }, [texture])

  // Disable raycasting on the inner plane so only the sphere captures events
  useEffect(() => {
    if (innerPlaneRef.current) {
      innerPlaneRef.current.raycast = () => {}
    }
  }, [])

  // Smooth scale lerp on hover
  useFrame((_, delta) => {
    if (!groupRef.current) return
    _target.setScalar(hovered ? 1.07 : 1.0)
    groupRef.current.scale.lerp(_target, Math.min(1, delta * 5))
  })

  const over = (e: { stopPropagation(): void }) => {
    e.stopPropagation()
    setHovered(true)
    onHoverChange?.(true)
  }
  const out = () => {
    setHovered(false)
    onHoverChange?.(false)
  }
  const click = (e: { stopPropagation(): void }) => {
    e.stopPropagation()
    onClick?.()
  }

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.07} floatIntensity={0.28}>
        <group>
          {/* ── Water sphere shell ────────────────────────────────────── */}
          <mesh onPointerOver={over} onPointerOut={out} onClick={click}>
            <sphereGeometry args={[1, 96, 96]} />
            <MeshTransmissionMaterial
              backside
              backsideThickness={0.1}
              transmission={1}
              thickness={1.2}
              ior={1.32}
              roughness={0.03}
              chromaticAberration={0.04}
              anisotropy={0.1}
              distortion={0.08}
              distortionScale={0.15}
              temporalDistortion={0.04}
              resolution={512}
              samples={10}
              color="#f2f8ff"
              envMapIntensity={0.8}
              attenuationDistance={4}
              attenuationColor="#f5eeff"
            />
          </mesh>

          {/* ── Tinted backdrop — fills transparent texture gaps ─────── */}
          <mesh>
            <sphereGeometry args={[0.85, 32, 32]} />
            <meshBasicMaterial color={backdropColor} transparent opacity={0.5} depthWrite={false} />
          </mesh>

          {/* ── Lipstick texture plane inside — raycasting disabled ───── */}
          <mesh ref={innerPlaneRef} rotation={[0.18, 0.15, 0.08]}>
            <circleGeometry args={[0.88, 80]} />
            <meshBasicMaterial
              map={texture}
              transparent
              side={THREE.DoubleSide}
              depthWrite={false}
              opacity={0.72}
            />
          </mesh>

          {/* ── Top-left specular highlight ───────────────────────────── */}
          <mesh position={[-0.38, 0.5, 0.9]}>
            <planeGeometry args={[0.46, 0.24]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.2}
              depthWrite={false}
            />
          </mesh>

          {/* ── Small tight specular dot ──────────────────────────────── */}
          <mesh position={[-0.52, 0.6, 0.82]}>
            <circleGeometry args={[0.07, 12]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.38}
              depthWrite={false}
            />
          </mesh>
        </group>
      </Float>

      {/* Rear rim — lifts the Fresnel edge off pure-black */}
      <pointLight position={[0, 0, -2.5]} intensity={0.6} color="#aabbdd" distance={6} />
      {/* Caustic-like warm glow, bottom-right */}
      <pointLight position={[1.4, -1.0, 0.8]} intensity={0.3} color="#ffb877" distance={4} />
      {/* Soft cool fill, top-left */}
      <pointLight position={[-1.4, 1.3, 2.0]} intensity={0.2} color="#ddeeff" distance={5} />

      {/* Contact shadow */}
      <ContactShadows
        position={[0, -1.12, 0]}
        opacity={0.28}
        scale={3.5}
        blur={2.8}
        far={2.5}
        color="#1a0005"
      />
    </group>
  )
}

// ─── Public component ─────────────────────────────────────────────────────────

export interface PickPoolWaterButtonProps {
  textureUrl: string
  onClick?: () => void
}

export default function PickPoolWaterButton({
  textureUrl,
  onClick,
}: PickPoolWaterButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        width: 220,
        height: 220,
        cursor: hovered ? 'pointer' : 'default',
      }}
    >
      <Canvas
        style={{ background: 'transparent' }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        orthographic
        camera={{ zoom: 88, position: [0, 0, 10], near: 0.01, far: 50 }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.35} />
          <Environment preset="studio" />
          <SphereContent
            textureUrl={textureUrl}
            onClick={onClick}
            onHoverChange={setHovered}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
