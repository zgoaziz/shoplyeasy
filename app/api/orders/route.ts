import { NextRequest, NextResponse } from 'next/server'
import { getOrders, createOrder, createNotification } from '@/lib/models'
import { verifyToken } from '@/lib/auth-edge'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Seuls les admins peuvent voir toutes les commandes
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const orders = await getOrders()
    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { name, email, phone, address, items, total, userId } = data

    if (!name || !phone || !address || !items || !total) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const orderId = await createOrder({
      userId,
      name,
      email,
      phone,
      address,
      items,
      total,
      status: 'pending',
      paymentMethod: 'Sur place',
    })

    // Créer une notification pour la nouvelle commande
    try {
      await createNotification({
        type: 'order',
        title: 'Nouvelle commande',
        message: `Nouvelle commande de ${name} pour un montant de ${total.toFixed(2)}dt`,
        link: `/dashboard/commandes`,
      })
    } catch (error) {
      // Ne pas bloquer la commande si la notification échoue
      console.error('Error creating notification:', error)
    }

    return NextResponse.json({ success: true, orderId: orderId.toString() })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

