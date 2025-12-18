import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-3xl font-serif font-bold text-navy">Politique de Confidentialité</CardTitle>
            <CardDescription>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">1. Collecte des Données</h2>
              <p>
                ShoplyEasy collecte les données personnelles que vous nous fournissez lors de votre inscription et de vos commandes, 
                notamment votre nom, adresse email, numéro de téléphone et adresse de livraison.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">2. Utilisation des Données</h2>
              <p>
                Nous utilisons vos données personnelles pour :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Traiter vos commandes et gérer votre compte</li>
                <li>Vous contacter concernant vos commandes</li>
                <li>Améliorer nos services et votre expérience</li>
                <li>Vous envoyer des communications marketing (avec votre consentement)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">3. Protection des Données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles contre 
                l'accès non autorisé, la perte ou la destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">4. Partage des Données</h2>
              <p>
                Nous ne vendons pas vos données personnelles à des tiers. Nous pouvons partager vos données uniquement 
                avec nos partenaires de livraison et de paiement pour traiter vos commandes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">5. Vos Droits</h2>
              <p>
                Vous avez le droit d'accéder, de modifier ou de supprimer vos données personnelles à tout moment. 
                Vous pouvez également vous désabonner de nos communications marketing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">6. Contact</h2>
              <p>
                Pour toute question concernant cette politique de confidentialité, veuillez nous contacter à :{" "}
                <Link href="/contact" className="text-gold hover:text-gold/80">
                  contact@shoplyeasy.com
                </Link>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

