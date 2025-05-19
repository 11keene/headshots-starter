// File: app/api/packs/[packId]/route.ts
import { NextResponse } from 'next/server'
import { packs } from '@/data/packs'    // or wherever you keep your pack definitions

export async function GET(
  _req: Request,
  { params }: { params: { packId: string } }
) {
  const { packId } = params
  const pack = packs.find((p) => p.slug === packId)
  if (!pack) {
    return NextResponse.json({ error: 'Pack not found' }, { status: 404 })
  }
  return NextResponse.json(pack)
}
