import { useCart } from "@/components/cart-context";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, clearCart, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-16 px-4 sm:px-6 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-600 mb-2">Votre panier est vide</h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Ajoutez des produits à votre panier</p>
          <Link href="/menu">
            <Button className="bg-gold hover:bg-gold/90 text-white text-sm sm:text-base">
              Découvrir nos boutique en ligne
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-2">Votre Panier</h1>
        <p className="text-gray-600 text-sm sm:text-base">Récapitulatif de votre commande</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Liste des produits */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <h2 className="text-lg sm:text-xl font-semibold text-navy">Produits ({items.length})</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                  <div className="relative">
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      width={60} 
                      height={60} 
                      className="rounded-lg object-cover border border-gray-200 sm:w-[70px] sm:h-[70px]" 
                    />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gold text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base sm:text-lg text-navy mb-1 truncate">{item.name}</h3>
                    <div className="text-gray-500 text-xs sm:text-sm">
                      <p>Quantité: {item.quantity}</p>
                      {item.size && <p>Taille: {item.size}</p>}
                      {item.color && <p>Couleur: {item.color}</p>}
                    </div>
                    <p className="text-gold font-bold text-base sm:text-lg mt-1">{item.price.toFixed(2)}dt</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFromCart(item.cartItemId || item.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé de la commande */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-32">
            <h3 className="text-lg sm:text-xl font-semibold text-navy mb-4">Résumé</h3>
            
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 truncate mr-2">{item.name} x{item.quantity}</span>
                  <span className="font-medium flex-shrink-0">{(item.price * item.quantity).toFixed(2)}dt</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center text-base sm:text-lg font-bold">
                <span className="text-navy">Total</span>
                <span className="text-gold text-xl sm:text-2xl">{total.toFixed(2)}dt</span>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Button 
                variant="outline" 
                onClick={clearCart}
                className="w-full border-red-200 text-red-600 hover:bg-red-50 text-sm sm:text-base"
              >
                Vider le panier
              </Button>
              <Link href="/order" className="block">
                <Button className="w-full bg-gold hover:bg-gold/90 text-white font-semibold text-base sm:text-lg py-2 sm:py-3">
                  Confirmer la commande
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}