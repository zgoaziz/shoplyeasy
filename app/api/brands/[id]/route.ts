import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { updateBrand, deleteBrand } from '@/lib/models'

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

    const brandData = await req.json()
    await updateBrand(params.id, brandData)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update brand error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la marque' },
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

    await deleteBrand(params.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete brand error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la marque' },
      { status: 500 }
    )
  }
}

