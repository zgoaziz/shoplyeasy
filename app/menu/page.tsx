"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Filter, X, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ProductCard } from "@/components/product-card"

interface Product {
  _id?: string
  id?: string
  name: string
  suggestions?: string[]
  description: string
  descriptionAr?: string
  descriptionDerja?: string
  price: number
  promoPrice?: number
  image: string
  category?: string
  brand?: string
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

interface Category {
  _id: string
  name: string
  sizeType?: 'numeric' | 'letter' | 'none'
  sizes?: string[]
}

interface Brand {
  _id: string
  name: string
  image?: string
}

export default function MenuPage() {
  const searchParams = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search");

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [sortBy, setSortBy] = useState<'none' | 'price-asc'>('none')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [page, setPage] = useState(1)
  const pageSize = 24
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 100])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [maxPrice, setMaxPrice] = useState(100)

  // Fetch products, categories and brands from API
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories/public')
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
      const response = await fetch('/api/brands/public')
      if (response.ok) {
        const data = await response.json()
        setBrands(data.brands || [])
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products/public')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des produits')
      }
      const data = await response.json()
      setProducts(data.products || [])
      
      // Calculate max price
      if (data.products && data.products.length > 0) {
        const max = Math.max(...data.products.map((p: Product) => (p.isPromo && p.promoPrice) ? p.promoPrice : p.price))
        setMaxPrice(Math.ceil(max))
        setPriceRange([0, Math.ceil(max)])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Synchroniser la catégorie de l'URL au chargement
  useEffect(() => {
    if (categoryFromUrl && categories.length > 0) {
      const category = categories.find(c => c.name.toLowerCase() === categoryFromUrl.toLowerCase() || c._id === categoryFromUrl)
      if (category) {
        setSelectedCategories([category._id]);
      }
    }
  }, [categoryFromUrl, categories]);

  // Synchroniser la recherche depuis l'URL
  useEffect(() => {
    if (typeof searchFromUrl === 'string') {
      setSearchQuery(searchFromUrl)
    }
  }, [searchFromUrl])

  // Reset page when filters/sort change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, priceRange, selectedCategories, selectedBrands, sortBy])

  // Generate search suggestions based on query
  useEffect(() => {
    if (searchQuery.length > 0 && products.length > 0) {
      const query = searchQuery.toLowerCase()
      const suggestionsSet = new Set<string>()
      
      products.forEach((product) => {
        // Search in product name
        if (product.name.toLowerCase().includes(query)) {
          suggestionsSet.add(product.name)
        }
        // Search in suggestions
        if (product.suggestions) {
          product.suggestions.forEach(suggestion => {
            if (suggestion.toLowerCase().includes(query)) {
              suggestionsSet.add(suggestion)
            }
          })
        }
        // Search in category name
        if (product.category) {
          const category = categories.find(c => c._id === product.category)
          if (category && category.name.toLowerCase().includes(query)) {
            suggestionsSet.add(category.name)
          }
        }
        // Search in brand name
        if (product.brand) {
          const brand = brands.find(b => b._id === product.brand)
          if (brand && brand.name.toLowerCase().includes(query)) {
            suggestionsSet.add(brand.name)
          }
        }
        // Search in ingredients
        if (product.ingredients) {
          product.ingredients.forEach(ing => {
            if (ing.toLowerCase().includes(query)) {
              suggestionsSet.add(ing)
            }
          })
        }
      })
      
      setSuggestions(Array.from(suggestionsSet).slice(0, 5))
    } else {
      setSuggestions([])
    }
  }, [searchQuery, products, categories])

  // Get all available ingredients from products
  const ingredients = [...new Set(products.flatMap(p => p.ingredients || []))]

  // Apply filters
  useEffect(() => {
    if (products.length === 0) return

    const filtered = products.filter((product) => {
      if (!product.isActive && product.isActive !== undefined) return false

      // Search filter - search in name, suggestions, description
      const query = searchQuery.toLowerCase()
      const productCategory = categories.find(c => c._id === product.category)
      const matchesSearch = 
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.suggestions && product.suggestions.some(s => s.toLowerCase().includes(query))) ||
        (product.descriptionAr && product.descriptionAr.toLowerCase().includes(query)) ||
        (product.descriptionDerja && product.descriptionDerja.toLowerCase().includes(query)) ||
        (productCategory && productCategory.name.toLowerCase().includes(query)) ||
        (product.brand && brands.find(b => b._id === product.brand)?.name.toLowerCase().includes(query)) ||
        (product.ingredients && product.ingredients.some(ing => ing.toLowerCase().includes(query)))

      // Price filter - use promo price if available
      const displayPrice = (product.isPromo && product.promoPrice) ? product.promoPrice : product.price
      const matchesPrice = displayPrice >= priceRange[0] && displayPrice <= priceRange[1]

      // Category filter
      let matchesCategory = true;
      if (selectedCategories.length > 0 && product.category) {
        matchesCategory = selectedCategories.includes(product.category);
      } else if (selectedCategories.length > 0) {
        matchesCategory = false;
      }

      // Brand filter
      let matchesBrand = true;
      if (selectedBrands.length > 0 && product.brand) {
        matchesBrand = selectedBrands.includes(product.brand);
      } else if (selectedBrands.length > 0) {
        matchesBrand = false;
      }

      // Ingredient filter
      const matchesIngredient =
        selectedIngredients.length === 0 || 
        (product.ingredients && selectedIngredients.some((ing) => product.ingredients!.includes(ing)))

      return matchesSearch && matchesPrice && matchesCategory && matchesBrand && matchesIngredient
    })

    setFilteredProducts(filtered)
  }, [searchQuery, priceRange, selectedCategories, selectedBrands, selectedIngredients, products, categories, brands])

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  // Toggle brand selection
  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    )
  }

  // Toggle ingredient selection
  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient) ? prev.filter((i) => i !== ingredient) : [...prev, ingredient],
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("")
    setPriceRange([0, maxPrice])
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedIngredients([])
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Derived: sort + pagination
  const priceOf = (p: Product) => (p.isPromo && p.promoPrice ? p.promoPrice : p.price)
  const sortedProducts = sortBy === 'price-asc' ? [...filteredProducts].sort((a, b) => priceOf(a) - priceOf(b)) : filteredProducts
  const total = sortedProducts.length
  const startIndex = total === 0 ? 0 : (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, total)
  const pageProducts = sortedProducts.slice(startIndex, endIndex)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  // Filter sidebar content
  const FilterContent = () => (
    <div className="py-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-secondary">Filtres</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-primary">
          Réinitialiser
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["price", "categories"]} className="w-full">
        {/* Price Range Filter */}
        <AccordionItem value="price" className="border-b border-primary/20">
          <AccordionTrigger className="text-secondary hover:text-primary py-3">Prix (dt)</AccordionTrigger>
          <AccordionContent>
            <div className="px-2 py-2">
              <Slider
                defaultValue={[0, maxPrice]}
                max={maxPrice}
                min={0}
                step={1}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-2 h-2 rounded-full bg-gold"
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{priceRange[0]}dt</span>
                <span>{priceRange[1]}dt</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Categories Filter */}
        <AccordionItem value="categories" className="border-b border-primary/20">
          <AccordionTrigger className="text-secondary hover:text-primary py-3">Catégories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 py-2 max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <div key={category._id} className="flex items-center">
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={() => toggleCategory(category._id)}
                    className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-white focus:ring-gold"
                  />
                  <Label htmlFor={`category-${category._id}`} className="ml-2 cursor-pointer text-secondary">
                    {category.name}
                  </Label>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-gray-400 py-2">Aucune catégorie disponible</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brands Filter */}
        <AccordionItem value="brands" className="border-b border-primary/20">
          <AccordionTrigger className="text-secondary hover:text-primary py-3">Marques</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 py-2 max-h-64 overflow-y-auto">
              {brands.map((brand) => (
                <div key={brand._id} className="flex items-center">
                  <Checkbox
                    id={`brand-${brand._id}`}
                    checked={selectedBrands.includes(brand._id)}
                    onCheckedChange={() => toggleBrand(brand._id)}
                    className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-white focus:ring-gold"
                  />
                  <Label htmlFor={`brand-${brand._id}`} className="ml-2 cursor-pointer text-secondary">
                    {brand.name}
                  </Label>
                </div>
              ))}
              {brands.length === 0 && (
                <p className="text-sm text-gray-400 py-2">Aucune marque disponible</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {false && (
          <AccordionItem value="ingredients" className="border-b border-primary/20">
            <AccordionTrigger className="text-secondary hover:text-primary py-3">Ingrédients</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 py-2">
                {ingredients.map((ingredient) => (
                  <div key={ingredient} className="flex items-center">
                    <Checkbox
                      id={`ingredient-${ingredient}`}
                      checked={selectedIngredients.includes(ingredient)}
                      onCheckedChange={() => toggleIngredient(ingredient)}
                      className="border-gold data-[state=checked]:bg-gold data-[state=checked]:text-white focus:ring-gold"
                    />
                    <Label htmlFor={`ingredient-${ingredient}`} className="ml-2 cursor-pointer text-secondary">
                      {ingredient}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 md:mb-10"
      >
        <h4 className="text-primary uppercase tracking-wider font-medium mb-2">Découvrez</h4>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-4">Nos Produits</h1>
        <div className="w-20 h-0.5 bg-primary mx-auto mb-6"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Découvrez notre large sélection de produits de qualité, soigneusement sélectionnés pour répondre à tous vos besoins.
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-16 fancy-border p-5 bg-white shadow-sm">
            <FilterContent />
          </div>
        </div>

        {/* Mobile Filters Button and Sheet */}
        <div className="lg:hidden flex items-center justify-between mb-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 border-primary/50 text-secondary">
                <Filter className="h-4 w-4" />
                Filtres
                {(selectedCategories.length > 0 ||
                  selectedBrands.length > 0 ||
                  priceRange[0] > 0 ||
                  priceRange[1] < maxPrice) && (
                  <Badge className="ml-1 bg-primary hover:bg-primary/90 text-white">
                    {selectedCategories.length +
                      selectedBrands.length +
                      (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <FilterContent />
            </SheetContent>
          </Sheet>

          {/* Search Input for Mobile */}
          <div className="relative w-full max-w-sm ml-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher... (فرنسي، عربي، دارجة)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 border-primary/20 focus:border-primary focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
              {/* Suggestions dropdown for mobile */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setSuggestions([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {/* Desktop Search */}
          <div className="hidden lg:flex mb-4 relative max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Rechercher... (فرنسي، عربي، دارجة)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 border-primary/20 focus:border-primary focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setSuggestions([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((category) => (
                <Badge
                  key={`cat-${category}`}
                  variant="secondary"
                  className="bg-accent text-secondary hover:bg-accent/80"
                >
                  {category}
                  <button onClick={() => toggleCategory(category)} className="ml-1">
                    <X className="h-3 w-3 text-gold" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Toolbar: Count, Sort, View */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="text-sm text-gray-500">
              {total === 0 ? 'Aucun résultat' : `Affichage ${startIndex + 1}-${endIndex} de ${total} article(s)`}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-600">Trier:</label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'none' | 'price-asc')}
                  className="border border-primary/20 rounded-md px-2 py-1 text-sm focus:outline-none"
                >
                  <option value="none">Par défaut</option>
                  <option value="price-asc">Prix croissant</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')} className="h-8 px-2">
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')} className="h-8 px-2">
                  <ListIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des produits...</p>
            </div>
          ) : total > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={`grid ${viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'} gap-6`}
            >
              {pageProducts.map((product) => (
                <motion.div key={product._id || product.id} variants={itemVariants}>
                  <ProductCard product={product} variant={viewMode === 'list' ? 'list' : 'grid'} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">Aucun produit ne correspond à vos critères.</p>
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4 border-primary text-primary hover:bg-primary/10"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className="h-8 px-3"
                >
                  {p}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

