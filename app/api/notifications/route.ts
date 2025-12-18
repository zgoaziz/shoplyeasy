import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getNotifications, getUnreadNotificationsCount, createNotification, markAllNotificationsAsRead } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const notifications = await getNotifications()
    const unreadCount = await getUnreadNotificationsCount()

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error: any) {
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
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

    const data = await req.json()
    const notificationId = await createNotification(data)

    return NextResponse.json({
      success: true,
      notificationId: notificationId.toString(),
    })
  } catch (error: any) {
    console.error('Create notification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    await markAllNotificationsAsRead()

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Mark all as read error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}

