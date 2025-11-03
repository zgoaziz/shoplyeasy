import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getContacts, createContact, createNotification } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const contacts = await getContacts()
    return NextResponse.json({ contacts })
  } catch (error: any) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const contactData = await req.json()
    const contactId = await createContact(contactData)

    // Créer une notification pour le nouveau message de contact
    try {
      await createNotification({
        type: 'contact',
        title: 'Nouveau message de contact',
        message: `Message reçu de ${contactData.name || 'Anonyme'}${contactData.subject ? ` : ${contactData.subject}` : ''}`,
        link: `/dashboard/contact`,
      })
    } catch (error) {
      // Ne pas bloquer le message si la notification échoue
      console.error('Error creating notification:', error)
    }

    return NextResponse.json({
      success: true,
      contactId,
    })
  } catch (error: any) {
    console.error('Create contact error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du contact' },
      { status: 500 }
    )
  }
}

