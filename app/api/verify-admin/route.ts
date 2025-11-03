import { NextResponse } from 'next/server'
import { getUserByEmail } from '@/lib/models'

// Route pour vérifier si un compte admin existe
export async function GET() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shoplyeasy.com'
    const admin = await getUserByEmail(adminEmail)
    
    if (!admin) {
      return NextResponse.json({
        exists: false,
        message: 'Aucun compte admin trouvé',
        email: adminEmail,
      })
    }

    return NextResponse.json({
      exists: true,
      email: admin.email,
      role: admin.role,
      name: admin.name,
      isAdmin: admin.role === 'admin',
    })
  } catch (error: any) {
    console.error('Verify admin error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}

