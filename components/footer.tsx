import Link from "next/link"
import Image from "next/image"
import { Truck, Clock, Phone, Facebook, Instagram, Youtube, Linkedin, Pin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#005ea6] text-white">
      {/* Top benefits bar */}
      <div className="border-b border-white/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Truck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Livraison sur toute la Tunisie</p>
              <p className="text-xs text-white/80">Rapide et fiable</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Ouvert 24h/24</p>
              <p className="text-xs text-white/80">Service client disponible</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Contactez-nous au +216 31 31 00 00</p>
              <p className="text-xs text-white/80">Support et conseils</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links columns */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4">
              <Image src="/logoarab.png" alt="Logo" width={160} height={60} className="h-10 w-auto" />
            </div>
            <h3 className="text-base font-semibold mb-4">Notre société</h3>
            <ul className="space-y-2 text-white/90 text-sm">
              <li><Link href="/contact" className="hover:underline">Contact</Link></li>
              <li><Link href="/about" className="hover:underline">À propos</Link></li>
              <li><Link href="/stores" className="hover:underline">Nos magasins</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-4">Informations légales</h3>
            <ul className="space-y-2 text-white/90 text-sm">
              <li><Link href="/livraison" className="hover:underline">Livraison</Link></li>
              <li><Link href="/terms" className="hover:underline">Conditions d’utilisation</Link></li>
              <li><Link href="/paiement-securise" className="hover:underline">Paiement sécurisé</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-4">Votre compte</h3>
            <ul className="space-y-2 text-white/90 text-sm">
              <li><Link href="/orders" className="hover:underline">Commandes</Link></li>
              <li><Link href="/credits" className="hover:underline">Avoirs</Link></li>
              <li><Link href="/addresses" className="hover:underline">Adresses</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-base font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-white/90 text-sm">
              <li>Rue Manzel Hor 8090, Kelibia, Nabeul</li>
              <li>Tél: <a className="underline" href="tel:+21654123565">+216 54 123 565</a></li>
              <li>Email: <a className="underline" href="mailto:zgolliaziz206@gmail.com">zgolliaziz206@gmail.com</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Socials and copyright */}
      <div className="border-t border-white/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="YouTube" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Pinterest" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
                <Pin className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-white/80">© 2025 – ShoplyEasy</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

