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
      thickness: 0.15,          // thinner edge, less visual weight at rim
      roughness: 0.0,            // perfectly smooth — no cloudiness
      metalness: 0,
      clearcoat: 0.35,
      clearcoatRoughness: 0.08,
      color: new THREE.Color(1, 1, 1),
      envMapIntensity: 0.15,   // just enough warm light at rim, no visible apartment content
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
