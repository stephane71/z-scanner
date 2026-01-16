import type { Metadata } from 'next'
import { HeroSection, FeaturesSection, TrustSection, CTASection } from '@/components/features/landing'

/**
 * Landing Page - Z-Scanner
 *
 * Public landing page presenting the value proposition.
 * Server Component for optimal SEO and performance.
 *
 * @see FR35 - Landing page publique
 */

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://z-scanner.app'),
  title: 'Z-Scanner - Digitalisez vos tickets Z',
  description:
    'Application mobile pour mara\u00eechers et commer\u00e7ants. Scannez, validez, archivez vos tickets Z en conformit\u00e9 NF525.',
  keywords: [
    'ticket Z',
    'mara\u00eecher',
    'commer\u00e7ant',
    'NF525',
    'OCR',
    'conformit\u00e9 fiscale',
    'caisse enregistreuse',
    'march\u00e9',
  ],
  authors: [{ name: 'Z-Scanner' }],
  openGraph: {
    title: 'Z-Scanner - Digitalisez vos tickets Z',
    description:
      'Scannez, validez, archivez vos tickets Z en conformit\u00e9 NF525.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Z-Scanner',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Z-Scanner - Digitalisez vos tickets Z',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Z-Scanner - Digitalisez vos tickets Z',
    description:
      'Scannez, validez, archivez vos tickets Z en conformit\u00e9 NF525.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <TrustSection />
      <CTASection />
    </main>
  )
}
