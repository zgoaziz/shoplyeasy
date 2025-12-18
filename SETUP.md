# Configuration MongoDB et Authentification

## Configuration de l'environnement

1. Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://zgolliaziz206_db_user:20082001@cluster0.x5cnvfa.mongodb.net/?appName=Cluster0

# JWT Secret (Change this to a random secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (for sending emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Base de données

La base de données MongoDB utilisera automatiquement la base de données `shoplyeasy` avec les collections suivantes :
- `users` - Pour les utilisateurs
- `products` - Pour les produits
- `contacts` - Pour les messages de contact

## Fonctionnalités implémentées

### Authentification
- ✅ Inscription dynamique avec MongoDB
- ✅ Connexion dynamique avec vérification du mot de passe
- ✅ Déconnexion
- ✅ Protection des routes avec middleware
- ✅ Gestion des sessions avec JWT

### Dashboard
- ✅ `/dashboard` - Tableau de bord principal
- ✅ `/dashboard/users` - Gestion des utilisateurs (admin seulement)
- ✅ `/dashboard/product` - Gestion des produits (admin seulement)
- ✅ `/dashboard/contact` - Gestion des contacts (admin seulement)

### API Routes
- ✅ `/api/auth/register` - Inscription
- ✅ `/api/auth/login` - Connexion
- ✅ `/api/auth/logout` - Déconnexion
- ✅ `/api/auth/me` - Récupérer l'utilisateur connecté
- ✅ `/api/users` - Liste des utilisateurs (GET)
- ✅ `/api/products` - CRUD produits (GET, POST)
- ✅ `/api/products/[id]` - Opérations sur un produit (GET, PUT, DELETE)
- ✅ `/api/contacts` - CRUD contacts (GET, POST)
- ✅ `/api/contacts/[id]` - Opérations sur un contact (PUT, DELETE)

## Créer un compte admin par défaut

### Méthode 1 : Via l'interface web (Recommandé)
1. Accédez à : `http://localhost:3000/setup`
2. Cliquez sur "Créer le compte admin"
3. Le compte admin sera créé avec ces identifiants par défaut :
   - Email: `admin@shoplyeasy.com`
   - Mot de passe: `admin123456`

### Méthode 2 : Via l'API
Appelez l'endpoint : `POST /api/setup/admin`

### Méthode 3 : Via MongoDB (Manuel)
Pour créer un utilisateur admin manuellement :

1. Connectez-vous à MongoDB Atlas
2. Accédez à la collection `users`
3. Trouvez l'utilisateur que vous souhaitez promouvoir
4. Modifiez le champ `role` de `"user"` à `"admin"`

Ou utilisez le MongoDB Shell :

```javascript
use shoplyeasy
db.users.updateOne(
  { email: "votre-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Démarrage

1. Installez les dépendances :
```bash
npm install
```

2. Créez le fichier `.env.local` avec vos configurations

3. Démarrez le serveur de développement :
```bash
npm run dev
```

4. Accédez à l'application : `http://localhost:3000`

## Notes importantes

- Les mots de passe sont hachés avec bcryptjs avant stockage
- Les tokens JWT expirent après 7 jours
- Seuls les utilisateurs avec le rôle `admin` peuvent accéder aux pages de gestion
- Le middleware protège automatiquement toutes les routes `/dashboard/*`

