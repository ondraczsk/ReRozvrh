// app/layout.tsx
import { fonts } from './fonts'
import { Providers } from './providers'
import React from 'react'
import type { Metadata, Viewport } from 'next';
export const viewport: Viewport = {  
  themeColor: '#0065BD', // Barva horní lišty
}
export const metadata: Metadata = {
  title: 'ReRozvrh FD ČVUT',
  description: 'Přehlednější rozvrh pro studenty fakulty dopravní Českého vysokého učení technického.',
  manifest: '/app.webmanifest', // Odkaz na manifest
  icons: {
    icon: [
      { rel: "icon", url: "/icons/icon-48x48.png", sizes: "48x48" },
      { rel: "icon", url: "/icons/icon-72x72.png", sizes: "72x72" },
      { rel: "icon", url: "/icons/icon-96x96.png", sizes: "96x96" },
      { rel: "icon", url: "/icons/icon-128x128.png", sizes: "128x128" },
      { rel: "icon", url: "/icons/icon-144x144.png", sizes: "144x144" },
      { rel: "icon", url: "/icons/icon-152x152.png", sizes: "152x152" },
      { rel: "icon", url: "/icons/icon-256x256.png", sizes: "256x256" },
      { rel: "icon", url: "/icons/icon-384x384.png", sizes: "384x384" },
      { rel: "icon", url: "/icons/icon-512x512.png", sizes: "512x512" },
    ], // Ikona pro záložky a PWA
    apple: '/icons/icon-192x192.png', // Pro iOS    
    shortcut: [{ rel: "shortcut icon", url: "/icons/favicon.ico" }],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="cs" className={fonts.inter.variable}><head>
    {/* Pokud chceš přidat další meta tagy přímo */}
    <link rel="manifest" href="/app.webmanifest" />

    <meta name="description" content="Přehlednější rozvrh pro studenty Fakulty dopravní Českého vysokého učení technického." />
  </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
