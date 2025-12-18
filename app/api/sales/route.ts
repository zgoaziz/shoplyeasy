import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getSales, createSale } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const sales = await getSales()
    return NextResponse.json({ sales })
  } catch (error: any) {
    console.error('Get sales error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ventes' },
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

    const saleData = await req.json()
    const saleId = await createSale(saleData)

    return NextResponse.json({
      success: true,
      saleId,
    })
  } catch (error: any) {
    console.error('Create sale error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la vente' },
      { status: 500 }
    )
  }
}

