"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Shield, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const createAdmin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/setup/admin', {
        method: 'POST',
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Erreur lors de la création du compte admin',
      })
    } finally {
      setLoading(false)
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
              <Shield className="h-8 w-8 text-gold" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-navy">Configuration Admin</CardTitle>
            <CardDescription>
              Créez le compte administrateur par défaut
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-2">Compte admin par défaut :</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Email: admin@shoplyeasy.com</li>
                <li>Mot de passe: admin123456</li>
              </ul>
              <p className="mt-2 text-xs">
                ⚠️ Changez ce mot de passe après la première connexion!
              </p>
            </div>

            <Button
              onClick={createAdmin}
              disabled={loading}
              className="w-full bg-gold hover:bg-gold/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Créer le compte admin
                </>
              )}
            </Button>

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{result.message || result.error}</p>
                    {result.success && result.credentials && (
                      <div className="mt-2 text-sm space-y-1">
                        <p>📧 Email: <strong>{result.credentials.email}</strong></p>
                        <p>🔑 Mot de passe: <strong>{result.credentials.password}</strong></p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="text-center text-sm text-gray-600">
              <a href="/login" className="text-gold hover:text-gold/80">
                Aller à la page de connexion →
              </a>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

