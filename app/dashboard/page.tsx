"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingBag, Package, Users, DollarSign, TrendingUp, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type LinePoint = { date: string; amount: number }
type BarPoint = { date: string; count: number }

function LineChart({ data, height = 220, color = "#005ea6" }: { data: LinePoint[]; height?: number; color?: string }) {
  const width = 700
  const padding = 32
  const values = data.map(d => d.amount)
  const max = Math.max(1, ...values)
  const step = (width - padding * 2) / Math.max(1, data.length - 1)
  const points = data.map((d, i) => {
    const x = padding + i * step
    const y = height - padding - (d.amount / max) * (height - padding * 2)
    return `${x},${y}`
  }).join(" ")
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-gray-50 rounded-lg">
      <polyline fill="none" stroke={color} strokeWidth="3" points={points} />
    </svg>
  )
}

function BarChart({ data, height = 220, color = "#c89b3c" }: { data: BarPoint[]; height?: number; color?: string }) {
  const width = 700
  const padding = 32
  const values = data.map(d => d.count)
  const max = Math.max(1, ...values)
  const barW = (width - padding * 2) / Math.max(1, data.length)
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="bg-gray-50 rounded-lg">
      {data.map((d, i) => {
        const x = padding + i * barW
        const h = (d.count / max) * (height - padding * 2)
        const y = height - padding - h
        return <rect key={i} x={x + 2} y={y} width={barW - 4} height={h} fill={color} rx={3} />
      })}
    </svg>
  )
}

function Donut({ data, height = 220, colors = ["#f59e0b", "#fb923c", "#3b82f6", "#a855f7", "#10b981", "#ef4444"] }: { data: Record<string, number>; height?: number; colors?: string[] }) {
  const entries = Object.entries(data)
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1
  const size = height
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10
  let angle = -Math.PI / 2
  const arcs = entries.map(([k, v], idx) => {
    const portion = v / total
    const endAngle = angle + portion * Math.PI * 2
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)
    const largeArc = endAngle - angle > Math.PI ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
    angle = endAngle
    return { d, color: colors[idx % colors.length], label: k, value: v }
  })
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="bg-gray-50 rounded-lg">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#fff" />
      </svg>
      <div className="text-sm">
        {arcs.map((a, i) => (
          <div key={i} className="flex items-center gap-2"><span className="inline-block w-3 h-3 rounded" style={{ backgroundColor: a.color }}></span>{a.label}: {a.value}</div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [] as any[],
    revenueSeries: [] as { date: string; amount: number }[],
    ordersSeries: [] as { date: string; count: number }[],
    statusCounts: {} as Record<string, number>
  })

  useEffect(() => {
    fetchUser()
    fetchDashboardStats()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        console.log('Auth check failed - redirecting to login') // Debug
        window.location.href = '/login'
        return
      }
      
      const data = await response.json()
      console.log('User data from /api/auth/me:', data) // Debug
      
      if (!data.user || data.user.role !== 'admin') {
        console.log('Not admin - redirecting to menu. Role:', data.user?.role) // Debug
        window.location.href = '/menu'
        return
      }
      
      setUser(data.user)
    } catch (error) {
      console.error('Error fetching user:', error)
      window.location.href = '/login'
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardStats = async () => {
    try {
      // Récupérer les statistiques depuis les APIs
      const [ordersRes, productsRes, usersRes, salesRes] = await Promise.all([
        fetch('/api/orders', { credentials: 'include' }),
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/users', { credentials: 'include' }),
        fetch('/api/sales', { credentials: 'include' })
      ])

      const ordersData = ordersRes.ok ? await ordersRes.json() : { orders: [] }
      const productsData = productsRes.ok ? await productsRes.json() : { products: [] }
      const usersData = usersRes.ok ? await usersRes.json() : { users: [] }
      const salesData = salesRes.ok ? await salesRes.json() : { sales: [] }

      const orders = ordersData.orders || []
      const products = productsData.products || []
      const users = usersData.users || []
      const sales = salesData.sales || []

      // Calculer les statistiques
      const completedOrders = orders.filter((o: any) => 
        o.status === 'terminee' || o.status === 'completed'
      )
      const totalSales = sales.reduce((sum: number, s: any) => sum + (s.total || 0), 0)
      const totalOrdersRevenue = completedOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)

      // Commandes récentes (5 dernières)
      const recentOrders = orders
        .filter((o: any) => o.status !== 'annulee')
        .sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt || 0).getTime()
          const dateB = new Date(b.createdAt || 0).getTime()
          return dateB - dateA
        })
        .slice(0, 5)
        .map((order: any) => ({
          id: `#${order._id?.slice(-4) || 'N/A'}`,
          customer: order.name,
          amount: `${order.total?.toFixed(2) || '0'} DT`,
          status: order.status === 'terminee' || order.status === 'completed' ? 'Livré' :
                 order.status === 'en_cours' || order.status === 'processing' ? 'En cours' :
                 order.status === 'en_livraison' ? 'En livraison' :
                 order.status === 'confirmee' ? 'Confirmée' : 'En attente'
        }))

      const days = 14
      const pad = (n: number) => String(n).padStart(2, '0')
      const today = new Date()
      const seriesDates: string[] = Array.from({ length: days }).map((_, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (days - 1 - i))
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      })
      const revenueMap: Record<string, number> = {}
      const ordersMap: Record<string, number> = {}
      seriesDates.forEach(d => { revenueMap[d] = 0; ordersMap[d] = 0 })
      sales.forEach((s: any) => {
        const d = new Date(s.createdAt || 0)
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        if (key in revenueMap) revenueMap[key] += s.total || 0
      })
      completedOrders.forEach((o: any) => {
        const d = new Date(o.createdAt || 0)
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        if (key in revenueMap) revenueMap[key] += o.total || 0
      })
      orders.forEach((o: any) => {
        const d = new Date(o.createdAt || 0)
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        if (key in ordersMap) ordersMap[key] += 1
      })
      const revenueSeries = seriesDates.map(d => ({ date: d, amount: Number((revenueMap[d] || 0).toFixed(2)) }))
      const ordersSeries = seriesDates.map(d => ({ date: d, count: ordersMap[d] || 0 }))
      const statusCounts = {
        en_attente: orders.filter((o: any) => o.status === 'en_attente' || o.status === 'pending').length,
        en_cours: orders.filter((o: any) => o.status === 'en_cours' || o.status === 'processing').length,
        confirmee: orders.filter((o: any) => o.status === 'confirmee').length,
        en_livraison: orders.filter((o: any) => o.status === 'en_livraison').length,
        terminee: orders.filter((o: any) => o.status === 'terminee' || o.status === 'completed').length,
        annulee: orders.filter((o: any) => o.status === 'annulee' || o.status === 'cancelled').length,
      }
      setStats({
        totalSales: totalSales + totalOrdersRevenue,
        totalOrders: orders.filter((o: any) => o.status !== 'annulee').length,
        totalProducts: products.filter((p: any) => p.isActive !== false).length,
        totalUsers: users.length,
        recentOrders,
        revenueSeries,
        ordersSeries,
        statusCounts,
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }
  const statsCards = [
    {
      title: "Total des ventes",
      value: `${stats.totalSales.toFixed(2)} DT`,
      change: "",
      icon: <DollarSign className="h-6 w-6" />,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Commandes",
      value: stats.totalOrders.toString(),
      change: "",
      icon: <ShoppingBag className="h-6 w-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Produits",
      value: stats.totalProducts.toString(),
      change: "",
      icon: <Package className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Clients",
      value: stats.totalUsers.toString(),
      change: "",
      icon: <Users className="h-6 w-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">Bienvenue sur votre tableau de bord ShoplyEasy</p>
            </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-gold/20 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                  <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-navy mb-1">{stat.value}</div>
                  {stat.change && (
                    <p className="text-xs text-green-600 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts and Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="text-navy">Commandes récentes</CardTitle>
                <CardDescription>Les dernières commandes reçues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-navy">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gold">{order.amount}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === "Livré"
                              ? "bg-green-100 text-green-700"
                              : order.status === "En cours"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "En livraison"
                              ? "bg-purple-100 text-purple-700"
                              : order.status === "Confirmée"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucune commande récente</p>
                  )}
                </div>
                <Link href="/dashboard/commandes" className="block mt-4">
                  <Button variant="outline" className="w-full border-gold text-gold hover:bg-gold/10">
                    Voir toutes les commandes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="text-navy">Actions rapides</CardTitle>
                <CardDescription>Accès rapide aux fonctionnalités</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/product">
                    <Button className="w-full bg-gold hover:bg-gold/90 text-white h-20 flex-col">
                      <Package className="h-5 w-5 mb-2" />
                      Produits
                    </Button>
                  </Link>
                  <Link href="/dashboard/users">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-20 flex-col">
                      <Users className="h-5 w-5 mb-2" />
                      Utilisateurs
                    </Button>
                  </Link>
                  <Link href="/dashboard/contact">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white h-20 flex-col">
                      <Mail className="h-5 w-5 mb-2" />
                      Contacts
                    </Button>
                  </Link>
                  <Link href="/dashboard/vente">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white h-20 flex-col">
                      <DollarSign className="h-5 w-5 mb-2" />
                      Ventes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="text-navy">Performance des ventes</CardTitle>
              <CardDescription>Évolution sur 14 jours</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart data={stats.revenueSeries || []} height={220} color="#005ea6" />
            </CardContent>
          </Card>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="text-navy">Répartition des statuts</CardTitle>
              <CardDescription>Commandes par statut</CardDescription>
            </CardHeader>
            <CardContent>
              <Donut data={stats.statusCounts || {}} height={220} colors={["#f59e0b","#fb923c","#3b82f6","#a855f7","#10b981","#ef4444"]} />
            </CardContent>
          </Card>
          <Card className="border-gold/20">
            <CardHeader>
              <CardTitle className="text-navy">Commandes quotidiennes</CardTitle>
              <CardDescription>Sur 14 jours</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={stats.ordersSeries || []} height={220} color="#c89b3c" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

