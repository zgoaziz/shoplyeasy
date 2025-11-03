import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="text-3xl font-serif font-bold text-navy">Conditions d&apos;Utilisation</CardTitle>
            <CardDescription>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">1. Acceptation des Conditions</h2>
              <p>
                En accédant et en utilisant ShoplyEasy, vous acceptez d&apos;être lié par ces conditions d&apos;utilisation. 
                Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">2. Utilisation du Site</h2>
              <p>
                Vous vous engagez à utiliser notre site de manière légale et conforme. Vous ne devez pas :
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Utiliser le site à des fins frauduleuses ou illégales</li>
                <li>Tenter d&apos;accéder à des zones non autorisées</li>
                <li>Perturber le fonctionnement du site</li>
                <li>Transmettre des virus ou codes malveillants</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">3. Commandes et Paiements</h2>
              <p>
                Toutes les commandes sont soumises à disponibilité des produits. Nous nous réservons le droit de refuser 
                ou d&apos;annuler toute commande. Les prix peuvent être modifiés sans préavis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">4. Propriété Intellectuelle</h2>
              <p>
                Tous les contenus présents sur ShoplyEasy (textes, images, logos) sont protégés par les lois sur la 
                propriété intellectuelle et appartiennent à ShoplyEasy ou à ses partenaires.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">5. Limitation de Responsabilité</h2>
              <p>
                ShoplyEasy ne saurait être tenu responsable des dommages indirects résultant de l&apos;utilisation 
                ou de l&apos;impossibilité d&apos;utiliser notre site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">6. Modifications</h2>
              <p>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet 
                dès leur publication sur le site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-navy mb-3">7. Contact</h2>
              <p>
                Pour toute question concernant ces conditions, veuillez nous contacter à :{" "}
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

