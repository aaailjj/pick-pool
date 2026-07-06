// src/app/api/discoveries/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)
  const traveller_id = searchParams.get('traveller_id')
  const limit = parseInt(searchParams.get('limit') || '30')

  let query = supabase
    .from('discoveries')
    .select('*, traveller:travellers(id, nickname, avatar_color)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (traveller_id) query = query.eq('traveller_id', traveller_id)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { traveller_id, product_name, brand, category, notes, pick_list_id } = body

  if (!product_name?.trim()) {
    return NextResponse.json({ error: 'product_name is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('discoveries')
    .insert({ traveller_id, product_name: product_name.trim(), brand, category, notes, pick_list_id })
    .select('*, traveller:travellers(id, nickname, avatar_color)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
