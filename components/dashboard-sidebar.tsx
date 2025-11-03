"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  Package,
  Mail,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Tag,
  Award,
  DollarSign,
  ImageIcon,
  Bell,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/contexts/translation-context"

const getMenuItems = (t: (key: string) => string) => [
  {
    title: t('dashboard'),
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: t('users'),
    icon: Users,
    href: "/dashboard/users",
  },
  {
    title: t('products'),
    icon: Package,
    href: "/dashboard/product",
  },
  {
    title: t('categories'),
    icon: Tag,
    href: "/dashboard/categories",
  },
  {
    title: t('brands'),
    icon: Award,
    href: "/dashboard/brands",
  },
  {
    title: t('contacts'),
    icon: Mail,
    href: "/dashboard/contact",
  },
  {
    title: t('orders'),
    icon: ShoppingBag,
    href: "/dashboard/commandes",
  },
  {
    title: t('sales'),
    icon: DollarSign,
    href: "/dashboard/vente",
  },
  {
    title: 'Publicités',
    icon: ImageIcon,
    href: "/dashboard/advertisements",
  },
  {
    title: 'Notifications',
    icon: Bell,
    href: "/dashboard/notification",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, t } = useTranslation()
  const [user, setUser] = useState<any>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const menuItems = getMenuItems(t)

  useEffect(() => {
    fetchUser()
    // Détecter si on est sur desktop
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setUser(data.user)
    } catch (error) {
      router.push('/login')
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="border-gold text-gold hover:bg-gold/10"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-white border-r border-gold/20 z-40 transition-transform duration-300",
          "flex flex-col shadow-lg lg:shadow-none",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gold/20">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h2 className="font-bold text-navy text-lg">ShoplyEasy</h2>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gold/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <span className="text-gold font-bold">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-navy text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-gold text-white"
                    : "text-navy hover:bg-gold/10 hover:text-gold"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gold/20 space-y-2">
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === "/dashboard/settings"
                  ? "bg-gold text-white"
                  : "text-navy hover:text-gold hover:bg-gold/10"
              )}
            >
              <Settings className="h-4 w-4 mr-3" />
              {t('settings')}
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}

