import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-edge'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const client = await clientPromise
    const db = client.db('shoplyeasy')
    const ordersCollection = db.collection('orders')
    const historyCollection = db.collection('orders_history')

    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // 1. Trouver les commandes annulées de plus de 24h et les supprimer
    const cancelledOrders = await ordersCollection.find({
      status: { $in: ['annulee', 'cancelled'] },
      updatedAt: { $lt: twentyFourHoursAgo }
    }).toArray()

    if (cancelledOrders.length > 0) {
      const cancelledIds = cancelledOrders.map(o => new ObjectId(o._id))
      await ordersCollection.deleteMany({ _id: { $in: cancelledIds } })
    }

    // 2. Trouver les commandes terminées de plus de 24h et les déplacer vers l'historique
    const completedOrders = await ordersCollection.find({
      status: { $in: ['terminee', 'completed'] },
      updatedAt: { $lt: twentyFourHoursAgo }
    }).toArray()

    if (completedOrders.length > 0) {
      // Ajouter à l'historique
      await historyCollection.insertMany(completedOrders.map(order => ({
        ...order,
        archivedAt: new Date(),
        originalId: order._id
      })))

      // Supprimer de la collection principale
      const completedIds = completedOrders.map(o => new ObjectId(o._id))
      await ordersCollection.deleteMany({ _id: { $in: completedIds } })
    }

    return NextResponse.json({
      success: true,
      deleted: cancelledOrders.length,
      archived: completedOrders.length
    })
  } catch (error: any) {
    console.error('Error cleaning up orders:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

