import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getBrands, createBrand } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const brands = await getBrands()
    return NextResponse.json({ brands })
  } catch (error: any) {
    console.error('Get brands error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des marques' },
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

    const brandData = await req.json()
    const brandId = await createBrand(brandData)

    return NextResponse.json({
      success: true,
      brandId,
    })
  } catch (error: any) {
    console.error('Create brand error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la marque' },
      { status: 500 }
    )
  }
}

