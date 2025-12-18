"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Image as ImageIcon, Upload, Plus, Trash2, Save, Eye, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/contexts/translation-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"

interface Advertisement {
  _id: string
  image: string
  video?: string
  type?: 'image' | 'video'
  link?: string
  position?: {
    x: number
    y: number
    section: 'header' | 'sidebar' | 'content' | 'footer'
  }
  section?: 'header' | 'sidebar' | 'content' | 'footer' | 'hero' | 'main'
  orientation: 'horizontal' | 'vertical'
  isActive?: boolean
  createdAt?: string
}

export default function AdvertisementsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null)
  const [draggedAd, setDraggedAd] = useState<Advertisement | null>(null)
  const [formData, setFormData] = useState({
    image: "",
    video: "",
    type: 'image' as 'image' | 'video',
    link: "",
    orientation: 'horizontal' as 'horizontal' | 'vertical',
    section: 'hero' as 'header' | 'sidebar' | 'content' | 'footer' | 'hero' | 'main',
    x: 0,
    y: 0,
    isActive: true,
  })
  const [linkPreview, setLinkPreview] = useState<string>("")

  useEffect(() => {
    fetchAdvertisements()
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

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch('/api/advertisements')
      if (response.ok) {
        const data = await response.json()
        setAdvertisements(data.advertisements || [])
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      })
      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url ?? "" }))
      } else {
        alert('Erreur lors de l\'upload')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier que c'est une vidéo
    if (!file.type.startsWith('video/')) {
      alert('Veuillez sélectionner un fichier vidéo')
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      })
      const data = await response.json()
      if (data.success) {
        setFormData(prev => ({ ...prev, video: data.url ?? "", type: 'video' }))
        alert('Vidéo uploadée avec succès!')
      } else {
        alert(`Erreur lors de l'upload: ${data.error || 'Erreur inconnue'}`)
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`Erreur lors de l'upload: ${error.message || 'Erreur inconnue'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const adData = {
        image: formData.image || undefined,
        video: formData.video || undefined,
        type: formData.type,
        link: formData.link || undefined,
        orientation: formData.orientation,
        section: formData.section,
        position: {
          x: formData.x,
          y: formData.y,
          section: formData.section,
        },
        isActive: formData.isActive,
      }

      if (editingAd) {
        await fetch(`/api/advertisements/${editingAd._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData),
        })
      } else {
        await fetch('/api/advertisements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adData),
        })
      }

      setIsDialogOpen(false)
      setEditingAd(null)
      resetForm()
      fetchAdvertisements()
    } catch (error) {
      console.error('Error saving advertisement:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publicité ?')) {
      return
    }

    try {
      await fetch(`/api/advertisements/${id}`, {
        method: 'DELETE',
      })
      fetchAdvertisements()
    } catch (error) {
      console.error('Error deleting advertisement:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad)
    const link = ad.link ?? ""
    setFormData({
      image: ad.image ?? "",
      video: ad.video ?? "",
      type: ad.type ?? (ad.video ? 'video' : 'image'),
      link: link,
      orientation: ad.orientation ?? 'horizontal',
      section: ad.position?.section ?? ad.section ?? 'content',
      x: ad.position?.x ?? 0,
      y: ad.position?.y ?? 0,
      isActive: ad.isActive !== false,
    })
    if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
      setLinkPreview(link)
    } else {
      setLinkPreview("")
    }
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      image: "",
      video: "",
      type: 'image',
      link: "",
      orientation: 'horizontal',
      section: 'hero',
      x: 0,
      y: 0,
      isActive: true,
    })
    setLinkPreview("")
  }

  const handleLinkChange = (link: string) => {
    setFormData({ ...formData, link: link ?? "" })
    // Mettre à jour le preview si c'est une URL valide
    if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
      setLinkPreview(link)
    } else {
      setLinkPreview("")
    }
  }

  const handleDragStart = (ad: Advertisement) => {
    setDraggedAd(ad)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, section: 'header' | 'sidebar' | 'content' | 'footer') => {
    e.preventDefault()
    if (!draggedAd) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const updatedAd = {
      ...draggedAd,
      position: {
        ...draggedAd.position,
        section,
        x,
        y,
      },
    }

    updateAdPosition(updatedAd)
    setDraggedAd(null)
  }

  const updateAdPosition = async (ad: Advertisement) => {
    try {
      await fetch(`/api/advertisements/${ad._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: ad.position,
        }),
      })
      fetchAdvertisements()
    } catch (error) {
      console.error('Error updating position:', error)
    }
  }

  const activeAds = advertisements.filter(ad => ad.isActive !== false)

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
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy mb-2 flex items-center">
                <ImageIcon className="mr-3 h-6 w-6 sm:h-8 sm:w-8 text-gold" />
                {t('advertisementManagement')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">{t('manageAdvertisements')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                  <Button
                    onClick={() => setIsPreviewOpen(true)}
                    variant="outline"
                    className="border-gold text-gold hover:bg-gold/10"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t('preview')}
                  </Button>
                  <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                      setEditingAd(null)
                      resetForm()
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="bg-gold hover:bg-gold/90 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addAdvertisement')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                      <DialogHeader>
                        <DialogTitle>
                          {editingAd ? `${t('modify')} ${t('advertisements')}` : t('addAdvertisement')}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div>
                          <Label>Type de média *</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value: 'image' | 'video') => {
                              setFormData({ ...formData, type: value, image: "", video: "" })
                            }}
                          >
                            <SelectTrigger className="border-gold/20 focus:border-gold bg-white text-gray-900 hover:bg-gray-50">
                              <SelectValue className="text-gray-900" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">Image</SelectItem>
                              <SelectItem value="video">Vidéo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>{formData.type === 'video' ? 'Vidéo' : t('image')} *</Label>
                          <div className="mt-2">
                            <Input
                              type="file"
                              accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                              onChange={formData.type === 'video' ? handleVideoUpload : handleImageUpload}
                              disabled={uploading}
                              className="border-gold/20 focus:border-gold"
                            />
                            {uploading && (
                              <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>
                            )}
                            {formData.type === 'image' && formData.image && (
                              <div className="mt-2">
                                <img src={formData.image || undefined} alt="Preview" className="max-h-48 rounded border border-gold/20" />
                              </div>
                            )}
                            {formData.type === 'video' && formData.video && (
                              <div className="mt-2">
                                <video src={formData.video || undefined} controls className="max-h-48 rounded border border-gold/20 w-full" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label>{t('linkOptional')}</Label>
                          <Input
                            value={formData.link ?? ""}
                            onChange={(e) => handleLinkChange(e.target.value)}
                            placeholder="https://..."
                            className="border-gold/20 focus:border-gold"
                          />
                          {linkPreview && (
                            <div className="mt-4 border border-gold/20 rounded-lg overflow-hidden">
                              <div className="bg-gray-50 p-2 border-b border-gold/10">
                                <p className="text-xs text-gray-600">{t('pagePreview')}</p>
                              </div>
                              <div className="relative w-full" style={{ height: '400px' }}>
                                <iframe
                                  src={linkPreview}
                                  className="w-full h-full border-0"
                                  title="Page preview"
                                  sandbox="allow-same-origin allow-scripts"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>{t('orientation')} *</Label>
                            <Select
                              value={formData.orientation ?? 'horizontal'}
                              onValueChange={(value: 'horizontal' | 'vertical') =>
                                setFormData({ ...formData, orientation: value })
                              }
                            >
                              <SelectTrigger className="border-gold/20 focus:border-gold bg-white text-gray-900 hover:bg-gray-50">
                                <SelectValue className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="horizontal">{t('horizontal')}</SelectItem>
                                <SelectItem value="vertical">{t('vertical')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>{t('section')} *</Label>
                            <Select
                              value={formData.section ?? 'hero'}
                              onValueChange={(value: 'header' | 'sidebar' | 'content' | 'footer' | 'hero' | 'main') =>
                                setFormData({ ...formData, section: value })
                              }
                            >
                              <SelectTrigger className="border-gold/20 focus:border-gold bg-white text-gray-900 hover:bg-gray-50">
                                <SelectValue className="text-gray-900" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hero">Hero (Page d'accueil)</SelectItem>
                                <SelectItem value="main">Main (Section principale)</SelectItem>
                                <SelectItem value="header">Header</SelectItem>
                                <SelectItem value="sidebar">Sidebar</SelectItem>
                                <SelectItem value="content">Content</SelectItem>
                                <SelectItem value="footer">Footer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-gold/20"
                          />
                          <Label htmlFor="isActive">{t('activeAdvertisement')}</Label>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsDialogOpen(false)
                              setEditingAd(null)
                              resetForm()
                            }}
                          >
                            {t('cancel')}
                          </Button>
                          <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                            <Save className="mr-2 h-4 w-4" />
                            {editingAd ? t('modify') : t('create')}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
            </div>
          </div>
        </motion.div>

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader>
                  <DialogTitle>{t('previewSite')}</DialogTitle>
                  <DialogDescription>
                    {t('dragDropInstructions')}
                  </DialogDescription>
                </DialogHeader>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
                  {/* Header Section */}
                  <div
                    className="bg-blue-50 border-b border-gray-300 p-4 relative min-h-[100px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'header')}
                  >
                    <p className="text-xs text-gray-500 mb-2">{t('header')}</p>
                    {activeAds.filter(ad => ad.position?.section === 'header').map((ad) => (
                      <div
                        key={ad._id}
                        draggable
                        onDragStart={() => handleDragStart(ad)}
                        className="absolute cursor-move border-2 border-dashed border-gold"
                        style={{
                          left: `${ad.position?.x ?? 0}px`,
                          top: `${ad.position?.y ?? 0}px`,
                          width: ad.orientation === 'horizontal' ? '300px' : '150px',
                          height: ad.orientation === 'horizontal' ? '100px' : '200px',
                        }}
                      >
                        {(ad.type === 'video' && ad.video) ? (
                          <video src={ad.video || undefined} controls className="w-full h-full object-cover" />
                        ) : ad.image ? (
                          <img src={ad.image} alt="Ad" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                    ))}
                  </div>

                  <div className="flex">
                    {/* Sidebar Section */}
                    <div
                      className="bg-gray-50 border-r border-gray-300 p-4 w-64 relative min-h-[400px]"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'sidebar')}
                    >
                      <p className="text-xs text-gray-500 mb-2">{t('sidebar')}</p>
                      {activeAds.filter(ad => ad.position?.section === 'sidebar').map((ad) => (
                        <div
                          key={ad._id}
                          draggable
                          onDragStart={() => handleDragStart(ad)}
                          className="absolute cursor-move border-2 border-dashed border-gold"
                          style={{
                            left: `${ad.position?.x ?? 0}px`,
                            top: `${ad.position?.y ?? 0}px`,
                            width: ad.orientation === 'vertical' ? '150px' : '200px',
                            height: ad.orientation === 'vertical' ? '200px' : '100px',
                          }}
                        >
                          {(ad.type === 'video' && ad.video) ? (
                            <video src={ad.video || undefined} controls className="w-full h-full object-cover" />
                          ) : ad.image ? (
                            <img src={ad.image} alt="Ad" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {/* Content Section */}
                    <div
                      className="bg-white flex-1 p-4 relative min-h-[400px]"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'content')}
                    >
                      <p className="text-xs text-gray-500 mb-2">{t('content')}</p>
                      {activeAds.filter(ad => ad.position?.section === 'content').map((ad) => (
                        <div
                          key={ad._id}
                          draggable
                          onDragStart={() => handleDragStart(ad)}
                          className="absolute cursor-move border-2 border-dashed border-gold"
                          style={{
                            left: `${ad.position?.x ?? 0}px`,
                            top: `${ad.position?.y ?? 0}px`,
                            width: ad.orientation === 'horizontal' ? '400px' : '200px',
                            height: ad.orientation === 'horizontal' ? '150px' : '300px',
                          }}
                        >
                          {(ad.type === 'video' && ad.video) ? (
                            <video src={ad.video || undefined} controls className="w-full h-full object-cover" />
                          ) : ad.image ? (
                            <img src={ad.image} alt="Ad" className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div
                    className="bg-gray-100 border-t border-gray-300 p-4 relative min-h-[100px]"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'footer')}
                  >
                    <p className="text-xs text-gray-500 mb-2">{t('footer')}</p>
                    {activeAds.filter(ad => ad.position?.section === 'footer').map((ad) => (
                      <div
                        key={ad._id}
                        draggable
                        onDragStart={() => handleDragStart(ad)}
                        className="absolute cursor-move border-2 border-dashed border-gold"
                        style={{
                          left: `${ad.position?.x ?? 0}px`,
                          top: `${ad.position?.y ?? 0}px`,
                          width: ad.orientation === 'horizontal' ? '300px' : '150px',
                          height: ad.orientation === 'horizontal' ? '100px' : '200px',
                        }}
                      >
                        {(ad.type === 'video' && ad.video) ? (
                          <video src={ad.video || undefined} controls className="w-full h-full object-cover" />
                        ) : ad.image ? (
                          <img src={ad.image} alt="Ad" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </DialogContent>
        </Dialog>

        {/* Advertisements List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advertisements.map((ad) => (
                <Card key={ad._id} className="border-gold/20">
                  <div className="relative aspect-video">
                    {(ad.type === 'video' && ad.video) ? (
                      <video src={ad.video} controls className="w-full h-full object-cover rounded-t-lg" />
                    ) : ad.image ? (
                      <Image
                        src={ad.image}
                        alt="Advertisement"
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-lg">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-sm">{ad.orientation === 'horizontal' ? t('horizontal') : t('vertical')}</CardTitle>
                    <CardDescription className="text-xs">
                      {t('section')}: {ad.position?.section ? t(ad.position.section) : ad.section ? t(ad.section) : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(ad)}
                        className="flex-1 border-gold text-gold hover:bg-gold/10"
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(ad._id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

