import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    if (!token) {
      console.error('verifyToken: No token provided')
      return null
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    console.log('verifyToken: Token verified successfully', { userId: decoded.userId, email: decoded.email, role: decoded.role })
    return decoded
  } catch (error: any) {
    console.error('verifyToken: Token verification failed', { 
      error: error.message, 
      tokenLength: token?.length,
      secretLength: JWT_SECRET.length 
    })
    return null
  }
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return null
  }

  return verifyToken(token)
}

export function setAuthCookie(response: NextResponse, token: string) {
  // Créer un nouveau cookie avec toutes les options nécessaires
  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  
  console.log('Cookie set with token length:', token.length) // Debug
  console.log('Cookie options:', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export function removeAuthCookie(response: NextResponse) {
  response.cookies.delete('token')
}
