export default function CreditsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-navy mb-4">Avoirs</h1>
      <p className="text-gray-600 mb-6">Gérez vos avoirs et crédits disponibles.</p>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-700">Aucun avoir pour le moment. Connectez-vous pour consulter vos avoirs.</p>
      </div>
    </div>
  )
}
