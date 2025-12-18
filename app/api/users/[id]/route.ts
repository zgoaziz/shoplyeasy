import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const client = await clientPromise
    const db = client.db('shoplyeasy')
    const user = await db.collection('users').findOne({ _id: new ObjectId(params.id) })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const { password, ...userWithoutPassword } = user

    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        _id: user._id.toString(),
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const updateData = await req.json()
    const { password, currentPassword, ...otherData } = updateData

    const client = await clientPromise
    const db = client.db('shoplyeasy')

    // Si un nouveau mot de passe est fourni, vérifier le mot de passe actuel
    if (password) {
      // Récupérer l'utilisateur pour vérifier le mot de passe actuel
      const user = await db.collection('users').findOne({ _id: new ObjectId(params.id) })
      
      if (!user) {
        return NextResponse.json(
          { error: 'Utilisateur non trouvé' },
          { status: 404 }
        )
      }

      // Vérifier le mot de passe actuel si fourni
      if (currentPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordValid) {
          return NextResponse.json(
            { error: 'Mot de passe actuel incorrect' },
            { status: 400 }
          )
        }
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Le mot de passe doit contenir au moins 6 caractères' },
          { status: 400 }
        )
      }
    }

    const updateFields: any = {
      ...otherData,
      updatedAt: new Date(),
    }

    // Si un nouveau mot de passe est fourni, le hasher
    if (password) {
      updateFields.password = await bcrypt.hash(password, 10)
    }

    await db.collection('users').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateFields }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req)
    
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    // Empêcher la suppression de soi-même
    if (authUser.userId === params.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas supprimer votre propre compte' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('shoplyeasy')
    await db.collection('users').deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}

