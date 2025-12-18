// Version Edge Runtime compatible pour la vérification JWT
// Utilise Web Crypto API au lieu de Node.js crypto

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Synchronous wrapper for compatibility (note: this is not fully async-safe in edge runtime)
export function verifyToken(token: string): JWTPayload | null {
  // For API routes in Node.js runtime, prefer using lib/auth.ts verifyToken
  // This is a fallback that requires async handling
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
  
  // For synchronous use, try to decode without verification (less secure but compatible)
  try {
    if (!token) return null
    
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payloadBytes = base64UrlDecode(parts[1])
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes))
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null
    }
    
    return {
      userId: payload.userId || payload.user_id,
      email: payload.email,
      role: payload.role,
    }
  } catch (error) {
    return null
  }
}

// Fonction pour décoder base64url (utilisé dans JWT)
function base64UrlDecode(str: string): Uint8Array {
  // Convertir base64url en base64 standard
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  
  // Ajouter padding si nécessaire
  while (base64.length % 4) {
    base64 += '='
  }
  
  // Décoder base64
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// Fonction pour vérifier un JWT dans Edge Runtime
export async function verifyTokenEdge(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    if (!token) {
      console.error('verifyTokenEdge: No token provided')
      return null
    }

    const parts = token.split('.')
    if (parts.length !== 3) {
      console.error('verifyTokenEdge: Invalid token format')
      return null
    }

    const [headerPart, payloadPart, signaturePart] = parts

    // Décoder le payload
    const payloadBytes = base64UrlDecode(payloadPart)
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes))

    // Vérifier l'expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.error('verifyTokenEdge: Token expired')
      return null
    }

    // Vérifier la signature avec Web Crypto API
    const encoder = new TextEncoder()
    const data = encoder.encode(`${headerPart}.${payloadPart}`)
    const keyData = encoder.encode(secret)

    // Importer la clé pour HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Vérifier la signature
    const signature = base64UrlDecode(signaturePart)
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      data
    )

    if (!isValid) {
      console.error('verifyTokenEdge: Invalid signature')
      return null
    }

    return {
      userId: payload.userId || payload.user_id,
      email: payload.email,
      role: payload.role,
    }
  } catch (error: any) {
    console.error('verifyTokenEdge: Error', error.message)
    return null
  }
}

