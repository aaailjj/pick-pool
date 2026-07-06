// src/app/api/lightups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { traveller_id, discovery_id } = await req.json()

  const { data, error } = await supabase
    .from('lightups')
    .insert({ traveller_id, discovery_id })
    .select()
    .single()

  if (error?.code === '23505') {
    return NextResponse.json({ error: 'Already lit up' }, { status: 409 })
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { traveller_id, discovery_id } = await req.json()
  const { error } = await supabase
    .from('lightups')
    .delete()
    .eq('traveller_id', traveller_id)
    .eq('discovery_id', discovery_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
