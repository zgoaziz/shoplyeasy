"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, Eye, ShoppingBag, Share2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "./cart-context";

interface Product {
  id?: string
  _id?: string
  name: string
  nameAr?: string
  nameDerja?: string
  description: string
  descriptionAr?: string
  descriptionDerja?: string
  price: number
  purchasePrice?: number
  promoPrice?: number
  image: string
  categories?: string[]
  category?: string  // Support both formats
  sizes?: { size: string; stock: number }[]
  colors?: { color: string; colorCode?: string; stock?: number }[]
  ingredients?: string[]
  allergens?: string[]
  gallery?: string[]
  stock?: number
  barcode?: string
  isActive?: boolean
  isNew?: boolean
  isPromo?: boolean
  availableOnOrder?: boolean
}

interface ProductCardProps {
  product: Product
  variant?: 'grid' | 'list'
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart } = useCart();
  const router = useRouter();
  const productHref = `/product/${product.id || product._id}`
  const goTo = () => router.push(productHref)

  // Calculer le stock total
  const getTotalStock = () => {
    if (product.sizes && product.sizes.length > 0) {
      return product.sizes.reduce((sum, s) => sum + s.stock, 0)
    }
    if (product.colors && product.colors.length > 0) {
      return product.colors.reduce((sum, c) => sum + (c.stock || 0), 0)
    }
    return product.stock || 0
  }

  const totalStock = getTotalStock()
  const isAvailableOnOrder = product.availableOnOrder && totalStock === 0

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    // Ici vous pouvez ajouter la logique pour sauvegarder en localStorage ou API
    if (!isFavorite) {
      // Ajouter aux favoris
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const productId = product.id || product._id
      if (!favorites.find((fav: any) => (fav.id || fav._id) === productId)) {
        favorites.push(product)
        localStorage.setItem('favorites', JSON.stringify(favorites))
      }
    } else {
      // Retirer des favoris
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const productId = product.id || product._id
      const updatedFavorites = favorites.filter((fav: any) => (fav.id || fav._id) !== productId)
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `${window.location.origin}/product/${product.id || product._id}`,
        })
      } catch (error) {
        console.log('Erreur lors du partage:', error)
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Share
      const url = `${window.location.origin}/product/${product.id || product._id}`
      navigator.clipboard.writeText(url).then(() => {
        alert('Lien copié dans le presse-papiers!')
      }).catch(() => {
        // Fallback si clipboard n'est pas disponible
        const textArea = document.createElement('textarea')
        textArea.value = url
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        alert('Lien copié dans le presse-papiers!')
      })
    }
  }

  if (variant === 'list') {
    return (
      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
        <Card className="overflow-hidden border border-gray-100 shadow-sm group cursor-pointer" onClick={goTo}>
          <div className="flex items-stretch gap-4 p-3">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-md overflow-hidden shrink-0">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={productHref} className="block" onClick={(e) => e.stopPropagation()}>
                <h3 className="font-medium text-base sm:text-lg text-navy line-clamp-1 group-hover:text-gold transition-colors">{product.name}</h3>
              </Link>
              <p className="text-gray-600 text-sm line-clamp-2 mt-1">{product.description}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-baseline gap-2">
                  {product.isPromo && product.promoPrice ? (
                    <>
                      <span className="font-semibold text-red-500">{product.promoPrice.toFixed(2)}dt</span>
                      <span className="text-xs text-gray-500 line-through">{product.price.toFixed(2)}dt</span>
                    </>
                  ) : (
                    <span className="font-semibold text-gold">{product.price.toFixed(2)}dt</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white border border-gold/30 text-gold hover:bg-gold/10 h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); addToCart({
                      id: product.id || product._id || '',
                      name: product.name,
                      price: product.isPromo && product.promoPrice ? product.promoPrice : product.price,
                      image: product.image
                    }); }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white border border-gold/30 text-gold hover:bg-gold/10 h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className={`bg-white border border-gold/30 hover:bg-gold/10 h-8 w-8 ${isFavorite ? 'text-red-500' : 'text-gold'}`}
                    onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
                  >
                    <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden border-0 shadow-md h-full group">
        <div
          className="relative aspect-square overflow-hidden cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={goTo}
        >
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className={`object-cover transition-transform duration-700 ${isHovered ? "scale-110" : "scale-100"}`}
          />

          <div
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="bg-white/90 hover:bg-white rounded-full h-10 w-10 text-gold"
                onClick={(e) => { e.stopPropagation(); addToCart({
                  id: product.id || product._id || '',
                  name: product.name,
                  price: product.isPromo && product.promoPrice ? product.promoPrice : product.price,
                  image: product.image
                }); }}
              >
                <ShoppingBag className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="bg-white/90 hover:bg-white rounded-full h-10 w-10 text-gold"
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className={`bg-white/90 hover:bg-white rounded-full h-10 w-10 ${isFavorite ? 'text-red-500' : 'text-gold'}`}
                onClick={(e) => { e.stopPropagation(); handleFavorite(); }}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.isNew && (
              <Badge className="bg-green-500 hover:bg-green-600 text-white">Nouveau</Badge>
            )}
            {product.isPromo && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white">Promo</Badge>
            )}
            {!product.isNew && !product.isPromo && (
              <>
                {product.categories && product.categories.length > 0 && (
              <Badge className="bg-gold hover:bg-gold/90 text-white">{product.categories[0]}</Badge>
                )}
                {(!product.categories || product.categories.length === 0) && product.category && (
                  <Badge className="bg-gold hover:bg-gold/90 text-white">{product.category}</Badge>
                )}
              </>
            )}
          </div>

          {/* Badge "Sur commande" si disponible sur commande et pas de stock */}
          {isAvailableOnOrder && (
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Sur commande</Badge>
            </div>
          )}

          {/* Top-right quick actions removed to avoid duplication; actions are in overlay */}
        </div>

        <CardContent className="p-4 bg-white">
          <Link href={`/product/${product.id || product._id}`} className="block">
            <h3 className="font-medium text-lg text-navy group-hover:text-gold transition-colors">{product.name}</h3>
          </Link>

          <p className="text-gray-600 text-sm line-clamp-2 mt-1 mb-3">{product.description}</p>

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              {product.isPromo && product.promoPrice ? (
                <>
                  <span className="font-semibold text-red-500">{product.promoPrice.toFixed(2)}dt</span>
                  <span className="text-xs text-gray-500 line-through">{product.price.toFixed(2)}dt</span>
                </>
              ) : (
                <span className="font-semibold text-gold">{product.price.toFixed(2)}dt</span>
              )}
            </div>
            <div className="h-px w-12 bg-gray-200"></div>
            <div className="flex items-center text-sm text-gray-500">
              {product.ingredients && product.ingredients.length > 0 ? (
                <>
                  {product.ingredients.slice(0, 2).map((ingredient, index) => (
                    <span key={index} className="inline-block">
                      {index > 0 && ", "}
                      {ingredient}
                    </span>
                  ))}
                  {product.ingredients.length > 2 && "..."}
                </>
              ) : (
                <span className="text-xs text-gray-400">Aucun ingrédient</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

