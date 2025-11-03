import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getProducts, createProduct } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const products = await getProducts()
    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const productData = await req.json()
    const productId = await createProduct(productData)

    return NextResponse.json({
      success: true,
      productId,
    })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}

