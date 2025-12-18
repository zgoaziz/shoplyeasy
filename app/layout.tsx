import type React from "react"
import type { Metadata } from "next"
import type { Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/components/cart-context"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { TranslationProvider } from "@/contexts/translation-context"

// Définir les polices
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "ShoplyEasy - Votre Boutique en Ligne",
  description:
    "Découvrez une large sélection de produits de qualité sur ShoplyEasy. Votre boutique en ligne pour tous vos besoins.",
    generator: 'Aziz zgolli',
    icons: {
      icon: "/logo.png",
      shortcut: "/logo.png",
      apple: "/logo.png",
    },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        <TranslationProvider>
        <CartProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </CartProvider>
        </TranslationProvider>
      </body>
    </html>
  )
}

