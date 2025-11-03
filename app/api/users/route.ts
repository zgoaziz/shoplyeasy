import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { getUsers, createUser, getUserByEmail } from '@/lib/models'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const users = await getUsers()
    
    console.log('Users fetched:', users.length) // Debug
    
    // Ne pas retourner les mots de passe (les ObjectId sont déjà convertis dans getUsers)
    const usersWithoutPassword = users.map((user: any) => {
      const { password, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        _id: userWithoutPassword._id?.toString() || userWithoutPassword._id,
      }
    })

    console.log('Users without password:', usersWithoutPassword.length) // Debug

    return NextResponse.json({ users: usersWithoutPassword })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
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

    const { name, email, phone, password, role } = await req.json()

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

    // Créer l'utilisateur
    const userId = await createUser({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'user', // Par défaut user, mais admin peut définir le rôle
    })

    return NextResponse.json({
      success: true,
      userId: userId.toString(),
    })
  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}
