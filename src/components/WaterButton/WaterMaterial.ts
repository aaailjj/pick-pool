/**
 * WaterMaterial — singleton assets shared across every WaterButton instance.
 *
 * KEY INSIGHT: thickness=0.2 (very thin glass, like a soap bubble surface).
 * High thickness (1.0+) makes the glass act as a fisheye lens, distorting
 * and stretching the interior plane. Low thickness = almost zero distortion.
 * The plane inside is visible as a flat, undistorted image through the glass.
 */

import * as THREE from 'three'

let _mat: THREE.MeshPhysicalMaterial | null = null
let _sphereGeo: THREE.SphereGeometry | null = null
let _circleGeo: THREE.CircleGeometry | null = null

export function getWaterMaterial(): THREE.MeshPhysicalMaterial {
  if (!_mat) {
    _mat = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      ior: 1.33,
      thickness: 0.2,          // thin glass → plane inside reads flat, no fisheye
      roughness: 0.02,
      metalness: 0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
      color: new THREE.Color(1, 1, 1),
      envMapIntensity: 0.6,
      side: THREE.FrontSide,
    })
    ;(_mat as any).attenuationDistance = Infinity
  }
  return _mat
}

export function getWaterSphereGeo(): THREE.SphereGeometry {
  if (!_sphereGeo) _sphereGeo = new THREE.SphereGeometry(1, 128, 128)
  return _sphereGeo
}

export function getLipstickCircleGeo(): THREE.CircleGeometry {
  if (!_circleGeo) _circleGeo = new THREE.CircleGeometry(0.78, 96)
  return _circleGeo
}
