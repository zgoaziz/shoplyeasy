// Script pour créer un compte admin par défaut
// Exécuter avec: node scripts/create-admin.js

const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')

const uri = process.env.MONGODB_URI || 'mongodb+srv://zgolliaziz206_db_user:20082001@cluster0.x5cnvfa.mongodb.net/?appName=Cluster0'

const adminData = {
  name: process.env.ADMIN_NAME || 'Admin ShoplyEasy',
  email: process.env.ADMIN_EMAIL || 'admin@shoplyeasy.com',
  phone: process.env.ADMIN_PHONE || '+216 00 000 000',
  password: process.env.ADMIN_PASSWORD || 'admin123456',
  role: 'admin',
}

async function createAdmin() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('Connexion à MongoDB réussie')

    const db = client.db('shoplyeasy')
    const usersCollection = db.collection('users')

    // Vérifier si l'admin existe déjà
    const existingAdmin = await usersCollection.findOne({ email: adminData.email })
    if (existingAdmin) {
      console.log('✓ Un compte admin existe déjà avec cet email:', adminData.email)
      return
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 10)

    // Créer l'admin
    const result = await usersCollection.insertOne({
      ...adminData,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('✓ Compte admin créé avec succès!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', adminData.email)
    console.log('🔑 Mot de passe:', adminData.password)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!')
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  } finally {
    await client.close()
  }
}

createAdmin()

