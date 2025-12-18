"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion')
      }

      console.log('Login response:', data) // Debug
      console.log('Cookie should be set by server')

      // Vérifier le rôle et rediriger
      const userRole = data.user?.role || 'user'
      
      // Vérifier que le cookie est disponible avant de rediriger
      const checkCookie = () => {
        const cookies = document.cookie.split(';')
        const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
        console.log('Cookie check:', tokenCookie ? 'Found' : 'Not found')
        return !!tokenCookie
      }
      
      // Attendre que le cookie soit disponible (max 1 seconde)
      let attempts = 0
      while (!checkCookie() && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      // Rediriger selon le rôle de manière explicite
      if (userRole === 'admin') {
        console.log('Redirecting admin to /dashboard') // Debug
        window.location.href = "/dashboard"
      } else {
        console.log('Redirecting user to /menu') // Debug
        window.location.href = "/menu"
      }
    } catch (err: any) {
      setError(err.message || "Email ou mot de passe incorrect")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gradient-to-br from-white to-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-gold/20 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center"
            >
              <LogIn className="h-8 w-8 text-gold" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-navy">Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre compte ShoplyEasy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-navy">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 border-gold/20 focus:border-gold focus:ring-gold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-navy">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10 border-gold/20 focus:border-gold focus:ring-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gold"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 rounded border-gold/20" />
                  <span className="text-gray-600">Se souvenir de moi</span>
                </label>
                <Link href="/forgot-password" className="text-gold hover:text-gold/80">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Connexion..." : "Se connecter"}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Vous n'avez pas de compte ?{" "}
                <Link href="/registre" className="text-gold hover:text-gold/80 font-medium">
                  Créer un compte
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

