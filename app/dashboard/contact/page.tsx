"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Mail, Search, User, Phone, MessageSquare, Calendar, Eye, Trash2, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslation } from "@/contexts/translation-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Contact {
  _id: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status?: string
  createdAt?: string
}

export default function ContactsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchContacts()
    checkAuth()
  }, [])

  const checkAuth = async () => {
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
    } catch (error) {
      window.location.href = '/login'
    }
  }

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/contacts')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des contacts')
      }
      const data = await response.json()
      setContacts(data.contacts)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      fetchContacts()
    } catch (error) {
      console.error('Error updating contact:', error)
      alert('Erreur lors de la mise à jour du statut')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return
    }

    try {
      await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      })
      fetchContacts()
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Erreur lors de la suppression du contact')
    }
  }

  const handleView = (contact: Contact) => {
    setSelectedContact(contact)
    setIsDialogOpen(true)
    // Marquer comme lu si nouveau
    if (contact.status === 'new') {
      handleStatusChange(contact._id, 'read')
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700'
      case 'read':
        return 'bg-gray-100 text-gray-700'
      case 'replied':
        return 'bg-green-100 text-green-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'new':
        return 'Nouveau'
      case 'read':
        return 'Lu'
      case 'replied':
        return 'Répondu'
      default:
        return 'Nouveau'
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2 flex items-center">
                <Mail className="mr-3 h-8 w-8 text-gold" />
                {t('contactManagement')}
              </h1>
              <p className="text-gray-600">{t('manageContacts')}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher un contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gold/20 focus:border-gold focus:ring-gold max-w-md"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{contacts.length}</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Nouveaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {contacts.filter((c) => c.status === 'new').length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Lus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">
                {contacts.filter((c) => c.status === 'read').length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Répondus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {contacts.filter((c) => c.status === 'replied').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts List */}
        <div className="space-y-4">
          {filteredContacts.map((contact, index) => (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className={`border-gold/20 hover:shadow-lg transition-shadow ${
                contact.status === 'new' ? 'bg-blue-50/50' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex-1 mb-4 sm:mb-0">
                      <div className="flex items-start mb-3">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mr-4 flex-shrink-0">
                          <User className="h-6 w-6 text-gold" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="font-semibold text-navy text-lg mr-3">{contact.name}</h3>
                            <Badge className={getStatusColor(contact.status)}>
                              {getStatusLabel(contact.status)}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-600 text-sm">
                              <Mail className="h-4 w-4 mr-2 text-gray-400" />
                              {contact.email}
                            </div>
                            {contact.phone && (
                              <div className="flex items-center text-gray-600 text-sm">
                                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                {contact.phone}
                              </div>
                            )}
                            {contact.subject && (
                              <div className="font-medium text-navy mt-2">
                                Objet: {contact.subject}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 mt-3 line-clamp-2">{contact.message}</p>
                          <div className="flex items-center text-gray-500 text-xs mt-3">
                            <Calendar className="h-3 w-3 mr-1" />
                            {contact.createdAt
                              ? new Date(contact.createdAt).toLocaleString('fr-FR')
                              : 'Date inconnue'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gold text-gold hover:bg-gold/10"
                        onClick={() => handleView(contact)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      {contact.status !== 'replied' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => handleStatusChange(contact._id, 'replied')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marquer répondu
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(contact._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <Card className="border-gold/20">
            <CardContent className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucun contact trouvé</p>
            </CardContent>
          </Card>
        )}

        {/* View Contact Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedContact && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-gold" />
                    Message de {selectedContact.name}
                  </DialogTitle>
                  <DialogDescription>
                    Reçu le{' '}
                    {selectedContact.createdAt
                      ? new Date(selectedContact.createdAt).toLocaleString('fr-FR')
                      : 'Date inconnue'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Email</Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a
                        href={`mailto:${selectedContact.email}`}
                        className="text-gold hover:text-gold/80"
                      >
                        {selectedContact.email}
                      </a>
                    </div>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Téléphone</Label>
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <a
                          href={`tel:${selectedContact.phone}`}
                          className="text-gold hover:text-gold/80"
                        >
                          {selectedContact.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedContact.subject && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Objet</Label>
                      <p className="mt-1 text-navy">{selectedContact.subject}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-semibold text-gray-600">Message</Label>
                    <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                      <MessageSquare className="h-4 w-4 text-gray-400 mb-2" />
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

