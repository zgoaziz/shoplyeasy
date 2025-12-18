import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getAdvertisements, createAdvertisement } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const isPublic = req.nextUrl.searchParams.get('public') === 'true'
    
    if (isPublic) {
      // Route publique pour récupérer les publicités actives
      const { getActiveAdvertisements } = await import('@/lib/models')
      const advertisements = await getActiveAdvertisements()
      return NextResponse.json({ advertisements })
    }

    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const advertisements = await getAdvertisements()

    return NextResponse.json({ advertisements })
  } catch (error: any) {
    console.error('Get advertisements error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des publicités' },
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
    const advertisementId = await createAdvertisement(data)

    return NextResponse.json({
      success: true,
      advertisementId: advertisementId.toString(),
    })
  } catch (error: any) {
    console.error('Create advertisement error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la publicité' },
      { status: 500 }
    )
  }
}

