/**
 * WaterMaterial — singleton assets shared across every WaterButton instance.
 *
 * Material, sphere geometry and circle geometry are created ONCE and reused.
 * Passing them via the `geometry` / `material` props on <mesh> prevents R3F
 * from disposing them when any individual button unmounts.
 */

import * as THREE from 'three'

let _mat: THREE.MeshPhysicalMaterial | null = null
let _sphereGeo: THREE.SphereGeometry | null = null
let _circleGeo: THREE.CircleGeometry | null = null

/** Colorless, fully-transmissive water material. Never changes. */
export function getWaterMaterial(): THREE.MeshPhysicalMaterial {
  if (!_mat) {
    _mat = new THREE.MeshPhysicalMaterial({
      // Transmission — solid water sphere (not a thin shell)
      transmission: 1,
      ior: 1.34,
      thickness: 1.0,
      roughness: 0.02,
      metalness: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.25,  // blurs env reflections → soft premium sheen, no readable content
      color: new THREE.Color(1, 1, 1),
      envMapIntensity: 2.0,
      side: THREE.FrontSide,
    })
    ;(_mat as any).attenuationDistance = Infinity
  }
  return _mat
}

/** High-res sphere — shared across all instances */
export function getWaterSphereGeo(): THREE.SphereGeometry {
  if (!_sphereGeo) _sphereGeo = new THREE.SphereGeometry(1, 128, 128)
  return _sphereGeo
}

/** Lipstick disc — shared geometry, per-instance material (texture) */
export function getLipstickCircleGeo(): THREE.CircleGeometry {
  if (!_circleGeo) _circleGeo = new THREE.CircleGeometry(0.78, 96)
  return _circleGeo
}
