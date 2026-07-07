/**
 * PickPoolWaterButton — backward-compatible re-export.
 * New code should import from '@/components/WaterButton' directly.
 */
'use client'

import { WaterButton } from './WaterButton'
import type { WaterButtonProps } from './WaterButton'

export interface PickPoolWaterButtonProps {
  textureUrl: string
  onClick?: () => void
}

export default function PickPoolWaterButton({ textureUrl, onClick }: PickPoolWaterButtonProps) {
  return <WaterButton texture={textureUrl} size={220} onClick={onClick} />
}
