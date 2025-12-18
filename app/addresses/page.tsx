export default function AddressesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-navy mb-4">Adresses</h1>
      <p className="text-gray-600 mb-6">Gérez vos adresses de livraison et de facturation.</p>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-700">Aucune adresse enregistrée. Connectez-vous pour ajouter et gérer vos adresses.</p>
      </div>
    </div>
  )
}
