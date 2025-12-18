import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const products = await getProducts()
    // Filtrer seulement les produits actifs pour le public
    const activeProducts = products.filter((p: any) => p.isActive !== false)
    return NextResponse.json({ products: activeProducts })
  } catch (error: any) {
    console.error('Get public products error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

