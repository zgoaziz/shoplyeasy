import { NextRequest, NextResponse } from 'next/server'
import { getBrands } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const brands = await getBrands()
    return NextResponse.json({ brands })
  } catch (error: any) {
    console.error('Get public brands error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des marques' },
      { status: 500 }
    )
  }
}

