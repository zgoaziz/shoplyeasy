"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Star, Award, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ImageSlider } from "@/components/image-slider"
import { ProductCard } from "@/components/product-card"
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards"
import { LogoMarquee } from "@/components/ui/logo-marquee"

interface Advertisement {
  _id: string
  image: string
  video?: string
  type?: 'image' | 'video'
  link?: string
  position?: { x: number; y: number; section?: string }
  orientation: 'vertical' | 'horizontal'
  section?: string
  isActive: boolean
}

interface Brand {
  _id: string
  name: string
  image?: string
}

interface Category {
  _id: string
  name: string
  categoryType?: string
}

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
  stock?: number
  isActive?: boolean
  isNew?: boolean
  isPromo?: boolean
  availableOnOrder?: boolean
}

// Sample slider images
const sliderImages = [
  {
    url: "/pict1.jpg",
    alt: "Boutique en ligne",
    title: "Votre Boutique en Ligne",
  },
  {
    url: "/pict2.jpg",
    alt: "Produits de qualité",
    title: "Produits de Qualité & Élégants",
  },
  {
    url: "/pict3.jpg",
    alt: "Sélection premium",
    title: "Sélection Premium Authentique",
  },
]

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingAds, setLoadingAds] = useState(true)
  const [loadingBrands, setLoadingBrands] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    setIsLoaded(true)
    fetchAdvertisements()
    fetchBrands()
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch('/api/advertisements?public=true')
      if (response.ok) {
        const data = await response.json()
        setAdvertisements(data.advertisements || [])
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
    } finally {
      setLoadingAds(false)
    }
  }

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands/public')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    } finally {
      setLoadingBrands(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products/public')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/public')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  // Grouper les produits par catégorie
  const getProductsByCategory = (categoryId: string) => {
    return products.filter(p => {
      if (p.isActive === false) return false
      // Vérifier si le produit appartient à cette catégorie
      const productCategoryId = p.category
      const productCategories = p.categories || []
      return productCategoryId === categoryId || productCategories.includes(categoryId)
    }).slice(0, 4) // Limiter à 4 produits par catégorie
  }

  // Organiser les publicités par section et orientation
  const getAdsBySection = (section: string) => {
    return advertisements.filter(ad => {
      // Vérifier si la publicité a au moins une image ou une vidéo
      const hasMedia = (ad.type === 'video' && ad.video) || (ad.image && ad.image.trim() !== '')
      // Certaines anciennes entrées sauvegardent la section dans position.section
      const sectionMatch = ad.section === section || ad.position?.section === section
      return sectionMatch && ad.isActive && hasMedia
    })
  }

  const horizontalAds = getAdsBySection('hero').filter(ad => ad.orientation === 'horizontal')
  const verticalAds = getAdsBySection('main').filter(ad => ad.orientation === 'vertical')

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section with Dynamic Advertisements */}
      <section className="w-full min-h-[100svh] relative">
        {loadingAds ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
          </div>
        ) : horizontalAds.length > 0 ? (
          <div className="absolute inset-0">
            <ImageSlider 
              images={horizontalAds.map(ad => ({
                url: (ad.type === 'video' && ad.video) ? ad.video : ad.image,
                alt: 'Publicité',
                title: '',
                type: ad.type || 'image'
              }))} 
            />
          </div>
        ) : (
          <div className="absolute inset-0">
            <ImageSlider 
              images={sliderImages.map(img => ({
                url: img.url,
                alt: img.alt,
                title: img.title,
                type: 'image',
              }))}
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-3xl w-full"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-4 sm:mb-6 inline-block"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
                <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-ping"></div>
                <div className="absolute inset-0 rounded-full border-2 border-gold/60"></div>
                <div className="absolute inset-2 rounded-full bg-gold/20 backdrop-blur-sm"></div>
                <div className="absolute inset-0 flex items-center justify-center text-white font-serif text-xl sm:text-2xl font-bold">SE</div>
              </div>
            </motion.div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-4 sm:mb-6">
              <span className="block">ShoplyEasy</span>
              <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-light block mt-2 sm:mt-4 uppercase tracking-widest">
                Votre Destination Shopping en Ligne
              </span>
            </h1>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}>
              <div className="w-16 sm:w-24 h-0.5 bg-gold mx-auto my-4 sm:my-6"></div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <Button size="lg" className="mt-4 sm:mt-6 bg-gold hover:bg-gold/90 text-white rounded-none px-6 sm:px-8 text-sm sm:text-base" asChild>
                <Link href="/menu">
                  Découvrir nos produits
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 sm:bottom-10 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="flex flex-col items-center text-white">
            <div className="text-xs uppercase tracking-widest mb-2">Découvrir</div>
            <div className="w-0.5 h-8 sm:h-10 bg-white/30 relative">
              <motion.div
                className="absolute top-0 w-full h-1/3 bg-gold"
                animate={{
                  top: ["0%", "66%", "0%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section - Animated and Attractive */}
      <section className="relative w-full py-16 sm:py-20 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12"
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-serif font-bold text-navy"
            >
              Pourquoi choisir <span className="text-gold">ShoplyEasy</span> ?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Découvrez une nouvelle expérience d’achat en ligne : commandez facilement, payez à la livraison, et profitez d’une qualité garantie.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {(() => {
              const features = [
                {
                  title: "Produits de Qualité",
                  description:
                    "Large sélection de produits authentiques et de qualité supérieure, soigneusement sélectionnés.",
                },
                {
                  title: "Meilleur Prix Garanti",
                  description:
                    "Des prix compétitifs et des offres exclusives pour vous offrir la meilleure valeur.",
                },
                {
                  title: "Livraison Express",
                  description:
                    "Livraison rapide et sécurisée partout en Tunisie. Recevez vos commandes en temps record.",
                },
                {
                  title: "Support Client 7j/7",
                  description: "Assistance réactive pour vous accompagner à tout moment.",
                },
                {
                  title: "Paiement Sécurisé",
                  description: "Transactions protégées et méthodes de paiement fiables.",
                },
              ]

              const items = features.map(f => ({
                quote: `${f.title} — ${f.description}`,
                name: "ShoplyEasy",
                title: "",
              }))

              return (
                <div className="max-w-6xl mx-auto">
                  <InfiniteMovingCards items={items} direction="right" speed="slow" />
                </div>
              )
            })()}
          </motion.div>

          {/* Decorative Floating Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-16 left-8 w-40 h-40 bg-gold/10 blur-3xl rounded-full animate-pulse" />
            <div className="absolute bottom-8 right-8 w-48 h-48 bg-blue-200/20 blur-3xl rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Dynamic Advertisements Section */}
      {!loadingAds && advertisements.length > 0 && (
        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10 sm:mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy mb-4">Nos Publicités</h2>
              <div className="w-20 sm:w-24 h-1 bg-gold mx-auto"></div>
            </motion.div>
            
            {/* Horizontal Ads Grid - Plus grandes et attrayantes */}
            {horizontalAds.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
                {horizontalAds.slice(0, 6).map((ad, index) => (
            <motion.div
                    key={ad._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    style={{
                      aspectRatio: ad.orientation === 'horizontal' ? '16/9' : '9/16',
                      minHeight: '280px',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    {ad.link ? (
                      <Link href={ad.link} className="block w-full h-full">
                        {(ad.type === 'video' && ad.video) ? (
                          <video
                            src={ad.video}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : ad.image ? (
                          <Image
                            src={ad.image}
                            alt="Advertisement"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : null}
                      </Link>
                    ) : (
                      <>
                        {(ad.type === 'video' && ad.video) ? (
                          <video
                            src={ad.video}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : ad.image ? (
                          <Image
                            src={ad.image}
                            alt="Advertisement"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : null}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Vertical Ads if any */}
            {verticalAds.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {verticalAds.map((ad, index) => (
          <motion.div
                    key={ad._id}
                    initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                    style={{
                      aspectRatio: '9/16',
                      minHeight: '400px',
                    }}
          >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    {ad.link ? (
                      <Link href={ad.link} className="block w-full h-full">
                        {(ad.type === 'video' && ad.video) ? (
                          <video
                            src={ad.video}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : ad.image ? (
                          <Image
                            src={ad.image}
                            alt="Advertisement"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : null}
                      </Link>
                    ) : (
                      <>
                        {(ad.type === 'video' && ad.video) ? (
                          <video
                            src={ad.video}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            autoPlay
                            loop
                            muted
                            playsInline
                          />
                        ) : ad.image ? (
                          <Image
                            src={ad.image}
                            alt="Advertisement"
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : null}
                      </>
                    )}
          </motion.div>
                ))}
          </div>
            )}
        </div>
      </section>
      )}

      {/* Brands Section (animated single row) */}
      {!loadingBrands && brands.length > 0 && (
        <section className="w-full py-12 sm:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy mb-4">Nos Marques Partenaires</h2>
              <div className="w-16 sm:w-20 h-0.5 bg-gold mx-auto"></div>
            </motion.div>

            {(() => {
              const items = brands.map((b) => ({
                src: b.image || "",
                alt: b.name,
              }))
              return <LogoMarquee items={items} direction="right" speed="normal" height={64} />
            })()}
          </div>
        </section>
      )}

      {/* Products by Category Section */}
      {!loadingProducts && !loadingCategories && categories.length > 0 && (
        <section className="w-full py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {categories.map((category, categoryIndex) => {
              const categoryProducts = getProductsByCategory(category._id)
              if (categoryProducts.length === 0) return null

              return (
          <motion.div
                  key={category._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                  className="mb-12 sm:mb-16"
          >
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-navy mb-2">{category.name}</h2>
                      <div className="w-16 sm:w-20 h-0.5 bg-gold"></div>
                    </div>
              <Button
                      asChild
                variant="outline"
                      className="border-gold text-gold hover:bg-gold/10"
              >
                      <Link href={`/menu?category=${category._id}`}>
                        Voir plus
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
              </Button>
            </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {categoryProducts.map((product) => {
                      const productId = product._id || product.id
                      return (
                        <motion.div
                          key={productId}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      )
                    })}
                  </div>
          </motion.div>
              )
            })}
        </div>
      </section>
      )}
    </main>
  )
}

