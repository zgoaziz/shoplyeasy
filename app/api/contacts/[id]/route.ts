import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { updateContact, deleteContact } from '@/lib/models'

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

    const contactData = await req.json()
    await updateContact(params.id, contactData)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update contact error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du contact' },
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

    await deleteContact(params.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete contact error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du contact' },
      { status: 500 }
    )
  }
}

