export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-navy mb-4">Commandes</h1>
      <p className="text-gray-600 mb-6">Historique et suivi de vos commandes.</p>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-700">Aucune commande à afficher. Connectez-vous pour voir vos commandes.</p>
      </div>
    </div>
  )
}
