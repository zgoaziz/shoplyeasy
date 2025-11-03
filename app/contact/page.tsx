"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Phone, Mail, MapPin, Clock, Star, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        // Auto-fill form if user is authenticated
        if (data.user) {
          setFormData({
            name: data.user.name || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
            subject: "",
            message: "",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message')
      }

      setSuccess(true)
      setFormData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        subject: "",
        message: "",
      })
    } catch (error: any) {
      console.error('Error sending message:', error)
      alert(error.message || 'Erreur lors de l\'envoi du message')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h4 className="text-gold uppercase tracking-wider font-medium mb-2 text-sm sm:text-base">Contact</h4>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-navy mb-4 sm:mb-6">
            Contactez-nous
          </h1>
          <div className="w-16 sm:w-20 h-0.5 bg-gold mx-auto mb-4 sm:mb-6"></div>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Nous sommes là pour vous accompagner et répondre à toutes vos questions. 
            Contactez-nous pour toute demande concernant nos produits.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            <Card className="bg-white/50 backdrop-blur-sm border-gold/20">
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-6 sm:space-y-8">
                  {/* Address */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-navy mb-2">Notre Adresse</h3>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        Rue Manzel Hor 8090<br />
                        Kelibia, Nabeul<br />
                        Tunisie
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-navy mb-2">Téléphone</h3>
                      <a 
                        href="tel:56170165" 
                        className="text-gold hover:text-gold/80 font-bold text-lg sm:text-xl transition-colors"
                      >
                        56 170 165
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-navy mb-2">Email</h3>
                      <a 
                      href="mailto:contact@shoplyeasy.com" 
                        className="text-gold hover:text-gold/80 transition-colors break-all"
                      >
                      contact@shoplyeasy.com
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-navy mb-2">Horaires d'ouverture</h3>
                      <div className="space-y-1 text-sm sm:text-base text-gray-700">
                        <div className="flex justify-between">
                          <span>Lundi - Vendredi</span>
                          <span className="font-medium">8h - 19h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Samedi</span>
                          <span className="font-medium">8h - 20h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dimanche</span>
                          <span className="font-medium">9h - 18h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call to Action */}
            <div className="text-center">
              <a href="tel:56170165">
                <Button size="lg" className="bg-gold hover:bg-gold/90 text-white text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4">
                  <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Appelez-nous maintenant
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            <Card className="bg-white/50 backdrop-blur-sm border-gold/20">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl font-semibold text-navy mb-4">Envoyez-nous un message</h3>
                {success && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                    Message envoyé avec succès ! Nous vous répondrons bientôt.
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-2 border-gold/20 focus:border-gold"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-2 border-gold/20 focus:border-gold"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="mt-2 border-gold/20 focus:border-gold"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="mt-2 border-gold/20 focus:border-gold"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="mt-2 border-gold/20 focus:border-gold"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting || loading}
                    className="w-full bg-gold hover:bg-gold/90 text-white"
                  >
                    {submitting ? (
                      "Envoi en cours..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-6"
            >
            <Card className="bg-white/50 backdrop-blur-sm border-gold/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.1234567890123!2d11.085997!3d36.851513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzYsNTEnMDUuNSJOIDExLDAnMDguNiJF!5e0!3m2!1sfr!2stn!4v1234567890123"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="ShoplyEasy - Kelibia, Nabeul"
                    className="w-full h-full"
                  ></iframe>
                </div>
              </CardContent>
            </Card>

            {/* Map Info */}
            <Card className="bg-white/50 backdrop-blur-sm border-gold/20">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <Star className="h-5 w-5 text-gold" />
                  <h3 className="text-lg font-semibold text-navy">Comment nous trouver</h3>
                </div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  Notre local se trouve au cœur de Kelibia, dans la rue Manzel Hor. 
                  Nous sommes facilement accessibles en voiture ou à pied depuis le centre-ville.
                </p>
                <div className="mt-4 pt-4 border-t border-gold/20">
                  <p className="text-sm text-gray-600">
                    <strong>Parking :</strong> Parking public disponible à proximité
                  </p>
                  <div className="mt-2">
                    <a 
                      href="https://maps.app.goo.gl/su2znSzLWjAPutyn8" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold/80 text-sm transition-colors"
                    >
                      Voir sur Google Maps →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          </motion.div>
        </div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-gold/5 to-gold/10 border-gold/20">
            <CardContent className="p-8 sm:p-12">
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-navy mb-4">
                Prêt à découvrir nos produits ?
              </h3>
              <p className="text-gray-700 text-base sm:text-lg mb-6 max-w-2xl mx-auto">
                Contactez-nous et découvrez notre large sélection de produits de qualité. 
                Notre équipe se fera un plaisir de vous accompagner dans vos achats.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:56170165">
                  <Button size="lg" className="bg-gold hover:bg-gold/90 text-white">
                    <Phone className="mr-2 h-4 w-4" />
                    Commander par téléphone
                  </Button>
                </a>
                  <a href="/menu">
                <Button size="lg" variant="outline" className="border-gold text-gold hover:bg-gold/10">
                  Voir nos produits
                </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}