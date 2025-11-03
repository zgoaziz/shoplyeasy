import { NextRequest, NextResponse } from 'next/server'
import { getOrderById, updateOrder, deleteOrder, getOrdersByUserId } from '@/lib/models'
import { verifyToken } from '@/lib/auth-edge'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const order = await getOrderById(params.id)
    
    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 })
    }

    // Seuls les admins ou le propriétaire peuvent voir la commande
    if (payload.role !== 'admin' && order.userId !== payload.userId) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const data = await req.json()

    // Récupérer l'état actuel pour détecter une transition vers "terminee"
    const previous = await getOrderById(params.id)

    await updateOrder(params.id, data)

    // Si transition vers 'terminee' (et pas déjà terminée), créer une vente et décrémenter le stock
    if (data.status === 'terminee' && previous?.status !== 'terminee') {
      const order = await getOrderById(params.id)
      if (order) {
        const { createSale, getProductById, updateProduct } = await import('@/lib/models')

        // Créer la vente
        await createSale({
          orderId: params.id,
          customerName: order.name,
          customerPhone: order.phone,
          items: order.items,
          total: order.total,
          paymentMethod: order.paymentMethod,
        })

        // Décrémenter le stock des produits (stock global)
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            try {
              const product = await getProductById(item.id)
              if (product && typeof product.stock === 'number') {
                const newStock = Math.max(0, product.stock - (item.quantity || 0))
                await updateProduct(item.id, { stock: newStock })
              }
            } catch (e) {
              // Continuer même si un produit pose problème
              console.error('Stock decrement error for product', item.id, e)
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    await deleteOrder(params.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting order:', error)
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 })
  }
}

