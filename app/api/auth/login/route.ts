import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/models'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe sont requis' },
        { status: 400 }
      )
    }

    // Trouver l'utilisateur
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // S'assurer que le rôle est défini
    const userRole = user.role || 'user'
    
    console.log('Login attempt - Email:', email, 'Role:', userRole) // Debug

    // Générer le token avec le rôle
    const token = generateToken({
      userId: user._id?.toString() || (user._id as any)?.toString(),
      email: user.email,
      role: userRole,
    })

    // Définir le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id?.toString() || (user._id as any)?.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: userRole,
      },
      token,
    })
    
    setAuthCookie(response, token)
    console.log('Login success - User role:', userRole, 'Token created:', token.substring(0, 20) + '...') // Debug
    
    // Vérifier que le cookie est bien défini
    const cookieValue = response.cookies.get('token')?.value
    console.log('Cookie set in response:', cookieValue ? 'Yes' : 'No', 'Length:', cookieValue?.length)
    
    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}
