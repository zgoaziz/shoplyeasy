import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/lib/models'

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const product = await getProductById(id)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      )
    }

    // Filtrer seulement les produits actifs pour le public
    if (product.isActive === false) {
      return NextResponse.json(
        { error: 'Produit non disponible' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    console.error('Get public product error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    )
  }
}

