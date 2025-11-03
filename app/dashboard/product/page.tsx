"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, Plus, Edit, Trash2, Search, Image as ImageIcon, Box, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useTranslation } from "@/contexts/translation-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  _id: string
  name: string
  suggestions?: string[]
  description: string
  price: number
  purchasePrice?: number
  image: string
  category?: string
  brand?: string
  sizes?: { size: string; stock: number }[]
  colors?: { color: string; colorCode?: string; stock?: number }[]
  gallery?: string[]
  stock?: number
  barcode?: string
  isActive?: boolean
  isNew?: boolean
  isPromo?: boolean
  promoPrice?: number
  availableOnOrder?: boolean
  createdAt?: string
}

interface Category {
  _id: string
  name: string
  categoryType?: 'chaussures' | 'vetements' | 'bijoux' | 'autre'
  sizeType?: 'numeric' | 'letter' | 'none'
  sizes?: string[]
}

interface Brand {
  _id: string
  name: string
}

export default function ProductsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [newSuggestion, setNewSuggestion] = useState("")
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>([])
  const [colors, setColors] = useState<{ color: string; colorCode?: string; stock?: number }[]>([])
  const [newColor, setNewColor] = useState("")
  const [newColorCode, setNewColorCode] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    purchasePrice: "",
    image: "",
    category: "",
    brand: "",
    gallery: "",
    stock: "",
    barcode: "",
    isActive: true,
    isNew: false,
    isPromo: false,
    promoPrice: "",
    availableOnOrder: false,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
    checkAuth()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const uploadToApi = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch('/api/upload', { method: 'POST', body: formData })
    let data: any = null
    try {
      const ct = response.headers.get('content-type') || ''
      if (ct.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      }
    } catch (_) {
      data = null
    }
    if (!response.ok) {
      const msg = (data && (data.error || data.message)) || `Upload échoué (${response.status})`
      throw new Error(msg)
    }
    if (!data || !data.url) throw new Error('Réponse upload invalide')
    return data.url as string
  }

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

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image: formData.image,
        isActive: formData.isActive,
        isNew: formData.isNew,
        isPromo: formData.isPromo,
      }

      if (suggestions.length > 0) productData.suggestions = suggestions
      if (formData.category) productData.category = formData.category
      if (formData.brand) productData.brand = formData.brand
      if (formData.purchasePrice) productData.purchasePrice = parseFloat(formData.purchasePrice)
      if (formData.barcode) productData.barcode = formData.barcode
      // Gestion des couleurs
      if (colors.length > 0) {
        productData.colors = colors
      }
      if (formData.gallery) productData.gallery = formData.gallery.split(',').map((g) => g.trim()).filter(g => g)
      if (formData.isPromo && formData.promoPrice) productData.promoPrice = parseFloat(formData.promoPrice)
      if (formData.availableOnOrder) productData.availableOnOrder = formData.availableOnOrder

      // Gestion des tailles et stock
      const selectedCategory = categories.find(c => c._id === formData.category)
      if (sizes.length > 0 && showSizeSection(formData.category)) {
        productData.sizes = sizes
      } else if (!formData.category || (!showSizeSection(formData.category) && selectedCategory?.categoryType !== 'bijoux')) {
        productData.stock = parseInt(formData.stock) || 0
      }

      if (editingProduct) {
        await fetch(`/api/products/${editingProduct._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData),
        })
      }

      setIsDialogOpen(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Erreur lors de la sauvegarde du produit')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setSuggestions(product.suggestions || [])
    setSizes(product.sizes || [])
    setColors(product.colors || [])
    setGalleryImages(product.gallery || [])
    setFormData({
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price?.toString() ?? "",
      purchasePrice: product.purchasePrice?.toString() ?? "",
      image: product.image ?? "",
      category: product.category ?? "",
      brand: product.brand ?? "",
      gallery: product.gallery?.join(', ') ?? "",
      stock: (product.stock ?? 0).toString(),
      barcode: product.barcode ?? "",
      isActive: product.isActive !== false,
      isNew: product.isNew ?? false,
      isPromo: product.isPromo ?? false,
      promoPrice: product.promoPrice?.toString() ?? "",
      availableOnOrder: product.availableOnOrder ?? false,
    })
    setIsDialogOpen(true)
  }

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions([...suggestions, newSuggestion.trim()])
      setNewSuggestion("")
    }
  }

  const removeSuggestion = (index: number) => {
    setSuggestions(suggestions.filter((_, i) => i !== index))
  }

  const updateSizeStock = (size: string, stock: number) => {
    if (stock > 0) {
      const sizeIndex = sizes.findIndex(s => s.size === size)
      if (sizeIndex >= 0) {
        const updatedSizes = [...sizes]
        updatedSizes[sizeIndex].stock = stock
        setSizes(updatedSizes)
      } else {
        setSizes([...sizes, { size, stock }])
      }
    } else {
      setSizes(sizes.filter(s => s.size !== size))
    }
  }

  const addColor = () => {
    if (newColor.trim()) {
      setColors([...colors, { color: newColor.trim(), colorCode: newColorCode.trim() || undefined, stock: 0 }])
      setNewColor("")
      setNewColorCode("")
    }
  }

  const removeColor = (index: number) => {
    setColors(colors.filter((_, i) => i !== index))
  }

  const updateColorStock = (index: number, stock: number) => {
    const updatedColors = [...colors]
    updatedColors[index].stock = stock
    setColors(updatedColors)
  }

  const updateColorCode = (index: number, colorCode: string) => {
    const updatedColors = [...colors]
    updatedColors[index].colorCode = colorCode || undefined
    setColors(updatedColors)
  }

  const showSizeSection = (categoryId?: string) => {
    const catId = categoryId || formData.category
    if (!catId) return false
    const category = categories.find(c => c._id === catId)
    // Afficher les tailles uniquement si la catégorie est de type "chaussures"
    return category?.categoryType === 'chaussures'
  }

  const showColorSection = (categoryId?: string) => {
    const catId = categoryId || formData.category
    if (!catId) return false
    const category = categories.find(c => c._id === catId)
    return category?.categoryType === 'bijoux'
  }

  const getCategorySizes = (categoryId?: string): string[] => {
    const catId = categoryId || formData.category
    if (!catId) return []
    const category = categories.find(c => c._id === catId)
    return category?.sizes || []
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return
    }

    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Erreur lors de la suppression du produit')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      purchasePrice: "",
      image: "",
      category: "",
      brand: "",
      gallery: "",
      stock: "",
      barcode: "",
      isActive: true,
      isNew: false,
      isPromo: false,
      promoPrice: "",
      availableOnOrder: false,
    })
    setSuggestions([])
    setNewSuggestion("")
    setSizes([])
    setColors([])
    setNewColor("")
    setNewColorCode("")
    setGalleryImages([])
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
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
                <Package className="mr-3 h-8 w-8 text-gold" />
                {t('productManagement')}
              </h1>
              <p className="text-gray-600">{t('manageProductCatalog')}</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) {
                  setEditingProduct(null)
                  resetForm()
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gold hover:bg-gold/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addProduct')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct ? t('edit') + ' ' + t('products').toLowerCase() : t('new') + ' ' + t('products').toLowerCase()}
                    </DialogTitle>
                    <DialogDescription>
                      {editingProduct ? t('editProductInfo') : t('createNewProduct')}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Informations de base */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-navy mb-3">{t('basicInformation')}</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name">{t('productName')} *</Label>
                          <Input
                            id="name"
                            value={formData.name ?? ""}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="border-gold/20 focus:border-gold"
                          />
                        </div>
                          <div>
                          <Label htmlFor="suggestions">Suggestions (noms alternatifs)</Label>
                          <div className="flex gap-2 mb-2">
                            <Input
                              id="suggestions"
                              value={newSuggestion ?? ""}
                              onChange={(e) => setNewSuggestion(e.target.value)}
                              placeholder="Ajouter une suggestion..."
                              className="border-gold/20 focus:border-gold"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  addSuggestion()
                                }
                              }}
                            />
                            <Button type="button" onClick={addSuggestion} className="bg-gold hover:bg-gold/90 text-white">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {suggestions.map((suggestion, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 rounded-full bg-gold/10 text-gold text-sm"
                                >
                                  {suggestion}
                                  <button
                                    type="button"
                                    onClick={() => removeSuggestion(index)}
                                    className="ml-2 hover:text-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="category">{t('productCategory')} *</Label>
                            <Select value={formData.category ?? ""} onValueChange={(value) => {
                              // Réinitialiser les tailles et couleurs si la catégorie change
                              setSizes([])
                              setColors([])
                              setFormData({ ...formData, category: value })
                            }}>
                              <SelectTrigger className="border-gold/20 focus:border-gold bg-white text-gray-900 hover:bg-gray-50">
                                <SelectValue placeholder={t('selectCategory')} className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category._id} value={category._id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="brand">{t('productBrand')}</Label>
                            <Select value={formData.brand ?? ""} onValueChange={(value) => setFormData({ ...formData, brand: value })}>
                              <SelectTrigger className="border-gold/20 focus:border-gold bg-white text-gray-900 hover:bg-gray-50">
                                <SelectValue placeholder={t('selectBrand')} className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent>
                                {brands.map((brand) => (
                                  <SelectItem key={brand._id} value={brand._id}>
                                    {brand.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">{t('description')} *</Label>
                          <Textarea
                            id="description"
                            value={formData.description ?? ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            className="border-gold/20 focus:border-gold"
                            rows={4}
                            placeholder={t('enterProductDescription')}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Prix et stock */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-navy mb-3">{t('priceAndStock')}</h3>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label htmlFor="purchasePrice">{t('productPurchasePrice')} (DT)</Label>
                          <Input
                            id="purchasePrice"
                            type="number"
                            step="0.01"
                            value={formData.purchasePrice ?? ""}
                            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                            className="border-gold/20 focus:border-gold"
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">{t('productSalePrice')} (DT) *</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={formData.price ?? ""}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                            className="border-gold/20 focus:border-gold"
                          />
                        </div>
                        <div>
                          <Label htmlFor="barcode">Code à barres (optionnel)</Label>
                          <Input
                            id="barcode"
                            value={formData.barcode ?? ""}
                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                            placeholder="1234567890123"
                            className="border-gold/20 focus:border-gold"
                          />
                        </div>
                      </div>
                      {showSizeSection() ? (
                        <div className="mt-4">
                          <Label>Tailles disponibles</Label>
                          <div className="space-y-2 mt-2">
                            {getCategorySizes().map((size, index) => {
                              const existingSize = sizes.find(s => s.size === size)
                              return (
                                <div key={size} className="flex gap-2 items-center">
                                  <Input
                                    value={size}
                                    readOnly
                                    className="flex-1 border-gold/20 bg-gray-50"
                                  />
                                  <Input
                                    type="number"
                                    value={existingSize?.stock || 0}
                                    onChange={(e) => {
                                      const stock = parseInt(e.target.value) || 0
                                      updateSizeStock(size, stock)
                                    }}
                                    placeholder="Stock"
                                    className="w-24 border-gold/20 focus:border-gold"
                                    min="0"
                                  />
                                  <span className="text-xs text-gray-500 w-12">
                                    {existingSize?.stock || 0} {t('units')}
                                  </span>
                    </div>
                              )
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {t('sizesWithZeroStock')}
                          </p>
                        </div>
                      ) : null}
                      {showColorSection() ? (
                        <div className="mt-4">
                          <Label>Couleurs disponibles</Label>
                          <div className="space-y-2 mt-2">
                            {colors.map((colorItem, index) => (
                              <div key={index} className="flex gap-2 items-center">
                          <Input
                                  value={colorItem.color ?? ""}
                                  onChange={(e) => {
                                    const updatedColors = [...colors]
                                    updatedColors[index].color = e.target.value
                                    setColors(updatedColors)
                                  }}
                                  placeholder="Nom de la couleur"
                                  className="flex-1 border-gold/20 focus:border-gold"
                                />
                                <Input
                                  type="color"
                                  value={colorItem.colorCode || "#000000"}
                                  onChange={(e) => updateColorCode(index, e.target.value)}
                                  className="w-20 h-10 border-gold/20 focus:border-gold cursor-pointer"
                                />
                                <Input
                                  type="number"
                                  value={colorItem.stock || 0}
                                  onChange={(e) => {
                                    const stock = parseInt(e.target.value) || 0
                                    updateColorStock(index, stock)
                                  }}
                                  placeholder="Stock"
                                  className="w-24 border-gold/20 focus:border-gold"
                                  min="0"
                          />
                                <button
                                  type="button"
                                  onClick={() => removeColor(index)}
                                  className="p-2 text-red-600 hover:text-red-800"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                        </div>
                            ))}
                            <div className="flex gap-2">
                          <Input
                                value={newColor ?? ""}
                                onChange={(e) => setNewColor(e.target.value)}
                                placeholder="Ajouter une couleur (ex: Rouge)"
                                className="flex-1 border-gold/20 focus:border-gold"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addColor()
                                  }
                                }}
                              />
                              <Input
                                type="color"
                                value={newColorCode || "#000000"}
                                onChange={(e) => setNewColorCode(e.target.value)}
                                className="w-20 h-10 border-gold/20 focus:border-gold cursor-pointer"
                          />
                              <Button type="button" onClick={addColor} className="bg-gold hover:bg-gold/90 text-white">
                                <Plus className="h-4 w-4" />
                              </Button>
                        </div>
                      </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {t('colorsWithZeroStock')}
                          </p>
                    </div>
                      ) : null}
                      {!showSizeSection() && !showColorSection() && (
                        <div className="mt-3">
                          <Label htmlFor="stock">{t('generalStock')}</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={formData.stock ?? ""}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="border-gold/20 focus:border-gold"
                          />
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-navy mb-3">Images</h3>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="image">Image principale *</Label>
                          <div className="flex gap-2">
                          <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setUploadingImage(true)
                                  try {
                                    const url = await uploadToApi(file)
                                    setFormData({ ...formData, image: url })
                                  } catch (error) {
                                    console.error('Upload error:', error)
                                    alert((error as any)?.message || 'Erreur lors de l\'upload')
                                  } finally {
                                    setUploadingImage(false)
                                  }
                                }
                              }}
                            className="border-gold/20 focus:border-gold"
                              disabled={uploadingImage}
                            />
                            {uploadingImage && (
                              <div className="flex items-center text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold mr-2"></div>
                                Upload...
                              </div>
                            )}
                          </div>
                          {formData.image && (
                            <div className="mt-2">
                              <img src={formData.image} alt="Preview" className="h-32 w-32 object-cover rounded border border-gold/20" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="gallery">Galerie d'images</Label>
                          <div className="flex gap-2">
                          <Input
                              id="gallery"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={async (e) => {
                                const files = Array.from(e.target.files || [])
                                if (files.length > 0) {
                                  setUploadingGallery(true)
                                  try {
                                    const uploadedUrls = await Promise.all(files.map(f => uploadToApi(f).catch(() => '')))
                                      .then(arr => arr.filter(Boolean) as string[])
                                    setGalleryImages([...galleryImages, ...uploadedUrls])
                                    setFormData({ ...formData, gallery: [...galleryImages, ...uploadedUrls].join(', ') || "" })
                                  } catch (error) {
                                    console.error('Upload error:', error)
                                    alert((error as any)?.message || 'Erreur lors de l\'upload')
                                  } finally {
                                    setUploadingGallery(false)
                                  }
                                }
                              }}
                            className="border-gold/20 focus:border-gold"
                              disabled={uploadingGallery}
                          />
                            {uploadingGallery && (
                              <div className="flex items-center text-sm text-gray-500">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gold mr-2"></div>
                                Upload...
                        </div>
                            )}
                          </div>
                          {galleryImages.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {galleryImages.map((url, index) => (
                                <div key={index} className="relative">
                                  <img src={url} alt={`Gallery ${index + 1}`} className="h-24 w-24 object-cover rounded border border-gold/20" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newGallery = galleryImages.filter((_, i) => i !== index)
                                      setGalleryImages(newGallery)
                                      setFormData({ ...formData, gallery: newGallery.join(', ') })
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>


                    {/* Options */}
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-navy mb-3">Options</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isNew"
                            checked={formData.isNew}
                            onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                            className="rounded border-gold/20"
                          />
                          <Label htmlFor="isNew">Nouveau produit</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isPromo"
                            checked={formData.isPromo}
                            onChange={(e) => setFormData({ ...formData, isPromo: e.target.checked })}
                            className="rounded border-gold/20"
                          />
                          <Label htmlFor="isPromo">En promotion</Label>
                        </div>
                        {formData.isPromo && (
                          <div>
                            <Label htmlFor="promoPrice">{t('promotionalPrice')} (DT)</Label>
                            <Input
                              id="promoPrice"
                              type="number"
                              step="0.01"
                              value={formData.promoPrice ?? ""}
                              onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                              className="border-gold/20 focus:border-gold"
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-gold/20"
                          />
                          <Label htmlFor="isActive">Produit actif</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="availableOnOrder"
                            checked={formData.availableOnOrder}
                            onChange={(e) => setFormData({ ...formData, availableOnOrder: e.target.checked })}
                            className="rounded border-gold/20"
                          />
                          <Label htmlFor="availableOnOrder">{t('availableOnOrder')}</Label>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false)
                          setEditingProduct(null)
                          resetForm()
                        }}
                      >
                        Annuler
                      </Button>
                      <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                        {editingProduct ? 'Modifier' : 'Créer'}
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
              placeholder="Rechercher un produit..."
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{products.length}</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Produits Actifs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {products.filter((p) => p.isActive !== false).length}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('totalStock')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {products.reduce((sum, p) => {
                  if (p.sizes && p.sizes.length > 0) {
                    return sum + p.sizes.reduce((s, size) => s + size.stock, 0)
                  }
                  if (p.colors && p.colors.length > 0) {
                    return sum + p.colors.reduce((s, c) => s + (c.stock || 0), 0)
                  }
                  return sum + (p.stock || 0)
                }, 0)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('stockValue')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">
                {products.reduce((sum, p) => {
                  let stock = 0
                  if (p.sizes && p.sizes.length > 0) {
                    stock = p.sizes.reduce((s, size) => s + size.stock, 0)
                  } else if (p.colors && p.colors.length > 0) {
                    stock = p.colors.reduce((s, c) => s + (c.stock || 0), 0)
                  } else {
                    stock = p.stock || 0
                  }
                  return sum + (p.price * stock)
                }, 0).toFixed(2)} DT
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-gold/20 hover:shadow-lg transition-shadow h-full">
                <div className="relative aspect-square">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        product.isActive !== false
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.isActive !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-navy">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gold font-bold text-lg">
                      {product.price.toFixed(2)} DT
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Box className="h-4 w-4 mr-1" />
                      {product.sizes && product.sizes.length > 0 ? (
                        <span>Stock: {product.sizes.reduce((sum, s) => sum + s.stock, 0)}</span>
                      ) : product.colors && product.colors.length > 0 ? (
                        <span>Stock: {product.colors.reduce((sum, c) => sum + (c.stock || 0), 0)}</span>
                      ) : (
                        <span>Stock: {product.stock || 0}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.category && (
                      <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded">
                        {categories.find(c => c._id === product.category)?.name || t('unknownCategory')}
                      </span>
                    )}
                    {product.brand && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {brands.find(b => b._id === product.brand)?.name || t('unknownBrand')}
                      </span>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                        {product.sizes.length} taille{product.sizes.length > 1 ? 's' : ''}
                      </span>
                    )}
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.colors.filter(c => (c.stock || 0) > 0).map((colorItem, idx) => (
                      <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                              backgroundColor: colorItem.colorCode || '#e5e7eb',
                              color: colorItem.colorCode ? '#fff' : '#000',
                            }}
                            title={colorItem.color}
                      >
                            {colorItem.color}
                      </span>
                    ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gold text-gold hover:bg-gold/10"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="border-gold/20">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('noProductsFound')}</p>
            </CardContent>
          </Card>
        )}
          </div>
    </div>
  )
}

