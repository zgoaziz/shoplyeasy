import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getUserByEmail } from '@/lib/models'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await getUserByEmail(authUser.email)
    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

        const userRole = user.role || 'user'
        console.log('Auth me - User role:', userRole, 'Email:', user.email) // Debug
        
        return NextResponse.json({
          user: {
            id: user._id?.toString() || (user._id as any)?.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: userRole,
          },
        })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
}

