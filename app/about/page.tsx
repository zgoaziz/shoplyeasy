import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-16 px-4 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-navy mb-8 text-center">À propos de ShoplyEasy</h1>
      <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
        <div className="flex-1">
          <Image src="/logo.png" alt="ShoplyEasy" width={220} height={220} className="rounded-lg shadow mx-auto" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-gold mb-4">Votre Partenaire E-Commerce de Confiance</h2>
          <p className="text-lg text-gray-700 mb-4">
            ShoplyEasy est né de la passion pour offrir une expérience d'achat en ligne exceptionnelle. Notre équipe s'engage à vous offrir des produits de qualité alliant innovation et service client.
          </p>
          <p className="text-lg text-gray-700 mb-4">
            Chaque produit est soigneusement sélectionné pour vous garantir la meilleure qualité et une satisfaction totale à chaque achat.
          </p>
          <p className="text-lg text-gray-700">
            Notre équipe passionnée s'engage à vous offrir une expérience d'achat inoubliable, avec un service client disponible et une livraison rapide.
          </p>
        </div>
      </div>

      {/* Timeline de l'histoire */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-gold mb-6 text-center">Notre Histoire</h3>
        <div className="relative border-l-4 border-gold pl-8">
          <div className="mb-10">
            <div className="text-gold font-bold text-lg mb-1">2025</div>
            <div className="text-navy font-semibold mb-1">Naissance de ShoplyEasy</div>
            <div className="text-gray-600">
              L'aventure de ShoplyEasy commence en 2025, née de l'idée de créer une plateforme e-commerce innovante et unique. Animés par notre passion pour le service client, nous avons décidé de créer notre propre projet.
            </div>
          </div>
          <div className="mb-10">
            <div className="text-gold font-bold text-lg mb-1">2025</div>
            <div className="text-navy font-semibold mb-1">Création de l'équipe</div>
            <div className="text-gray-600">
              Dès le départ, nous nous sommes entourés de partenaires de confiance et avons mis en place une organisation qui nous permet de concrétiser notre vision : offrir des produits de qualité alliant innovation et service client.
            </div>
          </div>
          <div>
            <div className="text-gold font-bold text-lg mb-1">Aujourd'hui</div>
            <div className="text-navy font-semibold mb-1">Une équipe passionnée</div>
            <div className="text-gray-600">
              Notre équipe innove chaque jour pour vous offrir le meilleur en matière de service e-commerce, guidée par notre engagement envers la qualité et la satisfaction client.
            </div>
          </div>
        </div>
      </div>

      {/* Section équipe */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-gold mb-6 text-center">Notre Équipe</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <Image src="/logo.png" alt="Équipe ShoplyEasy" width={90} height={90} className="rounded-full mb-4" />
            <div className="font-bold text-navy">Équipe ShoplyEasy</div>
            <div className="text-gold text-sm mb-2">Fondateurs</div>
            <div className="text-gray-600 text-center text-sm">Fondateurs de ShoplyEasy, passionnés par l'innovation et le service client exceptionnel.</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <Image src="/logo.png" alt="Équipe Produits" width={90} height={90} className="rounded-full mb-4" />
            <div className="font-bold text-navy">Équipe ShoplyEasy</div>
            <div className="text-gold text-sm mb-2">Gestion des Produits</div>
            <div className="text-gray-600 text-center text-sm">Notre équipe sélectionne et gère les produits avec soin pour garantir la meilleure qualité.</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
            <Image src="/logo.png" alt="Service Client" width={90} height={90} className="rounded-full mb-4" />
            <div className="font-bold text-navy">Équipe ShoplyEasy</div>
            <div className="text-gold text-sm mb-2">Service Client</div>
            <div className="text-gray-600 text-center text-sm">Toujours à l'écoute pour garantir une expérience client inoubliable.</div>
          </div>
        </div>
      </div>

      {/* Valeurs visuelles */}
      <div className="bg-gold/10 rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-gold mb-2">Nos valeurs</h3>
        <div className="flex flex-wrap justify-center gap-8 mt-6">
          <div className="flex flex-col items-center">
            <span className="text-gold text-3xl mb-2">🍯</span>
            <span className="font-semibold text-navy">Qualité</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gold text-3xl mb-2">🧑‍🍳</span>
            <span className="font-semibold text-navy">Tradition</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gold text-3xl mb-2">✨</span>
            <span className="font-semibold text-navy">Créativité</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-gold text-3xl mb-2">🤝</span>
            <span className="font-semibold text-navy">Satisfaction client</span>
          </div>
        </div>
      </div>
    </div>
  );
}