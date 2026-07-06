// src/app/pool/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PoolClient from './PoolClient'

export default async function PoolPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // Fetch or create traveller profile
  let { data: traveller } = await supabase
    .from('travellers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!traveller) {
    // First time — redirect to onboarding
    redirect('/onboard')
  }

  return <PoolClient initialTraveller={traveller} />
}
