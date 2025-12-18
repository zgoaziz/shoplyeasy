import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth-edge'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = request.nextUrl.pathname

  // Routes protégées dashboard (admin seulement)
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log('No token found in cookies - redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    const decoded = await verifyTokenEdge(token, JWT_SECRET)
    console.log('Dashboard access attempt - Token valid:', !!decoded, 'Role:', decoded?.role)
    
    if (!decoded) {
      console.log('Invalid token - redirecting to login')
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
    
    if (decoded.role !== 'admin') {
      console.log('Not admin - redirecting to menu. Role:', decoded.role)
      return NextResponse.redirect(new URL('/menu', request.url))
    }
    
    console.log('Admin access granted to dashboard')
  }

  // Si l'utilisateur est connecté et essaie d'accéder à login/register, rediriger selon le rôle
  if ((pathname === '/login' || pathname === '/registre') && token) {
    const decoded = await verifyTokenEdge(token, JWT_SECRET)
    if (decoded) {
      console.log('Already logged in - redirecting. Role:', decoded.role)
      if (decoded.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/menu', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/registre'],
}

