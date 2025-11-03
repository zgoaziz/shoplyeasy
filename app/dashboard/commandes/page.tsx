"use client"

 

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Search, Calendar, DollarSign, Package, Filter, GripVertical, Phone, CheckCircle, Truck, PackageCheck, Eye, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/contexts/translation-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Order {
  _id: string
  userId?: string
  name: string
  email?: string
  phone: string
  address: string
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  total: number
  status?: 'en_attente' | 'en_cours' | 'confirmee' | 'en_livraison' | 'terminee' | 'pending' | 'processing' | 'completed' | 'cancelled' | 'annulee'
  paymentMethod?: string
  createdAt?: string
  updatedAt?: string
}

export default function CommandesPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'list'>('kanban')
  const [viewOpen, setViewOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [vatRate, setVatRate] = useState<number>(19)
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [freeShipping, setFreeShipping] = useState<boolean>(true)

  useEffect(() => {
    checkAuth()
    fetchOrders()
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

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          router.push('/login')
          return
        }
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la récupération' }))
        throw new Error(errorData.error || 'Erreur lors de la récupération des commandes')
      }
      
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error: any) {
      console.error('Error fetching orders:', error)
      setError(error.message || 'Erreur lors de la récupération des commandes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      fetchOrders()
    } catch (error: any) {
      console.error('Error updating order:', error)
      alert(error.message || 'Erreur lors de la mise à jour')
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'terminee':
      case 'completed':
        return <Badge className="bg-green-100 text-green-700">Terminée</Badge>
      case 'en_livraison':
        return <Badge className="bg-purple-100 text-purple-700">En livraison</Badge>
      case 'confirmee':
        return <Badge className="bg-blue-100 text-blue-700">Confirmée</Badge>
      case 'en_cours':
      case 'processing':
        return <Badge className="bg-orange-100 text-orange-700">En cours</Badge>
      case 'cancelled':
      case 'annulee':
        return <Badge className="bg-red-100 text-red-700">Annulée</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">En attente</Badge>
    }
  }

  const printOrder = (order: Order) => {
    const w = window.open('', '_blank')
    if (!w) return
    const rows = order.items
      .map(i => `<tr>
        <td>${i.name}</td>
        <td>${i.quantity}</td>
        <td>${i.price.toFixed(2)} DT</td>
        <td>${(i.price * i.quantity).toFixed(2)} DT</td>
      </tr>`)
      .join("")

    const logo = `${window.location.origin}/logoarab.png`

    w.document.write(`<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Commande ${order._id.slice(-8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; max-width: 760px; margin: 0 auto; color: #1f2937; }
            .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
            .brand img { height: 36px; }
            .brand .name { font-weight: 700; font-size: 14px; color: #0f172a; letter-spacing: .5px; }
            h1 { margin: 8px 0 8px 0; text-align: center; font-size: 22px; color: #111827; }
            .meta { color: #4b5563; margin-bottom: 12px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border-bottom: 1px solid #eee; text-align: left; }
            th { background: #f7f7f7; }
            .total { text-align: right; font-weight: bold; margin-top: 10px; font-size: 16px; }
            .footer { margin-top: 14px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="brand">
            <img src="${logo}" alt="Logo" />
            <div class="name">SHOPLYEASY</div>
          </div>
          <h1>Commande ${order._id.slice(-8)}</h1>
          <div class="meta">Client: ${order.name} | Tel: ${order.phone || ''} | Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : ''}</div>
          <table>
            <thead>
              <tr><th>Produit</th><th>Qté</th><th>Prix</th><th>Total</th></tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="total">Total: ${order.total?.toFixed(2)} DT</div>
          ${order.address ? `<div class="meta" style="margin-top:12px">Adresse: ${order.address}</div>` : ''}
          <div class="footer">Merci pour votre confiance.</div>
        </body>
      </html>`)
    w.document.close()
    setTimeout(() => w.print(), 200)
  }

  const printInvoice = (order: Order, vat: number, shipping: number) => {
    const w = window.open('', '_blank')
    if (!w) return
    const rows = order.items
      .map(i => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${i.name}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${i.price.toFixed(2)} DT</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${(i.price * i.quantity).toFixed(2)} DT</td>
      </tr>`)
      .join("")

    const logo = `${window.location.origin}/logo.png`
    const subTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const vatAmount = +(subTotal * (vat / 100)).toFixed(2)
    const shippingAmount = +shipping
    const grandTotal = +(subTotal + vatAmount + shippingAmount).toFixed(2)

    w.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Facture ${order._id.slice(-8)}</title>
        <style>
          body{font-family:Arial,Helvetica,sans-serif;color:#111827;margin:0}
          .container{max-width:900px;margin:0 auto;padding:28px}
          .header{display:flex;align-items:flex-start;justify-content:space-between;padding-bottom:10px;border-bottom:3px solid #005ea6}
          .brand{display:flex;align-items:center;gap:12px}
          .brand img{height:48px}
          .brand .name{font-weight:800;letter-spacing:.4px;color:#005ea6}
          .facture-badge{background:#005ea6;color:#fff;border-radius:6px;padding:8px 14px;font-weight:700;}
          .info-grid{display:grid;grid-template-columns:1.3fr .7fr;gap:16px;margin-top:14px}
          .company{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:12px;font-size:12px}
          .company .label{color:#6b7280}
          .section{margin-top:16px}
          .section-title{background:#005ea6;color:#fff;padding:6px 10px;font-weight:700;border-radius:4px 4px 0 0}
          .section-box{border:1px solid #e5e7eb;border-top:none;border-radius:0 0 4px 4px;padding:10px;font-size:13px}
          table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
          thead th{background:#e6f0fa;color:#0f172a;padding:10px;text-align:left;border-bottom:1px solid #c7d7ee}
          tbody td{padding:8px;border-bottom:1px solid #e5e7eb}
          .summary{margin-top:16px;display:flex;justify-content:flex-end}
          .sum-table{width:360px;border-collapse:collapse}
          .sum-table td{padding:8px;border-bottom:1px solid #e5e7eb}
          .sum-table tr:last-child td{border-bottom:none}
          .sum-label{text-align:left;color:#374151}
          .sum-value{text-align:right;font-weight:600}
          .grand{font-size:16px;font-weight:800;color:#111827}
          .footer{margin-top:18px;text-align:center;color:#6b7280;font-size:12px}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">
              <img src="${logo}" alt="Logo" />
              <div>
                <div class="name">SHOPLYEASY</div>
                <div style="font-size:12px;color:#374151">Votre entreprise • Adresse • Tunisie</div>
                <div style="font-size:12px;color:#374151">Tél: — • Email: —</div>
              </div>
            </div>
            <div class="facture-badge">FACTURE</div>
          </div>

          <div class="info-grid">
            <div class="company">
              <div style="font-weight:700;margin-bottom:6px;color:#111827">Informations facture</div>
              <div><span class="label">N° Facture:</span> ${order._id.slice(-8)}</div>
              <div><span class="label">Date:</span> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}</div>
              <div><span class="label">Client:</span> ${order.name}</div>
              ${order.phone ? `<div><span class="label">Téléphone:</span> ${order.phone}</div>` : ''}
              ${order.email ? `<div><span class="label">Email:</span> ${order.email}</div>` : ''}
            </div>
            <div class="company">
              <div style="font-weight:700;margin-bottom:6px;color:#111827">Adresse d’expédition</div>
              <div>${order.address || ''}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">DÉTAILS</div>
            <div class="section-box">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qté</th>
                    <th>Prix</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows}
                </tbody>
              </table>
            </div>
          </div>

          <div class="summary">
            <table class="sum-table">
              <tr><td class="sum-label">Sous‑total</td><td class="sum-value">${subTotal.toFixed(2)} DT</td></tr>
              <tr><td class="sum-label">TVA (${vat.toFixed(2)}%)</td><td class="sum-value">${vatAmount.toFixed(2)} DT</td></tr>
              <tr><td class="sum-label">Frais de livraison</td><td class="sum-value">${shippingAmount.toFixed(2)} DT</td></tr>
              <tr><td class="sum-label grand">Total TTC</td><td class="sum-value grand">${grandTotal.toFixed(2)} DT</td></tr>
            </table>
          </div>
          <div class="footer">Merci pour votre confiance.</div>
        </div>
      </body>
    </html>`)
    w.document.close()
    setTimeout(() => w.print(), 200)
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'en_attente':
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Package, description: 'Non confirmée' }
      case 'en_cours':
        return { label: 'En cours', color: 'bg-orange-100 text-orange-700', icon: Phone, description: 'Message Facebook/Instagram/WhatsApp' }
      case 'confirmee':
        return { label: 'Confirmée', color: 'bg-blue-100 text-blue-700', icon: CheckCircle, description: 'Client appelé, reçu imprimé, colis préparé' }
      case 'en_livraison':
        return { label: 'En livraison', color: 'bg-purple-100 text-purple-700', icon: Truck, description: 'En cours de livraison' }
      case 'terminee':
        return { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: PackageCheck, description: 'Livrée, montant ajouté aux ventes' }
      default:
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Package, description: 'Non confirmée' }
    }
  }

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('orderId', orderId)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const orderId = e.dataTransfer.getData('orderId')
    if (orderId) {
      handleStatusUpdate(orderId, newStatus)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const statusColumns = [
    { id: 'en_attente', label: 'En attente', description: 'Non confirmée' },
    { id: 'annulee', label: 'Annulée', description: 'Commande annulée' },
    { id: 'en_cours', label: 'En cours', description: 'Message reçu' },
    { id: 'confirmee', label: 'Confirmée', description: 'Reçu imprimé, colis préparé' },
    { id: 'en_livraison', label: 'En livraison', description: 'En cours de livraison' },
    { id: 'terminee', label: 'Terminée', description: 'Livrée' },
  ]

  // Filtrer les commandes (exclure les annulées qui ont plus de 24h et les terminées qui ont plus de 24h)
  const now = new Date()
  const activeOrders = orders.filter((order) => {
    const orderDate = new Date(order.updatedAt || order.createdAt || 0)
    const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60)
    
    // Exclure les annulées de plus de 24h
    if (order.status === 'annulee' && hoursDiff > 24) {
      return false
    }
    
    // Exclure les terminées de plus de 24h (elles vont dans l'historique)
    if ((order.status === 'terminee' || order.status === 'completed') && hoursDiff > 24) {
      return false
    }
    
    return true
  })

  const filteredOrders = activeOrders.filter((order) => {
    const matchesSearch = 
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des commandes...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && orders.length === 0) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchOrders} className="bg-gold hover:bg-gold/90 text-white">
            Réessayer
          </Button>
          </div>
        </div>
      </div>
    )
  }

  const stats = {
    total: activeOrders.length,
    en_attente: activeOrders.filter(o => o.status === 'en_attente' || o.status === 'pending').length,
    en_cours: activeOrders.filter(o => o.status === 'en_cours' || o.status === 'processing').length,
    confirmee: activeOrders.filter(o => o.status === 'confirmee').length,
    en_livraison: activeOrders.filter(o => o.status === 'en_livraison').length,
    terminee: activeOrders.filter(o => o.status === 'terminee' || o.status === 'completed').length,
    annulee: activeOrders.filter(o => o.status === 'annulee' || o.status === 'cancelled').length,
    totalRevenue: activeOrders.filter(o => o.status === 'terminee' || o.status === 'completed').reduce((sum, o) => sum + o.total, 0),
  }

  return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* View Order Dialog */}
            <Dialog open={viewOpen} onOpenChange={setViewOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Commande {viewOrder?._id.slice(-8)}</DialogTitle>
                </DialogHeader>
                {viewOrder && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold text-navy">Client</div>
                        <div>{viewOrder.name}</div>
                        <div className="text-gray-600">{viewOrder.phone}</div>
                        {viewOrder.email && <div className="text-gray-600">{viewOrder.email}</div>}
                      </div>
                      <div>
                        <div className="font-semibold text-navy">Infos</div>
                        <div>Statut: {getStatusBadge(viewOrder.status)}</div>
                        <div>Date: {viewOrder.createdAt ? new Date(viewOrder.createdAt).toLocaleString('fr-FR') : ''}</div>
                      </div>
                    </div>
                    {viewOrder.address && (
                      <div className="text-sm"><span className="font-semibold">Adresse:</span> {viewOrder.address}</div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 py-1 text-left">Produit</th>
                            <th className="px-2 py-1 text-left">Qté</th>
                            <th className="px-2 py-1 text-left">Prix</th>
                            <th className="px-2 py-1 text-left">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewOrder.items.map((it, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-2 py-1">{it.name}</td>
                              <td className="px-2 py-1">{it.quantity}</td>
                              <td className="px-2 py-1">{it.price.toFixed(2)} DT</td>
                              <td className="px-2 py-1">{(it.price * it.quantity).toFixed(2)} DT</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">Articles: {viewOrder.items.reduce((s,i)=>s+i.quantity,0)}</div>
                      <div className="text-lg font-bold text-gold">Total: {viewOrder.total?.toFixed(2)} DT</div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setViewOpen(false)}>Fermer</Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => printInvoice(viewOrder, vatRate, freeShipping ? 0 : shippingFee)}>
                        <FileText className="h-4 w-4 mr-2" /> Imprimer la facture
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2 flex items-center">
                    <ShoppingBag className="mr-3 h-8 w-8 text-gold" />
                    {t('orderManagement')}
                  </h1>
                  <p className="text-gray-600">{t('manageOrders')}</p>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-sm rounded border ${viewMode==='kanban' ? 'bg-gold text-white border-gold' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Kanban</button>
                  <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 text-sm rounded border ${viewMode==='table' ? 'bg-gold text-white border-gold' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Tableau</button>
                  <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm rounded border ${viewMode==='list' ? 'bg-gold text-white border-gold' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>Liste</button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Rechercher une commande..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gold/20 focus:border-gold focus:ring-gold"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] border-gold/20 focus:border-gold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="en_attente">En attente</SelectItem>
                      <SelectItem value="en_cours">En cours</SelectItem>
                      <SelectItem value="annulee">Annulée</SelectItem>
                      <SelectItem value="confirmee">Confirmée</SelectItem>
                      <SelectItem value="en_livraison">En livraison</SelectItem>
                      <SelectItem value="terminee">Terminée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 mb-8">
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-navy">{stats.total}</div>
                </CardContent>
              </Card>
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">En attente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{stats.en_attente}</div>
                </CardContent>
              </Card>
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">En cours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{stats.en_cours}</div>
                </CardContent>
              </Card>
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Confirmée</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.confirmee}</div>
                </CardContent>
              </Card>
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">En livraison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats.en_livraison}</div>
                </CardContent>
              </Card>
              <Card className="border-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Revenus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gold">{stats.totalRevenue.toFixed(2)} DT</div>
                </CardContent>
              </Card>
            </div>

            {/* Views */}
            {viewMode === 'kanban' && (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {statusColumns.map((column) => {
                  const columnOrders = filteredOrders.filter(order => {
                    const status = order.status || 'en_attente'
                    if (column.id === 'en_attente') return status === 'en_attente' || status === 'pending'
                    if (column.id === 'annulee') return status === 'annulee' || status === 'cancelled'
                    if (column.id === 'en_cours') return status === 'en_cours' || status === 'processing'
                    if (column.id === 'confirmee') return status === 'confirmee'
                    if (column.id === 'en_livraison') return status === 'en_livraison'
                    if (column.id === 'terminee') return status === 'terminee' || status === 'completed'
                    return false
                  })
                  const statusInfo = getStatusInfo(column.id)
                  const Icon = statusInfo.icon

                  return (
                    <div
                      key={column.id}
                      className="flex-shrink-0 w-80"
                      onDrop={(e) => handleDrop(e, column.id)}
                      onDragOver={handleDragOver}
                    >
                      <Card className="border-gold/20 h-full">
                        <CardHeader className={`${statusInfo.color.split(' ')[0]} pb-3`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-5 w-5" />
                              <div>
                                <CardTitle className="text-sm font-bold">{column.label}</CardTitle>
                                <CardDescription className="text-xs mt-1">{column.description}</CardDescription>
                              </div>
                            </div>
                            <Badge className={statusInfo.color}>{columnOrders.length}</Badge>
                          </div>
              </CardHeader>
                        <CardContent className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                          {columnOrders.map((order) => (
                            <motion.div
                          key={order._id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, order._id)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                              className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md transition-shadow"
                        >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <GripVertical className="h-4 w-4 text-gray-400" />
                                    <span className="font-mono text-xs text-gray-500">{order._id.slice(-8)}</span>
                            </div>
                                  <h4 className="font-semibold text-navy mb-1">{order.name}</h4>
                                  <p className="text-sm text-gray-600">{order.phone}</p>
                                </div>
                            </div>
                              <div className="space-y-1 mb-3">
                                {order.items?.slice(0, 2).map((item, idx) => (
                                  <div key={idx} className="text-xs text-gray-600">
                                    • {item.name} x{item.quantity}
                            </div>
                                ))}
                                {order.items && order.items.length > 2 && (
                                  <div className="text-xs text-gray-400">
                                    +{order.items.length - 2} autre(s)
                    </div>
                  )}
                </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="sm" className="h-7 px-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                                    onClick={() => { setViewOrder(order); setViewOpen(true); }}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="outline" size="sm" className="h-7 px-2 text-gold border-gold/30 hover:bg-gold/10"
                                    onClick={() => printInvoice(order, vatRate, freeShipping ? 0 : shippingFee)}>
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                </div>
                                <span className="font-bold text-gold text-sm">{order.total?.toFixed(2)} DT</span>
                                <span className="text-xs text-gray-400">
                                  <Calendar className="h-3 w-3 inline mr-1" />
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : ''}
                                </span>
                              </div>
                            </motion.div>
                          ))}
                          {columnOrders.length === 0 && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                              Aucune commande
                            </div>
                          )}
              </CardContent>
            </Card>
                    </div>
                  )
                })}
              </div>
          </div>
            )}

            {viewMode === 'table' && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-3 py-2 text-left">#</th>
                        <th className="px-3 py-2 text-left">Client</th>
                        <th className="px-3 py-2 text-left">Téléphone</th>
                        <th className="px-3 py-2 text-left">Total</th>
                        <th className="px-3 py-2 text-left">Statut</th>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono text-xs">{order._id.slice(-8)}</td>
                          <td className="px-3 py-2">{order.name}</td>
                          <td className="px-3 py-2">{order.phone}</td>
                          <td className="px-3 py-2 font-semibold text-gold">{order.total?.toFixed(2)} DT</td>
                          <td className="px-3 py-2">{getStatusBadge(order.status)}</td>
                          <td className="px-3 py-2">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}</td>
                          <td className="px-3 py-2">
                            <Button variant="outline" size="sm" className="h-8 px-2"
                              onClick={() => { setViewOrder(order); setViewOpen(true); }}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3 mb-6">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs text-gray-500">{order._id.slice(-8)}</span>
                      <div className="truncate">
                        <div className="font-semibold text-navy truncate">{order.name}</div>
                        <div className="text-xs text-gray-500 truncate">{order.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gold font-bold text-sm">{order.total?.toFixed(2)} DT</span>
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                      <Button variant="outline" size="sm" className="h-8 px-2"
                        onClick={() => { setViewOrder(order); setViewOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
    </div>
  )
}

