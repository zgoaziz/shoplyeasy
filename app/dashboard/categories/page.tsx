"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Tag, Search, Plus, Edit, Trash2, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/contexts/translation-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface Category {
  _id: string
  name: string
  categoryType?: 'chaussures' | 'vetements' | 'bijoux' | 'autre'
  sizeType?: 'numeric' | 'letter' | 'none'
  sizes?: string[]
  createdAt?: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categorySizes, setCategorySizes] = useState<string[]>([])
  const [newSize, setNewSize] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    categoryType: 'autre' as 'chaussures' | 'vetements' | 'bijoux' | 'autre',
    sizeType: 'none' as 'numeric' | 'letter' | 'none',
    sizes: [] as string[],
  })

  const getSizeTypeFromCategoryType = (categoryType: string): 'numeric' | 'letter' | 'none' => {
    if (categoryType === 'chaussures') return 'numeric'
    if (categoryType === 'vetements') return 'letter'
    return 'none'
  }

  const getDefaultSizes = (sizeType: 'numeric' | 'letter' | 'none'): string[] => {
    if (sizeType === 'numeric') {
      return Array.from({ length: 20 }, (_, i) => (36 + i).toString()) // 36-55
    }
    if (sizeType === 'letter') {
      return ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    }
    return []
  }

  useEffect(() => {
    fetchCategories()
    checkAuth()
  }, [])

  useEffect(() => {
    const newSizeType = getSizeTypeFromCategoryType(formData.categoryType)
    
    if (formData.sizeType !== newSizeType) {
      setFormData(prev => ({
        ...prev,
        sizeType: newSizeType,
      }))

      if (newSizeType !== 'none') {
        // Si on change de type de catégorie, réinitialiser les tailles
        if (categorySizes.length === 0 || !editingCategory || formData.sizeType === 'none') {
          const defaultSizes = getDefaultSizes(newSizeType)
          setCategorySizes(defaultSizes)
          setFormData(prev => ({
            ...prev,
            sizes: defaultSizes,
          }))
        }
      } else {
        setCategorySizes([])
        setFormData(prev => ({
          ...prev,
          sizes: [],
        }))
      }
    }
  }, [formData.categoryType])

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

  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/categories', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login')
          return
        }
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la récupération' }))
        throw new Error(errorData.error || 'Erreur lors de la récupération des catégories')
      }
      
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      setError(error.message || 'Erreur lors de la récupération des catégories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submitData = {
        name: formData.name,
        categoryType: formData.categoryType,
        sizeType: formData.sizeType,
        sizes: formData.sizeType !== 'none' ? categorySizes : undefined,
      }

      if (editingCategory) {
        const response = await fetch(`/api/categories/${editingCategory._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors de la mise à jour')
        }
      } else {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Erreur lors de la création')
        }
      }

      setIsDialogOpen(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error: any) {
      console.error('Error saving category:', error)
      alert(error.message || 'Erreur lors de la sauvegarde')
    }
  }

  const addCustomSize = () => {
    if (newSize.trim() && !categorySizes.includes(newSize.trim())) {
      const updatedSizes = [...categorySizes, newSize.trim()].sort((a, b) => {
        if (formData.sizeType === 'numeric') {
          return parseInt(a) - parseInt(b)
        }
        return a.localeCompare(b)
      })
      setCategorySizes(updatedSizes)
      setFormData(prev => ({ ...prev, sizes: updatedSizes }))
      setNewSize("")
    }
  }

  const removeSize = (size: string) => {
    const updatedSizes = categorySizes.filter(s => s !== size)
    setCategorySizes(updatedSizes)
    setFormData(prev => ({ ...prev, sizes: updatedSizes }))
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    const categoryType = category.categoryType || (category.sizeType === 'numeric' ? 'chaussures' : category.sizeType === 'letter' ? 'vetements' : 'autre')
    const sizeType = category.sizeType || getSizeTypeFromCategoryType(categoryType)
    const savedSizes = category.sizes || (sizeType !== 'none' ? getDefaultSizes(sizeType) : [])
    
    setCategorySizes(savedSizes)
    setFormData({
      name: category.name,
      categoryType: categoryType as 'chaussures' | 'vetements' | 'bijoux' | 'autre',
      sizeType: sizeType,
      sizes: savedSizes,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la suppression')
      }

      fetchCategories()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert(error.message || 'Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      categoryType: 'autre',
      sizeType: 'none',
      sizes: [],
    })
    setCategorySizes([])
    setNewSize("")
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  if (error && categories.length === 0) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCategories} className="bg-gold hover:bg-gold/90 text-white">
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
                <Tag className="mr-3 h-8 w-8 text-gold" />
                {t('categoryManagement')}
              </h1>
              <p className="text-gray-600">{t('manageCategories')}</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setEditingCategory(null)
                  resetForm()
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gold hover:bg-gold/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addCategory')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-navy">
                      {editingCategory ? t('edit') + ' ' + t('categories').toLowerCase() : t('new') + ' ' + t('categories').toLowerCase()}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                      {editingCategory ? t('editCategoryName') : t('createNewCategory')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="name">{t('categoryName')} *</Label>
                      <Input
                        id="name"
                        value={formData.name ?? ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-gold/20 focus:border-gold"
                        placeholder={t('categoryNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryType">{t('categoryType')} *</Label>
                      <Select 
                        value={formData.categoryType ?? ""} 
                        onValueChange={(value: 'chaussures' | 'vetements' | 'bijoux' | 'autre') => {
                          setFormData({ ...formData, categoryType: value })
                        }}
                      >
                        <SelectTrigger className="border-gold/20 focus:border-gold bg-white text-gray-900 hover:bg-gray-50">
                          <SelectValue className="text-gray-900" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="chaussures">{t('categoryChaussures')} ({t('numericSizes')})</SelectItem>
                          <SelectItem value="vetements">{t('categoryVetements')} ({t('letterSizes')})</SelectItem>
                          <SelectItem value="bijoux">{t('categoryBijoux')} ({t('colorsAvailable')})</SelectItem>
                          <SelectItem value="autre">{t('categoryAutre')} ({t('noSizes')})</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.sizeType === 'numeric' && '✓ ' + t('numericSizesEnabled')}
                        {formData.sizeType === 'letter' && '✓ ' + t('letterSizesEnabled')}
                        {formData.sizeType === 'none' && formData.categoryType === 'bijoux' && '✓ ' + t('colorsAvailableForCategory')}
                        {formData.sizeType === 'none' && formData.categoryType === 'autre' && t('noSizeRequired')}
                      </p>
                    </div>


                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingCategory(null)
                          resetForm()
                        }}
                      >
                        {t('cancel')}
                      </Button>
                      <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                        {editingCategory ? t('update') : t('create')}
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
              placeholder={t('searchCategory')}
              value={searchQuery ?? ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gold/20 focus:border-gold focus:ring-gold max-w-md"
            />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('totalCategories')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Table */}
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-navy">Liste des Catégories</CardTitle>
            <CardDescription>
              {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''} trouvée{filteredCategories.length > 1 ? 's' : ''}
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
                  {filteredCategories.map((category, index) => (
                    <motion.tr
                      key={category._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mr-3">
                            <Tag className="h-5 w-5 text-gold" />
                          </div>
                          <span className="font-medium text-navy">{category.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {category.sizeType === 'numeric' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Numériques</span>
                        )}
                        {category.sizeType === 'letter' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Lettres</span>
                        )}
                        {(!category.sizeType || category.sizeType === 'none') && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Aucune</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gold text-gold hover:bg-gold/10"
                            onClick={() => handleEdit(category)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            {t('edit')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(category._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('noCategoriesFound')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

