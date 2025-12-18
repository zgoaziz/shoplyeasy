"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Settings, User, Mail, Phone, Save, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/contexts/translation-context"

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
}

export default function SettingsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        window.location.href = '/login'
        return
      }
      
      const data = await response.json()
      
      if (!data.user || data.user.role !== 'admin') {
        window.location.href = '/menu'
        return
      }
      
      setUser(data.user)
      setFormData({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

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

      setSuccess(t('profileUpdatedSuccessfully'))
      fetchUser()
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError(t('passwordsDoNotMatch'))
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError(t('passwordMinLength'))
      return
    }

    try {
      if (!user) return

      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwordData.newPassword,
          currentPassword: passwordData.currentPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du mot de passe')
      }

      setSuccess(t('passwordUpdatedSuccessfully'))
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2 flex items-center">
            <Settings className="mr-3 h-8 w-8 text-gold" />
            {t('settings')}
          </h1>
          <p className="text-gray-600">{t('manageAccountSettings')}</p>
        </motion.div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Profile Settings */}
        <Card className="border-gold/20 mb-6">
          <CardHeader>
            <CardTitle className="text-navy flex items-center">
              <User className="mr-2 h-5 w-5 text-gold" />
              {t('profileInformation')}
            </CardTitle>
            <CardDescription>
              {t('editPersonalInformation')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <Label htmlFor="name">{t('fullName')}</Label>
                <Input
                  id="name"
                  value={formData.name ?? ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-2 border-gold/20 focus:border-gold"
                />
              </div>
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email ?? ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-2 border-gold/20 focus:border-gold"
                />
              </div>
              <div>
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone ?? ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="mt-2 border-gold/20 focus:border-gold"
                />
              </div>
              <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                <Save className="mr-2 h-4 w-4" />
                {t('saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-navy flex items-center">
              <Lock className="mr-2 h-5 w-5 text-gold" />
              {t('changePassword')}
            </CardTitle>
            <CardDescription>
              {t('updatePassword')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword ?? ""}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="mt-2 border-gold/20 focus:border-gold"
                  placeholder={t('enterCurrentPassword')}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('newPassword')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword ?? ""}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="mt-2 border-gold/20 focus:border-gold"
                  placeholder={t('enterNewPassword')}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword ?? ""}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="mt-2 border-gold/20 focus:border-gold"
                  placeholder={t('confirmNewPassword')}
                />
              </div>
              <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                <Save className="mr-2 h-4 w-4" />
                {t('changePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

