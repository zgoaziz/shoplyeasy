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

    const ext = path.extname(file.name) || '.png'
    const filename = `${Date.now()}-${randomUUID()}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    await fs.mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, filename)
    await fs.writeFile(filePath, buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ success: true, url })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Erreur serveur upload' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
