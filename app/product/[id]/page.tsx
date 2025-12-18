"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, Heart, Share2, ShoppingBag, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { useCart } from "@/components/cart-context"

interface Product {
  _id?: string
  id?: string
  name: string
  description: string
  price: number
  promoPrice?: number
  image: string
  category?: string
  categories?: string[]
  sizes?: { size: string; stock: number }[]
  colors?: { color: string; colorCode?: string; stock?: number }[]
  ingredients?: string[]
  allergens?: string[]
  gallery?: string[]
  stock?: number
  isActive?: boolean
  isNew?: boolean
  isPromo?: boolean
  availableOnOrder?: boolean
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")

  useEffect(() => {
    const fetchProduct = async () => {
      if (params.id) {
        const productId = Array.isArray(params.id) ? params.id[0] : params.id
        
        try {
          const response = await fetch(`/api/products/public/${productId}`)
          if (response.ok) {
            const data = await response.json()
            const fetchedProduct = data.product
            setProduct(fetchedProduct)
            setSelectedImage(fetchedProduct.image || "")

            // Check if product is in favorites
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
            const productIdForFav = fetchedProduct._id || fetchedProduct.id
            setIsFavorite(favorites.some((fav: any) => (fav._id || fav.id) === productIdForFav))

            // Fetch random products (not same product, max 6)
            const allProductsResponse = await fetch('/api/products/public')
            if (allProductsResponse.ok) {
              const allProductsData = await allProductsResponse.json()
              const allProducts = allProductsData.products || []
              
              // Mélanger et prendre 8 produits aléatoires
              const shuffled = [...allProducts]
                .filter((p: Product) => {
                  const pId = p._id || p.id
                  return pId !== productId && p.isActive !== false
                })
                .sort(() => 0.5 - Math.random())
                .slice(0, 8)

              setRelatedProducts(shuffled)
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error)
        }
      }
      setIsLoading(false)
    }

    fetchProduct()
  }, [params.id])

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = () => {
    if (product) {
      // Vérifier si une taille est requise
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        alert('Veuillez sélectionner une taille')
        return
      }
      // Vérifier si une couleur est requise
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        alert('Veuillez sélectionner une couleur')
        return
      }

      const productId = product._id || product.id || ''
      const productName = selectedSize ? `${product.name} - Taille ${selectedSize}` : 
                         selectedColor ? `${product.name} - ${selectedColor}` : 
                         product.name
      
      for (let i = 0; i < quantity; i++) {
        addToCart({
          id: productId,
          name: productName,
          price: product.isPromo && product.promoPrice ? product.promoPrice : product.price,
          image: product.image,
          size: selectedSize,
          color: selectedColor
        })
      }
    }
  }

  const handleFavorite = () => {
    if (!product) return

    setIsFavorite(!isFavorite)
    const productId = product._id || product.id
    
    if (!isFavorite) {
      // Ajouter aux favoris
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      if (!favorites.find((fav: any) => (fav._id || fav.id) === productId)) {
        favorites.push(product)
        localStorage.setItem('favorites', JSON.stringify(favorites))
      }
    } else {
      // Retirer des favoris
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
      const updatedFavorites = favorites.filter((fav: any) => (fav._id || fav.id) !== productId)
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites))
    }
  }

  const handleShare = async () => {
    if (!product) return
    const productId = product._id || product.id

    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `${window.location.origin}/product/${productId}`,
        })
      } catch (error) {
        console.log('Erreur lors du partage:', error)
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API Share
      const url = `${window.location.origin}/product/${productId}`
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse w-full max-w-6xl">
          <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="aspect-square bg-gray-200 rounded-sm"></div>
            <div className="space-y-3 sm:space-y-4">
              <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mt-6 sm:mt-8"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Produit non trouvé</h1>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base">Le produit que vous recherchez n&apos;existe pas.</p>
        <Button asChild className="bg-gold hover:bg-gold/90 text-white text-sm sm:text-base">
          <Link href="/menu">Retour au menu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <Button
        variant="ghost"
        className="mb-6 sm:mb-8 text-navy hover:text-gold hover:bg-gold/10 text-sm sm:text-base"
        onClick={() => router.back()}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {/* Product Images */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="sticky top-24">
            <div className="aspect-square relative overflow-hidden mb-4 sm:mb-6 fancy-border">
              <Image src={selectedImage || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>

            {/* Thumbnails */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedImage(product.image)}
                  className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 ${
                    selectedImage === product.image ? "border-gold" : "border-transparent"
                  }`}
                >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>

                {product.gallery.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden border-2 ${
                      selectedImage === img ? "border-gold" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${product.name} - vue ${index + 1}`}
                      width={80}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 sm:space-y-6"
        >
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(product.categories && product.categories.length > 0 ? product.categories : product.category ? [product.category] : []).map((category: string) => (
                <Badge key={category} variant="outline" className="bg-accent text-navy border-gold/20 text-xs sm:text-sm">
                  {category}
                </Badge>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-navy">{product.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              {product.isPromo && product.promoPrice ? (
                <>
                  <p className="text-xl sm:text-2xl font-semibold text-red-500">{product.promoPrice.toFixed(2)}dt</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-400 line-through">{product.price.toFixed(2)}dt</p>
                </>
              ) : (
                <p className="text-xl sm:text-2xl font-semibold text-gold">{product.price.toFixed(2)}dt</p>
              )}
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{product.description}</p>

          {/* Tailles disponibles */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-navy text-sm sm:text-base">Tailles disponibles *</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.filter(s => s.stock > 0).map((sizeItem, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedSize(sizeItem.size)}
                    className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all ${
                      selectedSize === sizeItem.size
                        ? 'border-gold bg-gold text-white'
                        : 'border-gold/20 bg-white text-navy hover:border-gold hover:bg-gold/10'
                    }`}
                  >
                    {sizeItem.size}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="text-xs text-gray-500 mt-2">Taille sélectionnée: {selectedSize}</p>
              )}
            </div>
          )}

          {/* Couleurs disponibles */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-navy text-sm sm:text-base">Couleurs disponibles *</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.filter(c => (c.stock || 0) > 0).map((colorItem, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedColor(colorItem.color)}
                    className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all flex items-center gap-2 ${
                      selectedColor === colorItem.color
                        ? 'border-gold bg-gold text-white'
                        : 'border-gold/20 bg-white text-navy hover:border-gold hover:bg-gold/10'
                    }`}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300" 
                      style={{ backgroundColor: colorItem.colorCode || '#000' }}
                    />
                    {colorItem.color}
                  </button>
                ))}
              </div>
              {selectedColor && (
                <p className="text-xs text-gray-500 mt-2">Couleur sélectionnée: {selectedColor}</p>
              )}
            </div>
          )}

          {/* Stock */}
          {!product.sizes && !product.colors && product.stock !== undefined && (
            <div>
              <h3 className="font-medium mb-2 text-navy text-sm sm:text-base">Stock</h3>
              <p className="text-gray-700">{product.stock > 0 ? `${product.stock} disponibles` : product.availableOnOrder ? 'Sur commande' : 'Épuisé'}</p>
            </div>
          )}

          {product.ingredients && product.ingredients.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-navy text-sm sm:text-base">Ingrédients</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient: string) => (
                  <Badge key={ingredient} variant="secondary" className="bg-accent/50 text-navy border-none text-xs sm:text-sm">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {product.allergens && product.allergens.length > 0 && (
            <div>
              <h3 className="font-medium mb-2 text-navy text-sm sm:text-base">Allergènes</h3>
              <div className="flex flex-wrap gap-2">
                {product.allergens.map((allergen: string) => (
                  <Badge key={allergen} variant="destructive" className="bg-red-50 text-red-700 border-red-200 text-xs sm:text-sm">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-gold/10" />

          <div className="space-y-4">
            <div className="flex items-center">
              <span className="text-navy mr-4 text-sm sm:text-base">Quantité</span>
              <div className="flex items-center border border-gold/20">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-none text-gold hover:bg-gold/10"
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <span className="w-8 sm:w-10 text-center text-sm sm:text-base">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-none text-gold hover:bg-gold/10"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Button 
                size="lg" 
                className="bg-[#d4b483] hover:bg-[#d4b483]/90 text-white rounded-none px-6 sm:px-8 text-sm sm:text-base"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`border-gold rounded-none text-sm sm:text-base ${
                  isFavorite ? 'text-red-500 border-red-500 hover:bg-red-50' : 'text-gold hover:bg-gold/10'
                }`}
                onClick={handleFavorite}
              >
                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-navy hover:text-gold hover:bg-gold/10"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h4 className="text-gold uppercase tracking-wider font-medium mb-2 text-sm sm:text-base">Découvrez aussi</h4>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-navy mb-4">Vous aimerez aussi</h2>
            <div className="w-16 sm:w-20 h-0.5 bg-gold mx-auto"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {relatedProducts.map((product) => {
              const productId = product._id || product.id
              return (
                <motion.div
                  key={productId}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      )}
    </div>
  )
}

