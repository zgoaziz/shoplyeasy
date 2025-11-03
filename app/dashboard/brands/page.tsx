"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, Search, Plus, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/contexts/translation-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Brand {
  _id: string
  name: string
  image?: string
  createdAt?: string
}

export default function BrandsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    image: "",
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchBrands()
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

  const fetchBrands = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/brands', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login')
          return
        }
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la récupération' }))
        throw new Error(errorData.error || 'Erreur lors de la récupération des marques')
      }
      
      const data = await response.json()
      setBrands(data.brands || [])
    } catch (error: any) {
      console.error('Error fetching brands:', error)
      setError(error.message || 'Erreur lors de la récupération des marques')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBrand) {
        const response = await fetch(`/api/brands/${editingBrand._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors de la mise à jour')
        }
      } else {
        const response = await fetch('/api/brands', {
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
      setEditingBrand(null)
      resetForm()
      fetchBrands()
    } catch (error: any) {
      console.error('Error saving brand:', error)
      alert(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      image: brand.image || "",
    })
    setIsDialogOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload')
      }

      const data = await response.json()
      setFormData({ ...formData, image: data.url })
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(error.message || 'Erreur lors de l\'upload de l\'image')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) {
      return
    }

    try {
      const response = await fetch(`/api/brands/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      fetchBrands()
    } catch (error: any) {
      console.error('Error deleting brand:', error)
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      image: "",
    })
  }

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des marques...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && brands.length === 0) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchBrands} className="bg-gold hover:bg-gold/90 text-white">
              Réessayer
            </Button>
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
                <Award className="mr-3 h-8 w-8 text-gold" />
                {t('brandManagement')}
              </h1>
              <p className="text-gray-600">{t('manageBrands')}</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setEditingBrand(null)
                  resetForm()
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gold hover:bg-gold/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une marque
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-navy">
                      {editingBrand ? 'Modifier la marque' : 'Nouvelle marque'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {editingBrand ? 'Modifiez le nom de la marque' : 'Créez une nouvelle marque'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="name">Nom de la marque *</Label>
                      <Input
                        id="name"
                        value={formData.name ?? ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-gold/20 focus:border-gold"
                        placeholder="Ex: Nike, Adidas, Zara"
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Image de la marque</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="border-gold/20 focus:border-gold"
                      />
                      {uploading && <p className="text-sm text-gray-500 mt-2">Upload en cours...</p>}
                      {formData.image && (
                        <div className="mt-4">
                          <img src={formData.image} alt="Preview" className="w-32 h-32 object-contain border border-gold/20 rounded" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingBrand(null)
                          resetForm()
                        }}
                      >
                        Annuler
                      </Button>
                      <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                        {editingBrand ? 'Modifier' : 'Créer'}
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
              placeholder="Rechercher une marque..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gold/20 focus:border-gold focus:ring-gold max-w-md"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Marques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{brands.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Brands Table */}
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-navy">Liste des Marques</CardTitle>
            <CardDescription>
              {filteredBrands.length} marque{filteredBrands.length > 1 ? 's' : ''} trouvée{filteredBrands.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gold/20">
                    <th className="text-left p-4 text-sm font-semibold text-navy">Nom</th>
                    <th className="text-left p-4 text-sm font-semibold text-navy">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.map((brand, index) => (
                    <motion.tr
                      key={brand._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          {brand.image ? (
                            <img src={brand.image} alt={brand.name} className="w-10 h-10 object-contain mr-3" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-3">
                              <Award className="h-5 w-5 text-gold" />
                            </div>
                          )}
                          <span className="font-medium text-navy">{brand.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gold text-gold hover:bg-gold/10"
                            onClick={() => handleEdit(brand)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(brand._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredBrands.length === 0 && (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune marque trouvée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

