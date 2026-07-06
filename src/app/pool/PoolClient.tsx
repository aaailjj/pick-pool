// src/app/pool/PoolClient.tsx
'use client'

import { useEffect } from 'react'
import { usePoolStore } from '@/store/pool-store'
import BeautyPool from '@/components/pool/BeautyPool'
import { Traveller } from '@/types'

export default function PoolClient({ initialTraveller }: { initialTraveller: Traveller }) {
  const { setMyTraveller } = usePoolStore()

  useEffect(() => {
    setMyTraveller(initialTraveller)
  }, [initialTraveller.id])

  return <BeautyPool />
}
