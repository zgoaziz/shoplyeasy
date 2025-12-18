"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Search, ShoppingBag, User, LogOut } from "lucide-react"
import { useCart } from "@/components/cart-context"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserData {
  name: string
  email: string
  role: string
}

export function Header() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { items } = useCart()
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  type NavCategory = { _id?: string; name: string }
  const [categories, setCategories] = useState<NavCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUser()
    fetchCategories()
  }, [])

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories/public', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      const cats: NavCategory[] = (data.categories || []).map((c: any) => ({ _id: c._id, name: c.name }))
      setCategories(cats)
    } catch (e) {
      // ignore
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = searchTerm.trim()
      router.push(q ? `/menu?search=${encodeURIComponent(q)}` : '/menu')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-[#005ea6] text-white shadow-sm">
      <div className="mx-0 max-w-7xl pl-10 pr-2 sm:pl-14 sm:pr-4 lg:pl-20 lg:pr-6">
        <div className="flex flex-col gap-2 py-2">
          <div className="flex items-center gap-6">
            <Link href="/" className="shrink-0">
              <Image
                src="/logoarab.png"
                alt="ShoplyEasy"
                width={260}
                height={90}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            <div className="flex-1 hidden md:flex justify-center">
              <div className="relative w-full max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
                <input
                  type="search"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full rounded-full border border-[#cfe0f5] bg-white py-2.5 pl-11 pr-4 text-sm text-[#0d507d] placeholder:text-gray-500 caret-[#005ea6] outline-none focus:ring-2 focus:ring-[#88b6e8]"
                />
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              {!isLoading && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/10 text-white">
                      <Avatar className="h-10 w-10 border border-[#e1ecfb]">
                        <AvatarFallback className="bg-white/20 text-white font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white text-gray-800 border shadow-lg z-[60]">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </DropdownMenuItem>
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" className="h-10 w-10 rounded-full hover:bg-white/10 text-white">
                    <User className="h-5 w-5 text-white" />
                  </Button>
                </Link>
              )}

              <Link href="/panier" className="flex items-center gap-2">
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-white/10 text-white">
                  <ShoppingBag className="h-5 w-5 text-white" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 rounded-full bg-white text-[#005ea6] px-1.5 py-0.5 text-xs font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
                <span className="text-sm font-semibold">{cartTotal.toFixed(2)} DT</span>
              </Link>

              {/* Removed settings icon as requested */}
            </div>
          </div>

          <div className="md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#005ea6]" />
              <input
                type="search"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="w-full rounded-full border border-[#cfe0f5] bg-white py-2.5 pl-11 pr-4 text-sm text-[#0d507d] placeholder:text-gray-500 caret-[#005ea6] outline-none focus:ring-2 focus:ring-[#88b6e8]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-white/20 bg-white text-[#0d507d]">
        <div className="mx-0 max-w-7xl pl-10 pr-2 sm:pl-14 sm:pr-4 lg:pl-20 lg:pr-6">
          <nav className="flex items-center justify-center gap-4 overflow-x-auto py-1.5 text-sm">
            {categories.map((cat) => (
              <Link
                key={cat._id || cat.name}
                href={`/menu?category=${encodeURIComponent(cat.name)}`}
                className="rounded-full px-2.5 py-1 text-[#0d507d] transition-all hover:bg-[#eaf3ff] hover:text-[#0d507d]"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

