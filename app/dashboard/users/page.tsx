"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, Search, Mail, Phone, Calendar, Trash2, Shield, Plus, Edit, Eye, EyeOff, ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  _id: string
  name: string
  email: string
  phone: string
  role?: string
  createdAt?: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [isOrdersDialogOpen, setIsOrdersDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  })

  useEffect(() => {
    fetchUsers()
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

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/users', {
        credentials: 'include', // Inclure les cookies
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login')
          return
        }
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la récupération' }))
        throw new Error(errorData.error || 'Erreur lors de la récupération des utilisateurs')
      }
      
      const data = await response.json()
      console.log('Users data received:', data) // Debug
      setUsers(data.users || [])
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setError(error.message || 'Erreur lors de la récupération des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        // Mise à jour
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        }
        if (formData.password) {
          updateData.password = formData.password
        }

        const response = await fetch(`/api/users/${editingUser._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors de la mise à jour')
        }
      } else {
        // Création
        if (!formData.password) {
          alert('Le mot de passe est requis pour créer un utilisateur')
          return
        }

        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors de la création')
        }
      }

      setIsDialogOpen(false)
      setEditingUser(null)
      resetForm()
      fetchUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      alert(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role || "user",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      fetchUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleViewOrders = async (user: User) => {
    if (user.role === 'admin') return // Don't show orders for admins
    
    setSelectedUser(user)
    setIsOrdersDialogOpen(true)
    setLoadingOrders(true)
    setUserOrders([])

    try {
      const response = await fetch(`/api/orders/user/${user._id}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes')
      }

      const data = await response.json()
      setUserOrders(data.orders || [])
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      alert(error.message || 'Erreur lors de la récupération des commandes')
    } finally {
      setLoadingOrders(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
    })
    setShowPassword(false)
  }

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUsers} className="bg-gold hover:bg-gold/90 text-white">
            Réessayer
          </Button>
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
                <Users className="mr-3 h-8 w-8 text-gold" />
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600">Gérez tous les utilisateurs de votre plateforme</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setEditingUser(null)
                  resetForm()
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gold hover:bg-gold/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-navy">
                      {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {editingUser ? 'Modifiez les informations de l\'utilisateur' : 'Créez un nouvel utilisateur'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="name">Nom complet</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-gold/20 focus:border-gold"
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
                        className="border-gold/20 focus:border-gold"
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
                        className="border-gold/20 focus:border-gold"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">
                        Mot de passe {editingUser && "(Laisser vide pour ne pas modifier)"}
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required={!editingUser}
                          className="border-gold/20 focus:border-gold pr-10"
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
                    <div>
                      <Label htmlFor="role">Rôle</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                        <SelectTrigger className="border-gold/20 focus:border-gold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingUser(null)
                          resetForm()
                        }}
                      >
                        Annuler
                      </Button>
                      <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                        {editingUser ? 'Modifier' : 'Créer'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gold/20 focus:border-gold focus:ring-gold max-w-md"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{users.length}</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Administrateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {users.filter((u) => u.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {users.filter((u) => u.role !== 'admin').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-navy">Liste des Utilisateurs</CardTitle>
            <CardDescription>
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="text-left p-4 text-sm font-semibold text-navy">Nom</th>
                    <th className="text-left p-4 text-sm font-semibold text-navy">Email</th>
                    <th className="text-left p-4 text-sm font-semibold text-navy">Téléphone</th>
                    <th className="text-left p-4 text-sm font-semibold text-navy">Rôle</th>
                    <th className="text-left p-4 text-sm font-semibold text-navy">Date d'inscription</th>
                    <th className="text-left p-4 text-sm font-semibold text-navy">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-3">
                            <Users className="h-5 w-5 text-gold" />
                          </div>
                          <span className="font-medium text-navy">{user.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-gray-600">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === 'admin'
                              ? 'bg-gold/10 text-gold'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                            : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {user.role === 'user' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleViewOrders(user)}
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Commandes
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gold text-gold hover:bg-gold/10"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(user._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun utilisateur trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Dialog */}
      <Dialog open={isOrdersDialogOpen} onOpenChange={setIsOrdersDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-navy">
              Commandes de {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Historique des commandes de cet utilisateur
            </DialogDescription>
          </DialogHeader>
          {loadingOrders ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Adresse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gold">
                        {order.total?.toFixed(2)} DT
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'processing'
                            ? 'bg-blue-100 text-blue-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status === 'completed' ? 'Terminée' :
                           order.status === 'processing' ? 'En traitement' :
                           order.status === 'cancelled' ? 'Annulée' : 'En attente'}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {order.address}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

