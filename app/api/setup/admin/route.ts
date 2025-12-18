import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/models'

// Route pour créer le compte admin par défaut (à appeler une seule fois au démarrage)
export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shoplyeasy.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
    const adminName = process.env.ADMIN_NAME || 'Admin ShoplyEasy'
    const adminPhone = process.env.ADMIN_PHONE || '+216 00 000 000'

    // Vérifier si l'admin existe déjà
    const existingAdmin = await getUserByEmail(adminEmail)
    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Un compte admin existe déjà',
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
      credentials: {
        email: adminEmail,
        password: adminPassword,
      },
    })
  } catch (error: any) {
    console.error('Setup admin error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la création du compte admin',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

