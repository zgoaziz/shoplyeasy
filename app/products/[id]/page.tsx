import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductById } from '@/lib/models'

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return envUrl || 'http://localhost:3000'
}

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const product = await getProductById(params.id)
  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Le produit demandé est introuvable.'
    }
  }

  const baseUrl = getBaseUrl()
  const pageUrl = `${baseUrl}/products/${params.id}`
  const imagePath = (product as any).imageUrl || product.image || ''
  const absoluteImage = imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title: product.name,
      description: product.description,
      images: [
        {
          url: absoluteImage,
          alt: product.name,
        },
      ],
    },
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id)
  if (!product) return notFound()

  const imagePath = (product as any).imageUrl || product.image

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full aspect-square bg-white">
          {imagePath ? (
            <Image
              src={imagePath}
              alt={product.name}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg" />
          )}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-700 mb-6 whitespace-pre-line">{product.description}</p>
          {/* Ajoutez ici prix, variantes, CTA, etc. */}
        </div>
      </div>
    </main>
  )
}
