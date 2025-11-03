"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Code, Book, Zap, Shield, Server, Database } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ApiPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null)

  const endpoints = [
    {
      id: "products",
      title: "Produits",
      description: "Gérer les produits de la boutique",
      method: "GET",
      url: "/api/products",
      icon: <Database className="h-6 w-6" />,
    },
    {
      id: "orders",
      title: "Commandes",
      description: "Gérer les commandes des clients",
      method: "POST",
      url: "/api/orders",
      icon: <Zap className="h-6 w-6" />,
    },
    {
      id: "auth",
      title: "Authentification",
      description: "Gérer l'authentification des utilisateurs",
      method: "POST",
      url: "/api/auth",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      id: "users",
      title: "Utilisateurs",
      description: "Gérer les utilisateurs",
      method: "GET",
      url: "/api/users",
      icon: <Server className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-4 w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center"
          >
            <Code className="h-8 w-8 text-gold" />
          </motion.div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-navy mb-4">
            API Documentation
          </h1>
          <div className="w-20 h-0.5 bg-gold mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explorez notre API RESTful pour intégrer ShoplyEasy dans vos applications
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {endpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg border-gold/20 ${
                  selectedEndpoint === endpoint.id ? "ring-2 ring-gold" : ""
                }`}
                onClick={() => setSelectedEndpoint(selectedEndpoint === endpoint.id ? null : endpoint.id)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-gold">{endpoint.icon}</div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      endpoint.method === "GET" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                    }`}>
                      {endpoint.method}
                    </span>
                  </div>
                  <CardTitle className="text-navy">{endpoint.title}</CardTitle>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <code className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    {endpoint.url}
                  </code>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {selectedEndpoint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Card className="border-gold/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-navy">
                  {endpoints.find((e) => e.id === selectedEndpoint)?.title} - Documentation
                </CardTitle>
                <CardDescription>
                  Détails de l&apos;endpoint sélectionné
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-navy mb-2">Endpoint</h3>
                    <code className="block bg-gray-100 p-3 rounded text-sm">
                      {endpoints.find((e) => e.id === selectedEndpoint)?.url}
                    </code>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-2">Méthode</h3>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                      endpoints.find((e) => e.id === selectedEndpoint)?.method === "GET"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {endpoints.find((e) => e.id === selectedEndpoint)?.method}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy mb-2">Description</h3>
                    <p className="text-gray-600">
                      {endpoints.find((e) => e.id === selectedEndpoint)?.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-gold/20 bg-gradient-to-r from-gold/5 to-gold/10">
            <CardHeader>
              <CardTitle className="text-navy flex items-center">
                <Book className="mr-2 h-5 w-5 text-gold" />
                Besoin d&apos;aide ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Pour obtenir votre clé API et accéder à la documentation complète, contactez notre équipe technique.
              </p>
              <Button className="bg-gold hover:bg-gold/90 text-white">
                Obtenir une clé API
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

