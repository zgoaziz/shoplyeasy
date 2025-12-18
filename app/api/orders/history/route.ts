import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-edge'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
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
    const historyCollection = db.collection('orders_history')

    const orders = await historyCollection.find({})
      .sort({ archivedAt: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        ...order,
        _id: order._id?.toString(),
      }))
    })
  } catch (error: any) {
    console.error('Error fetching order history:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

