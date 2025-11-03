import { NextRequest, NextResponse } from 'next/server'
import { getCategories } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const categories = await getCategories()
    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error('Get public categories error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}

