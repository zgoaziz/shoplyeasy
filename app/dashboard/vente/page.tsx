"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DollarSign, Plus, Search, Calendar, Filter, Download, FileText, Pencil, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/contexts/translation-context"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Sale {
  _id: string
  orderId?: string
  customerName: string
  customerPhone?: string
  items: {
    name: string
    price: number
    quantity: number
  }[]
  total: number
  paymentMethod?: string
  receiptNumber?: string
  notes?: string
  createdAt?: string
}

interface UserItem {
  _id: string
  name: string
  email?: string
  phone?: string
}

interface ProductItem {
  _id: string
  name: string
  price: number
}

export default function VentePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [vatRate, setVatRate] = useState<number>(19)
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [freeShipping, setFreeShipping] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<'all' | 'day' | 'month' | 'date'>('all')
  const [filterDate, setFilterDate] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    items: [{ name: "", price: "", quantity: "" }],
    total: "",
    paymentMethod: "",
    receiptNumber: "",
    notes: "",
  })
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editData, setEditData] = useState<Sale | null>(null)
  const [users, setUsers] = useState<UserItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [showCustomerSuggest, setShowCustomerSuggest] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchSales()
    fetchUsers()
    fetchProducts()
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

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const arr: UserItem[] = (data.users || []).map((u: any) => ({ _id: u._id, name: u.name || '', email: u.email, phone: u.phone }))
      setUsers(arr)
    } catch (_) { /* ignore */ }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/public', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const arr: ProductItem[] = (data.products || []).map((p: any) => ({ _id: p._id, name: p.name, price: (p.isPromo && p.promoPrice) ? p.promoPrice : p.price }))
      setProducts(arr)
    } catch (_) { /* ignore */ }
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

  const fetchSales = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/sales', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des ventes')
      }
      
      const data = await response.json()
      setSales(data.sales || [])
    } catch (error: any) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      const arr: UserItem[] = (data.users || []).map((u: any) => ({ _id: u._id, name: u.name || '', email: u.email, phone: u.phone }))
      setUsers(arr)
    } catch (_) { /* ignore */ }
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products/public', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const arr: ProductItem[] = (data.products || []).map((p: any) => ({ _id: p._id, name: p.name, price: (p.isPromo && p.promoPrice) ? p.promoPrice : p.price }))
      setProducts(arr)
    } catch (_) { /* ignore */ }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const saleData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        items: formData.items
          .filter(item => item.name && item.price && item.quantity)
          .map(item => ({
            name: item.name,
            price: parseFloat(item.price),
            quantity: parseInt(item.quantity),
          })),
        total: parseFloat(formData.total) || formData.items.reduce((sum, item) => 
          sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0), 0
        ),
        paymentMethod: formData.paymentMethod,
        receiptNumber: formData.receiptNumber,
        notes: formData.notes,
      }

      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la vente')
      }

      setIsDialogOpen(false)
      resetForm()
      fetchSales()
    } catch (error: any) {
      console.error('Error creating sale:', error)
      alert(error.message || 'Erreur lors de la création de la vente')
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: "", price: "", quantity: "" }]
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
    
    // Recalculer le total
    const total = newItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0), 0
    )
    setFormData(prev => ({ ...prev, total: total.toString() }))
  }

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      items: [{ name: "", price: "", quantity: "" }],
      total: "",
      paymentMethod: "",
      receiptNumber: "",
      notes: "",
    })
  }

  const openEdit = (sale: Sale) => {
    setEditData(sale)
    setIsEditOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editData) return
    try {
      const body = {
        customerName: editData.customerName,
        customerPhone: editData.customerPhone,
        items: editData.items.map(i => ({ name: i.name, price: Number(i.price), quantity: Number(i.quantity) })),
        total: Number(editData.total),
        paymentMethod: editData.paymentMethod,
        receiptNumber: editData.receiptNumber,
        notes: editData.notes,
      }
      const res = await fetch(`/api/sales/${editData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Erreur lors de la mise à jour')
      setIsEditOpen(false)
      setEditData(null)
      fetchSales()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la mise à jour')
    }
  }

  const handleDelete = async (sale: Sale) => {
    const ok = confirm('Supprimer cette vente ? Cette action est irréversible.')
    if (!ok) return
    try {
      const res = await fetch(`/api/sales/${sale._id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      if (sale.orderId) {
        try {
          await fetch(`/api/orders/${sale.orderId}`, { method: 'DELETE', credentials: 'include' })
        } catch (e) {
          // ignore secondary failure; main deletion succeeded
        }
      }
      fetchSales()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la suppression')
    }
  }

  const generateReceiptNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `REC-${year}${month}${day}-${random}`
  }

  const printReceipt = (sale: Sale) => {
    const receiptWindow = window.open('', '_blank')
    if (!receiptWindow) return

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reçu - ${sale.receiptNumber || sale._id.slice(-8)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
            .info { margin: 10px 0; }
            .items { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items th, .items td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-size: 1.2em; font-weight: bold; text-align: right; margin-top: 20px; }
            .footer { margin-top: 40px; text-align: center; font-size: 0.9em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reçu de Vente</h1>
            <p>Numéro: ${sale.receiptNumber || sale._id.slice(-8)}</p>
          </div>
          <div class="info">
            <p><strong>Client:</strong> ${sale.customerName}</p>
            ${sale.customerPhone ? `<p><strong>Téléphone:</strong> ${sale.customerPhone}</p>` : ''}
            <p><strong>Date:</strong> ${new Date(sale.createdAt || '').toLocaleString('fr-FR')}</p>
            ${sale.paymentMethod ? `<p><strong>Méthode de paiement:</strong> ${sale.paymentMethod}</p>` : ''}
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Qté</th>
                <th>Prix</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${sale.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)} DT</td>
                  <td>${(item.price * item.quantity).toFixed(2)} DT</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            Total: ${sale.total.toFixed(2)} DT
          </div>
          ${sale.notes ? `<div class="info"><p><strong>Notes:</strong> ${sale.notes}</p></div>` : ''}
          <div class="footer">
            <p>Merci pour votre achat !</p>
          </div>
        </body>
      </html>
    `)
    receiptWindow.document.close()
    receiptWindow.print()
  }

  const printInvoiceSale = (sale: Sale, vat: number, shipping: number) => {
    const w = window.open('', '_blank')
    if (!w) return
    const rows = sale.items
      .map(i => `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${i.name}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${i.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${i.price.toFixed(2)} DT</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${(i.price * i.quantity).toFixed(2)} DT</td>
      </tr>`)
      .join("")

    const logo = `${window.location.origin}/logo.png`
    const subTotal = sale.items.reduce((s, i) => s + i.price * i.quantity, 0)
    const vatAmount = +(subTotal * (vat / 100)).toFixed(2)
    const shippingAmount = +shipping
    const grandTotal = +(subTotal + vatAmount + shippingAmount).toFixed(2)

    w.document.write(`<!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Facture ${sale.receiptNumber || sale._id.slice(-8)}</title>
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
              <div><span class="label">N° Facture:</span> ${sale.receiptNumber || sale._id.slice(-8)}</div>
              <div><span class="label">Date:</span> ${sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('fr-FR') : ''}</div>
              <div><span class="label">Client:</span> ${sale.customerName}</div>
              ${sale.customerPhone ? `<div><span class="label">Téléphone:</span> ${sale.customerPhone}</div>` : ''}
            </div>
            <div class="company">
              <div style="font-weight:700;margin-bottom:6px;color:#111827">Adresse d’expédition</div>
              <div></div>
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

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customerPhone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale._id.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    
    const saleDate = new Date(sale.createdAt || '')
    const now = new Date()
    
    if (filterType === 'day') {
      return matchesSearch && 
        saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
    }
    
    if (filterType === 'month') {
      return matchesSearch &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
    }
    
    if (filterType === 'date' && filterDate) {
      const filter = new Date(filterDate)
      return matchesSearch &&
        saleDate.getDate() === filter.getDate() &&
        saleDate.getMonth() === filter.getMonth() &&
        saleDate.getFullYear() === filter.getFullYear()
    }
    
    return matchesSearch
  })

  const stats = {
    total: filteredSales.length,
    totalRevenue: filteredSales.reduce((sum, s) => sum + s.total, 0),
    todayRevenue: sales.filter(s => {
      const saleDate = new Date(s.createdAt || '')
      const now = new Date()
      return saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
    }).reduce((sum, s) => sum + s.total, 0),
    monthRevenue: sales.filter(s => {
      const saleDate = new Date(s.createdAt || '')
      const now = new Date()
      return saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
    }).reduce((sum, s) => sum + s.total, 0),
  }

  if (loading) {
    return (
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des ventes...</p>
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
                <DollarSign className="mr-3 h-8 w-8 text-gold" />
                {t('salesManagement')}
              </h1>
              <p className="text-gray-600">{t('manageSales')}</p>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0">
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open)
                if (!open) resetForm()
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-gold hover:bg-gold/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une vente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nouvelle vente</DialogTitle>
                    <DialogDescription>Créez une nouvelle vente manuellement</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Nom du client *</Label>
                        <div className="relative">
                          <Input
                            id="customerName"
                            value={formData.customerName}
                            onChange={(e) => { setFormData({ ...formData, customerName: e.target.value }); setShowCustomerSuggest(true) }}
                            onFocus={() => setShowCustomerSuggest(true)}
                            onBlur={() => setTimeout(() => setShowCustomerSuggest(false), 120)}
                            placeholder="Saisir un nom..."
                            required
                          />
                          {showCustomerSuggest && formData.customerName && (
                            <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                              {users
                                .filter(u => (u.name || '').toLowerCase().includes(formData.customerName.toLowerCase()))
                                .slice(0, 8)
                                .map(u => (
                                  <button
                                    key={u._id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, customerName: u.name, customerPhone: u.phone || formData.customerPhone })}
                                    className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                  >
                                    <div className="text-sm font-medium text-gray-800">{u.name}</div>
                                    <div className="text-xs text-gray-500">{u.phone || u.email || ''}</div>
                                  </button>
                                ))}
                              <div className="px-3 py-2 border-t text-xs text-gray-500">
                                {users.filter(u => (u.name || '').toLowerCase().includes(formData.customerName.toLowerCase())).length === 0 ? 'Aucun client' : 'Sélectionnez un client'}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-1">
                          <Button type="button" variant="outline" size="sm" onClick={() => router.push('/dashboard/users')}>
                            Nouveau client
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="customerPhone">Téléphone</Label>
                        <Input
                          id="customerPhone"
                          value={formData.customerPhone}
                          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Produits</Label>
                      {formData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                          <div className="col-span-5 relative">
                            <Input
                              placeholder="Nom du produit"
                              value={item.name}
                              onChange={(e) => updateItem(index, 'name', e.target.value)}
                              onFocus={() => {/* keep */}}
                            />
                            {item.name && (
                              <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                                {products
                                  .filter(p => p.name.toLowerCase().includes(String(item.name).toLowerCase()))
                                  .slice(0, 10)
                                  .map(p => (
                                    <button
                                      key={p._id}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => {
                                        updateItem(index, 'name', p.name)
                                        updateItem(index, 'price', String(p.price))
                                      }}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-100"
                                    >
                                      <div className="text-sm text-gray-800">{p.name}</div>
                                      <div className="text-xs text-gray-500">{p.price.toFixed(2)} DT</div>
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Prix"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                            className="col-span-3"
                          />
                          <Input
                            type="number"
                            placeholder="Qté"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="col-span-2"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeItem(index)}
                            className="col-span-1"
                            disabled={formData.items.length === 1}
                          >
                            <span className="text-red-600">×</span>
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Button type="button" onClick={addItem} variant="outline" className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un produit
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push('/dashboard/product')}>
                          Nouveau produit
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="total">Total (DT) *</Label>
                        <Input
                          id="total"
                          type="number"
                          step="0.01"
                          value={formData.total}
                          onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Espèces</SelectItem>
                            <SelectItem value="card">Carte</SelectItem>
                            <SelectItem value="mobile">Mobile Money</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="receiptNumber">Numéro de reçu</Label>
                        <div className="flex gap-2">
                          <Input
                            id="receiptNumber"
                            value={formData.receiptNumber}
                            onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                            placeholder="Auto-généré si vide"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFormData({ ...formData, receiptNumber: generateReceiptNumber() })}
                          >
                            Générer
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" className="bg-gold hover:bg-gold/90 text-white">
                        Créer
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher une vente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gold/20 focus:border-gold"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-[150px] border-gold/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="day">Aujourd'hui</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="date">Date spécifique</SelectItem>
                </SelectContent>
              </Select>
              {filterType === 'date' && (
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border-gold/20"
                />
              )}
              <div className="hidden sm:flex items-center gap-2 ml-4">
                <span className="text-sm text-gray-600">TVA %</span>
                <Input type="number" className="w-20" value={vatRate}
                  onChange={(e)=>setVatRate(Number(e.target.value)||0)} />
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={freeShipping} onChange={(e)=>setFreeShipping(e.target.checked)} /> Livraison gratuite
                </label>
                {!freeShipping && (
                  <>
                    <span className="text-sm text-gray-600">Livraison DT</span>
                    <Input type="number" className="w-24" value={shippingFee}
                      onChange={(e)=>setShippingFee(Number(e.target.value)||0)} />
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenu Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gold">{stats.totalRevenue.toFixed(2)} DT</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.todayRevenue.toFixed(2)} DT</div>
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ce Mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.monthRevenue.toFixed(2)} DT</div>
            </CardContent>
          </Card>
        </div>

        {/* Sales Table */}
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-navy">Historique des Ventes</CardTitle>
            <CardDescription>
              {filteredSales.length} vente{filteredSales.length > 1 ? 's' : ''} trouvée{filteredSales.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale, index) => (
                    <motion.tr
                      key={sale._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <TableCell className="font-mono text-xs">
                        {sale.receiptNumber || sale._id.slice(-8)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-navy">{sale.customerName}</div>
                        {sale.customerPhone && (
                          <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {sale.items.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-gold">
                        {sale.total.toFixed(2)} DT
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(sale.createdAt || '').toLocaleDateString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="space-x-2 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printInvoiceSale(sale, vatRate, freeShipping ? 0 : shippingFee)}
                          className="border-gold text-gold hover:bg-gold/10"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Facture
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(sale)}
                          className="hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(sale)}
                          className="hover:bg-red-50 text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Supprimer
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
              {filteredSales.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune vente trouvée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

