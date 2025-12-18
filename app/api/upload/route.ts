import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import path from 'path'
import { promises as fs } from 'fs'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ success: false, error: 'Aucun fichier' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Vérifier si Cloudinary est configuré
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (cloudName && apiKey && apiSecret) {
      // Utiliser Cloudinary pour l'upload
      const ext = path.extname(file.name) || '.png'
      const filename = `${Date.now()}-${randomUUID()}${ext}`
      
      // Convertir le buffer en base64 data URI pour Cloudinary
      const base64File = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64File}`

      // Upload vers Cloudinary avec signature
      const timestamp = Math.round(new Date().getTime() / 1000)
      const folder = 'shoplyeasy_uploads'
      const publicId = `${folder}/${Date.now()}-${randomUUID()}`

      // Créer la signature pour l'authentification Cloudinary
      const crypto = await import('crypto')
      const signatureString = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

      // Créer FormData pour l'upload Cloudinary
      const cloudinaryFormData = new FormData()
      cloudinaryFormData.append('file', dataUri)
      cloudinaryFormData.append('api_key', apiKey)
      cloudinaryFormData.append('timestamp', timestamp.toString())
      cloudinaryFormData.append('signature', signature)
      cloudinaryFormData.append('folder', folder)
      cloudinaryFormData.append('public_id', publicId)

      const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: cloudinaryFormData,
      })

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        throw new Error(`Cloudinary upload failed: ${errorText}`)
      }

      const cloudinaryData = await uploadResponse.json()
      return NextResponse.json({ success: true, url: cloudinaryData.secure_url })
    }

    // Fallback: utiliser /tmp sur Vercel (lecture seule pour public/uploads)
    const ext = path.extname(file.name) || '.png'
    const filename = `${Date.now()}-${randomUUID()}${ext}`
    
    // Utiliser /tmp qui est accessible en écriture sur Vercel
    const tmpPath = path.join('/tmp', filename)
    await fs.writeFile(tmpPath, buffer)

    // Si on est en développement local, utiliser public/uploads
    // Sinon, retourner une erreur car /tmp n'est pas accessible publiquement
    if (process.env.NODE_ENV === 'development') {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, filename)
      await fs.writeFile(filePath, buffer)
      return NextResponse.json({ success: true, url: `/uploads/${filename}` })
    }

    // En production sans Cloudinary, on ne peut pas servir depuis /tmp
    throw new Error('Cloudinary doit être configuré pour les uploads en production. Veuillez définir CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET.')
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Erreur serveur upload' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
