import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail, createNotification } from '@/lib/models'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, password } = await req.json()

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer l'utilisateur (toujours avec rôle 'user')
    const userId = await createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'user', // Toujours user pour les inscriptions
    })

    // Créer une notification pour le nouvel utilisateur
    try {
      await createNotification({
        type: 'auth',
        title: 'Nouvel utilisateur inscrit',
        message: `${name} (${email}) vient de s'inscrire sur la plateforme`,
        link: `/dashboard/users`,
      })
    } catch (error) {
      // Ne pas bloquer l'inscription si la notification échoue
      console.error('Error creating notification:', error)
    }

    // Générer le token
    const token = generateToken({
      userId: userId.toString(),
      email,
      role: 'user',
    })

    // Définir le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        name,
        email,
        phone,
      },
      token,
    })
    
    setAuthCookie(response, token)
    return response
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
