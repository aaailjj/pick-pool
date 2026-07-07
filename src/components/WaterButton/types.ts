import type * as THREE from 'three'
import type { CSSProperties } from 'react'

export interface WaterButtonProps {
  /** Lipstick swatch — URL string or pre-loaded THREE.Texture */
  texture: string | THREE.Texture
  /** Canvas pixel size. Sphere scales proportionally. Default: 220 */
  size?: number
  onClick?: () => void
  className?: string
  style?: CSSProperties
}
