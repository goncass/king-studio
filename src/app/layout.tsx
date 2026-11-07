import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
})

export const metadata: Metadata = {
  title: 'KingsStudio 2020 | Barbearia em Queluz',
  description: 'Barbearia KingsStudio 2020 em Queluz - Cortes de cabelo, barba, coloração e muito mais. Agende online. 4.9★ (49 avaliações)',
  keywords: ['barbearia', 'cabelo', 'barba', 'queluz', 'corte', 'agendamento online', 'kingsstudio'],
  authors: [{ name: 'KingsStudio 2020' }],
  creator: 'KingsStudio 2020',
  publisher: 'KingsStudio 2020',
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    url: 'https://kingsstudio.vercel.app',
    siteName: 'KingsStudio 2020',
    title: 'KingsStudio 2020 | Barbearia em Queluz',
    description: 'Barbearia KingsStudio 2020 em Queluz - Cortes de cabelo, barba, coloração e muito mais. Agende online.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'KingsStudio 2020 - Barbearia em Queluz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KingsStudio 2020 | Barbearia em Queluz',
    description: 'Barbearia KingsStudio 2020 em Queluz - Cortes de cabelo, barba, coloração e muito mais. Agende online.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}