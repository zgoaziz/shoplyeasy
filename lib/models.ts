import clientPromise from './mongodb'
import { ObjectId } from 'mongodb'

export interface User {
  _id?: string
  name: string
  email: string
  phone: string
  password: string
  role?: 'user' | 'admin'
  createdAt?: Date
  updatedAt?: Date
}

export interface Category {
  _id?: string
  name: string
  categoryType?: 'chaussures' | 'vetements' | 'bijoux' | 'autre'  // Type de catégorie sélectionné par l'utilisateur
  sizeType?: 'numeric' | 'letter' | 'none'  // numeric pour chaussures (36-45), letter pour vêtements (XS-XXL), none pour autres
  sizes?: string[]  // Liste des tailles disponibles pour cette catégorie (ex: ["XS", "S", "M", "L", "XL", "XXL"] ou ["36", "37", "38", ...])
  createdAt?: Date
  updatedAt?: Date
}

export interface Brand {
  _id?: string
  name: string
  image?: string  // URL de l'image de la marque
  createdAt?: Date
  updatedAt?: Date
}

export interface Product {
  _id?: string
  name: string
  suggestions?: string[]  // Suggestions de noms alternatifs
  description: string
  descriptionAr?: string  // Description en arabe
  descriptionDerja?: string  // Description en derja
  price: number  // Prix de vente
  purchasePrice?: number  // Prix d'achat
  image: string
  category?: string  // Référence à la catégorie
  brand?: string  // Référence à la marque
  sizes?: { size: string; stock: number }[]  // Tailles avec stock pour chaussures, chemises, pantalons
  colors?: { color: string; colorCode?: string; stock?: number }[]  // Couleurs disponibles (pour bijoux, etc.)
  gallery?: string[]
  stock?: number  // Stock général (pour produits sans tailles ni couleurs)
  barcode?: string  // Code à barres
  isActive?: boolean
  isNew?: boolean  // Nouveau produit
  isPromo?: boolean  // En promotion
  promoPrice?: number  // Prix promotionnel
  availableOnOrder?: boolean  // Disponible sur commande (si pas de stock)
  createdAt?: Date
  updatedAt?: Date
}

export interface Contact {
  _id?: string
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  status?: 'new' | 'read' | 'replied'
  createdAt?: Date
  updatedAt?: Date
}

export interface Order {
  _id?: string
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
  createdAt?: Date
  updatedAt?: Date
}

export async function getUsers() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const users = await db.collection<User>('users').find({}).toArray()
  // Convertir les ObjectId en string
  return users.map((user: any) => ({
    ...user,
    _id: user._id?.toString(),
  }))
}

export async function getUserByEmail(email: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const user = await db.collection<User>('users').findOne({ email })
  
  if (!user) {
    return null
  }
  
  console.log('getUserByEmail - Found user:', { email: user.email, role: user.role }) // Debug
  
  return {
    ...user,
    _id: user._id?.toString() || (user._id as any)?.toString(),
    role: user.role || 'user', // S'assurer que le rôle est défini
  }
}

export async function createUser(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<User>('users').insertOne({
    ...user,
    role: user.role || 'user', // Utiliser le rôle fourni ou 'user' par défaut
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function getProducts() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  return db.collection<Product>('products').find({}).sort({ createdAt: -1 }).toArray()
}

export async function getProductById(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  return db.collection<Product>('products').findOne({ _id: new ObjectId(id) as any })
}

export async function createProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Product>('products').insertOne({
    ...product,
    stock: product.stock || 0,
    isActive: product.isActive !== undefined ? product.isActive : true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Product>('products').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { ...product, updatedAt: new Date() } }
  )
}

export async function deleteProduct(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Product>('products').deleteOne({ _id: new ObjectId(id) as any })
}

export async function getContacts() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  return db.collection<Contact>('contacts').find({}).sort({ createdAt: -1 }).toArray()
}

export async function getContactById(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  return db.collection<Contact>('contacts').findOne({ _id: new ObjectId(id) as any })
}

export async function createContact(contact: Omit<Contact, '_id' | 'createdAt' | 'updatedAt' | 'status'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Contact>('contacts').insertOne({
    ...contact,
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function updateContact(id: string, contact: Partial<Contact>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Contact>('contacts').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { ...contact, updatedAt: new Date() } }
  )
}

export async function deleteContact(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Contact>('contacts').deleteOne({ _id: new ObjectId(id) as any })
}

export async function getOrders() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const orders = await db.collection<Order>('orders').find({}).sort({ createdAt: -1 }).toArray()
  return orders.map((order: any) => ({
    ...order,
    _id: order._id?.toString(),
  }))
}

export async function getOrdersByUserId(userId: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const orders = await db.collection<Order>('orders').find({ userId }).sort({ createdAt: -1 }).toArray()
  return orders.map((order: any) => ({
    ...order,
    _id: order._id?.toString(),
  }))
}

export async function getOrderById(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const order = await db.collection<Order>('orders').findOne({ _id: new ObjectId(id) as any })
  if (!order) return null
  return {
    ...order,
    _id: order._id?.toString(),
  }
}

export async function createOrder(order: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Order>('orders').insertOne({
    ...order,
    status: order.status || 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function updateOrder(id: string, order: Partial<Order>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Order>('orders').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { ...order, updatedAt: new Date() } }
  )
}

export async function deleteOrder(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Order>('orders').deleteOne({ _id: new ObjectId(id) as any })
}

// Category functions
export async function getCategories() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const categories = await db.collection<Category>('categories').find({}).sort({ name: 1 }).toArray()
  return categories.map((cat: any) => ({
    ...cat,
    _id: cat._id?.toString(),
  }))
}

export async function getCategoryById(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const category = await db.collection<Category>('categories').findOne({ _id: new ObjectId(id) as any })
  if (!category) return null
  return {
    ...category,
    _id: category._id?.toString(),
  }
}

export async function createCategory(category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Category>('categories').insertOne({
    ...category,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Category>('categories').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { ...category, updatedAt: new Date() } }
  )
}

export async function deleteCategory(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Category>('categories').deleteOne({ _id: new ObjectId(id) as any })
}

// Brand functions
export async function getBrands() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const brands = await db.collection<Brand>('brands').find({}).sort({ name: 1 }).toArray()
  return brands.map((brand: any) => ({
    ...brand,
    _id: brand._id?.toString(),
  }))
}

export async function getBrandById(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const brand = await db.collection<Brand>('brands').findOne({ _id: new ObjectId(id) as any })
  if (!brand) return null
  return {
    ...brand,
    _id: brand._id?.toString(),
  }
}

export async function createBrand(brand: Omit<Brand, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Brand>('brands').insertOne({
    ...brand,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function updateBrand(id: string, brand: Partial<Brand>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Brand>('brands').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { ...brand, updatedAt: new Date() } }
  )
}

export async function deleteBrand(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Brand>('brands').deleteOne({ _id: new ObjectId(id) as any })
}

export interface Notification {
  _id?: string
  type: 'contact' | 'order' | 'sale' | 'auth' | 'system'
  title: string
  message: string
  link?: string
  isRead?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Advertisement {
  _id?: string
  image: string
  video?: string
  type?: 'image' | 'video'
  link?: string
  position?: {
    x: number
    y: number
    section?: 'header' | 'sidebar' | 'content' | 'footer'
  }
  section?: 'header' | 'sidebar' | 'content' | 'footer' | 'hero' | 'main'
  orientation: 'horizontal' | 'vertical'
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Sale {
  _id?: string
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
  createdAt?: Date
  updatedAt?: Date
}

export async function getSales() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const sales = await db.collection<Sale>('sales').find({}).sort({ createdAt: -1 }).toArray()
  return sales.map((sale: any) => ({
    ...sale,
    _id: sale._id?.toString(),
    orderId: sale.orderId?.toString(),
  }))
}

export async function getSaleById(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const sale = await db.collection<Sale>('sales').findOne({ _id: new ObjectId(id) as any })
  if (!sale) return null
  return {
    ...sale,
    _id: sale._id?.toString(),
    orderId: sale.orderId?.toString(),
  }
}

export async function createSale(sale: Omit<Sale, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Sale>('sales').insertOne({
    ...sale,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function updateSale(id: string, sale: Partial<Sale>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Sale>('sales').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { ...sale, updatedAt: new Date() } }
  )
}

export async function deleteSale(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Sale>('sales').deleteOne({ _id: new ObjectId(id) as any })
}

// Notification CRUD
export async function getNotifications() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const notifications = await db.collection<Notification>('notifications').find({}).sort({ createdAt: -1 }).limit(50).toArray()
  return notifications.map((notification: any) => ({
    ...notification,
    _id: notification._id?.toString(),
  }))
}

export async function getUnreadNotificationsCount() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  return await db.collection<Notification>('notifications').countDocuments({ isRead: { $ne: true } })
}

export async function createNotification(notification: Omit<Notification, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Notification>('notifications').insertOne({
    ...notification,
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function markNotificationAsRead(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Notification>('notifications').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { isRead: true, updatedAt: new Date() } }
  )
}

export async function markAllNotificationsAsRead() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Notification>('notifications').updateMany(
    { isRead: { $ne: true } },
    { $set: { isRead: true, updatedAt: new Date() } }
  )
}

export async function deleteNotification(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Notification>('notifications').deleteOne({ _id: new ObjectId(id) as any })
}

// Advertisement CRUD
export async function getAdvertisements() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const advertisements = await db.collection<Advertisement>('advertisements').find({}).sort({ createdAt: -1 }).toArray()
  return advertisements.map((ad: any) => ({
    ...ad,
    _id: ad._id?.toString(),
  }))
}

export async function getActiveAdvertisements() {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const advertisements = await db.collection<Advertisement>('advertisements').find({ isActive: true }).toArray()
  return advertisements.map((ad: any) => ({
    ...ad,
    _id: ad._id?.toString(),
  }))
}

export async function getAdvertisementById(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const ad = await db.collection<Advertisement>('advertisements').findOne({ _id: new ObjectId(id) as any })
  if (!ad) return null
  return {
    ...ad,
    _id: ad._id?.toString(),
  }
}

export async function createAdvertisement(advertisement: Omit<Advertisement, '_id' | 'createdAt' | 'updatedAt'>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  const result = await db.collection<Advertisement>('advertisements').insertOne({
    ...advertisement,
    isActive: advertisement.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

export async function updateAdvertisement(id: string, advertisement: Partial<Advertisement>) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Advertisement>('advertisements').updateOne(
    { _id: new ObjectId(id) as any },
    { $set: { ...advertisement, updatedAt: new Date() } }
  )
}

export async function deleteAdvertisement(id: string) {
  const client = await clientPromise
  const db = client.db('shoplyeasy')
  await db.collection<Advertisement>('advertisements').deleteOne({ _id: new ObjectId(id) as any })
}
