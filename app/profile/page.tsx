"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Mail, Phone, Calendar, Edit, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserData {
  _id: string
  name: string
  email: string
  phone: string
  role?: string
  createdAt?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        router.push('/login')
        return
      }
      
      const data = await response.json()
      setUser(data.user)
      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError(null)
    try {
      if (!user) return

      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      setIsEditing(false)
      fetchUser()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
    setIsEditing(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2 flex items-center">
                <User className="mr-3 h-8 w-8 text-gold" />
                Mon Profil
              </h1>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-gold hover:bg-gold/90 text-white"
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="text-navy">Informations personnelles</CardTitle>
              <CardDescription>
                Vos informations de compte et de contact
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Nom complet</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 border-gold/20 focus:border-gold"
                  />
                ) : (
                  <div className="mt-2 flex items-center space-x-2 text-gray-700">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-lg">{user.name}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 border-gold/20 focus:border-gold"
                  />
                ) : (
                  <div className="mt-2 flex items-center space-x-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-lg">{user.email}</span>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 border-gold/20 focus:border-gold"
                  />
                ) : (
                  <div className="mt-2 flex items-center space-x-2 text-gray-700">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-lg">{user.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <Label>Rôle</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === 'admin'
                      ? 'bg-gold/10 text-gold'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Date d'inscription</Label>
                <div className="mt-2 flex items-center space-x-2 text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-gold hover:bg-gold/90 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="border-gold text-gold hover:bg-gold/10"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {user.role === 'admin' && (
            <div className="mt-6">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold/10">
                  Accéder au Dashboard
                </Button>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

