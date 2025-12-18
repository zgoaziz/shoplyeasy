import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { updateSale, deleteSale } from '@/lib/models'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const saleData = await req.json()
    await updateSale(params.id, saleData)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update sale error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la vente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    await deleteSale(params.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete sale error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la vente' },
      { status: 500 }
    )
  }
}

