import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import path from 'path'
import { promises as fs } from 'fs'
import { v2 as cloudinary } from 'cloudinary'

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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
      // Utiliser Cloudinary SDK pour l'upload
      const ext = path.extname(file.name) || '.png'
      const filename = `${Date.now()}-${randomUUID()}${ext}`
      
      // Sauvegarder temporairement dans /tmp pour Cloudinary
      const tmpPath = path.join('/tmp', filename)
      await fs.writeFile(tmpPath, buffer)

      try {
        // Upload vers Cloudinary avec le SDK
        const result = await cloudinary.uploader.upload(tmpPath, {
          folder: 'shoplyeasy_uploads',
          resource_type: file.type.startsWith('video/') ? 'video' : 'image',
          public_id: `${Date.now()}-${randomUUID()}`,
        })

        // Nettoyer le fichier temporaire
        try {
          await fs.unlink(tmpPath)
        } catch (e) {
          // Ignorer les erreurs de nettoyage
        }

        return NextResponse.json({ success: true, url: result.secure_url })
      } catch (cloudinaryError: any) {
        // Nettoyer le fichier temporaire en cas d'erreur
        try {
          await fs.unlink(tmpPath)
        } catch (e) {
          // Ignorer les erreurs de nettoyage
        }
        throw new Error(`Cloudinary upload failed: ${cloudinaryError.message}`)
      }
    }

    // Fallback: utiliser public/uploads en développement local uniquement
    if (process.env.NODE_ENV === 'development') {
      const ext = path.extname(file.name) || '.png'
      const filename = `${Date.now()}-${randomUUID()}${ext}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      await fs.mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, filename)
      await fs.writeFile(filePath, buffer)
      return NextResponse.json({ success: true, url: `/uploads/${filename}` })
    }

    // En production sans Cloudinary, retourner une erreur
    throw new Error('Cloudinary doit être configuré pour les uploads en production. Veuillez définir CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET dans les variables d\'environnement Vercel.')
  } catch (err: any) {
    console.error('Upload error:', err)
    return NextResponse.json({ success: false, error: err?.message || 'Erreur serveur upload' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
