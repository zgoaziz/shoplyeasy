import { NextRequest, NextResponse } from 'next/server'
import { getOrdersByUserId } from '@/lib/models'
import { verifyToken } from '@/lib/auth-edge'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const token = req.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
    }

    // Seuls les admins ou le propriétaire peuvent voir les commandes
    if (payload.role !== 'admin' && payload.userId !== params.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const orders = await getOrdersByUserId(params.userId)
    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error('Error fetching user orders:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

