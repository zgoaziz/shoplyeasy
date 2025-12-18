import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/models'

// Route pour créer un compte admin par défaut (à appeler une seule fois)
export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json()

    // Protection : nécessite un secret pour éviter la création accidentelle
    if (secret !== process.env.ADMIN_CREATE_SECRET || !process.env.ADMIN_CREATE_SECRET) {
      // Si pas de secret défini, utiliser un secret par défaut (CHANGER EN PRODUCTION)
      const defaultSecret = 'create-admin-default-secret-change-in-production'
      if (secret !== defaultSecret) {
        return NextResponse.json(
          { error: 'Secret invalide' },
          { status: 403 }
        )
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shoplyeasy.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
    const adminName = process.env.ADMIN_NAME || 'Admin ShoplyEasy'
    const adminPhone = process.env.ADMIN_PHONE || '+216 00 000 000'

    // Vérifier si l'admin existe déjà
    const existingAdmin = await getUserByEmail(adminEmail)
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Un compte admin existe déjà avec cet email',
        email: adminEmail,
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Créer l'admin
    const userId = await createUser({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      role: 'admin',
    })

    return NextResponse.json({
      success: true,
      message: 'Compte admin créé avec succès',
      user: {
        id: userId.toString(),
        email: adminEmail,
        name: adminName,
        role: 'admin',
      },
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
    })
  } catch (error: any) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte admin' },
      { status: 500 }
    )
  }
}

