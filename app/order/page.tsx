"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { useCart } from "@/components/cart-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function OrderPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();

  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [deliveryOption] = useState<'retrait' | 'livraison'>('livraison');
  const [shippingFee] = useState<number>(8);
  const grandTotal = +(total + (deliveryOption === 'livraison' ? shippingFee : 0)).toFixed(2);

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          if (data.user && data.user._id) {
            setUserId(data.user._id)
            setForm(prev => ({
              ...prev,
              name: data.user.name || prev.name,
              email: data.user.email || prev.email,
              phone: data.user.phone || prev.phone,
            }))
          }
        }
      } catch (error) {
        // Utilisateur non authentifié, ce n'est pas grave
        console.log('User not authenticated')
      }
    }
    checkAuth()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Charger Google Maps
  useEffect(() => {
    if (isMapOpen && !mapLoaded) {
      // Vérifier si le script existe déjà
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        if ((window as any).google) {
          setMapLoaded(true);
        }
        return;
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.warn('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if ((window as any).google) {
          setMapLoaded(true);
        }
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setMapLoaded(false);
      };
      document.head.appendChild(script);
      return () => {
        // Ne pas supprimer le script pour éviter les rechargements
      };
    }
  }, [isMapOpen, mapLoaded]);

  // Initialiser la carte quand elle est chargée
  useEffect(() => {
    if (isMapOpen && mapLoaded && typeof window !== 'undefined' && (window as any).google) {
      const timer = setTimeout(() => {
        initMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMapOpen, mapLoaded]);

  const initMap = () => {
    if (!(window as any).google) return;
    
    const mapElement = document.getElementById('map-selector');
    if (!mapElement) return;

    const defaultCenter = { lat: 36.851513, lng: 11.085997 }; // Kelibia, Tunisie par défaut
    const map = new (window as any).google.maps.Map(
      mapElement,
      {
        center: selectedPosition || defaultCenter,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
      }
    );

    let marker: any = null;

    // Créer ou mettre à jour le marqueur
    const updateMarker = (position: { lat: number; lng: number }) => {
      if (marker) {
        marker.setPosition(position);
      } else {
        marker = new (window as any).google.maps.Marker({
          position,
          map,
          draggable: true,
        });
        
        // Écouter le déplacement du marqueur
        marker.addListener('dragend', (e: any) => {
          const pos = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          setSelectedPosition(pos);
          getAddressFromPosition(pos);
        });
      }
      map.setCenter(position);
    };

    // Cliquer sur la carte pour placer un marqueur
    map.addListener('click', (e: any) => {
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setSelectedPosition(position);
      updateMarker(position);
      getAddressFromPosition(position);
    });

    // Si une position est déjà sélectionnée, placer le marqueur
    if (selectedPosition) {
      updateMarker(selectedPosition);
    }

    // Recherche avec autocomplete
    const searchInput = document.getElementById('address-search') as HTMLInputElement;
    if (searchInput) {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(
        searchInput,
        {
          types: ['address'],
          componentRestrictions: { country: 'tn' },
        }
      );

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          const position = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          setSelectedPosition(position);
          updateMarker(position);
          map.setCenter(position);
          setForm(prev => ({ ...prev, address: place.formatted_address || prev.address }));
        }
      });
    }
  };

  const getAddressFromPosition = async (position: { lat: number; lng: number }) => {
    if (!(window as any).google) return;

    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        setForm(prev => ({ ...prev, address: results[0].formatted_address }));
      }
    });
  };

  const handleSelectLocation = () => {
    if (selectedPosition) {
      setIsMapOpen(false);
      // L'adresse est déjà mise à jour par getAddressFromPosition
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Préparer les items de la commande
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))

      // Créer la commande dans la base de données
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId || undefined,
          name: form.name,
          email: form.email || undefined,
          phone: form.phone,
          address: form.address,
          items: orderItems,
          total: grandTotal,
          shippingFee: deliveryOption === 'livraison' ? shippingFee : 0,
          deliveryOption,
          paymentMethod: 'Sur place',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la commande')
      }

      const data = await response.json()

      // Générer le message WhatsApp
      const message =
        `Nouvelle commande Soltana\n` +
        `Numéro de commande: ${data.orderId}\n` +
        `Nom: ${form.name}\n` +
        `Téléphone: ${form.phone}\n` +
        `Adresse: ${form.address}\n` +
        `---\n` +
        items.map((item) => `• ${item.name} x${item.quantity} - ${(item.price * item.quantity).toFixed(2)}dt`).join("\n") +
        `\nFrais de livraison: ${(deliveryOption === 'livraison' ? shippingFee : 0).toFixed(2)}dt` +
        `\nTotal: ${grandTotal.toFixed(2)}dt\nPaiement: Sur place`;

      clearCart();
      
      // Redirection WhatsApp (format international pour la Tunisie)
      window.location.href = `https://wa.me/21656170165?text=${encodeURIComponent(message)}`;
    } catch (err: any) {
      setError(err.message || "Erreur lors de la préparation de la commande.");
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-navy mb-6 text-center">Valider la commande</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          name="name" 
          placeholder="Nom *" 
          required 
          className="w-full border p-2 rounded" 
          value={form.name} 
          onChange={handleChange} 
        />
        <input 
          name="email" 
          type="email"
          placeholder="Email (optionnel)" 
          className="w-full border p-2 rounded" 
          value={form.email} 
          onChange={handleChange} 
        />
        <input 
          name="phone" 
          placeholder="Téléphone *" 
          required 
          className="w-full border p-2 rounded" 
          value={form.phone} 
          onChange={handleChange} 
        />
        <div className="relative">
          <input 
            name="address" 
            placeholder="Adresse *" 
            required 
            className="w-full border p-2 rounded pr-10" 
            value={form.address} 
            onChange={handleChange} 
          />
          <button
            type="button"
            onClick={() => setIsMapOpen(true)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gold hover:text-gold/80 transition-colors"
            title="Sélectionner sur la carte"
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>
        {/* Livraison fixe */}
        <div className="border rounded p-3">
          <div className="font-semibold">Livraison</div>
          <div className="text-sm text-gray-700 mt-1">Livraison à domicile: 8 DT (fixe)</div>
        </div>
        <button type="submit" className="w-full bg-gold text-white py-2 rounded font-semibold hover:bg-gold/90 transition" disabled={loading}>
          {loading ? "Préparation..." : "Confirmer la commande"}
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Récapitulatif</h2>
        <ul className="mb-2">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between text-sm mb-1">
              <span>{item.name} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)}dt</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between text-sm">
          <span>Sous‑total</span>
          <span>{total.toFixed(2)}dt</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Frais de livraison</span>
          <span>{(deliveryOption === 'livraison' ? shippingFee : 0).toFixed(2)}dt</span>
        </div>
        <div className="flex justify-between font-bold text-navy mt-1">
          <span>Total</span>
          <span>{grandTotal.toFixed(2)}dt</span>
        </div>
      </div>

      {/* Dialog pour la sélection de la carte */}
      <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Sélectionner votre adresse sur la carte</DialogTitle>
            <DialogDescription>
              Cliquez sur la carte ou recherchez une adresse pour sélectionner votre position
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col px-6 pb-6">
            {/* Barre de recherche */}
            <div className="mb-4">
              <input
                id="address-search"
                type="text"
                placeholder="Rechercher une adresse..."
                className="w-full border p-2 rounded"
              />
            </div>

            {/* Carte */}
            <div className="flex-1 relative border rounded-lg overflow-hidden bg-gray-100">
              <div id="map-selector" className="w-full h-full min-h-[400px]" />
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de la carte...</p>
                    {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
                      <p className="text-xs text-red-500 mt-2 px-4">
                        Veuillez configurer NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans votre fichier .env.local
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsMapOpen(false);
                  setSelectedPosition(null);
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSelectLocation}
                className="bg-gold hover:bg-gold/90 text-white"
                disabled={!selectedPosition}
              >
                Confirmer cette adresse
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}