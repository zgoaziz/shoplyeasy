import type { Metadata } from 'next'
import { getProductById } from '@/lib/models'

export const dynamic = 'force-dynamic'

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return envUrl || 'https://shoplyeasy.onrender.com'
}

export async function generateMetadata(
  ctx: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await ctx.params
  const product = await getProductById(id)
  const baseUrl = getBaseUrl()
  const pageUrl = `${baseUrl}/product/${id}`

  if (!product) {
    return {
      title: 'Produit introuvable',
      description: 'Le produit demandé est introuvable.',
      alternates: { canonical: pageUrl },
      openGraph: {
        type: 'website',
        url: pageUrl,
        title: 'Produit introuvable',
        description: 'Le produit demandé est introuvable.',
      },
      other: {
        'og:type': 'product',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Produit introuvable',
        description: 'Le produit demandé est introuvable.',
      },
    }
  }

  const imagePath = (product as any).imageUrl || (product as any).image || ''
  const absoluteImage = imagePath.startsWith('http')
    ? imagePath
    : `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`

  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      // Use website to satisfy Next runtime type checks
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
    other: {
      'og:type': 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [absoluteImage],
    },
  }
}

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return children
}
