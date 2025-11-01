
import type {Metadata} from 'next';

import './globals.css';

import {AppProviders} from '@/providers/app-providers';

export const metadata: Metadata = {
  title: 'EscalAds Intelligence',
  description: 'Plataforma de inteligência em tráfego pago focada em anúncios escalados.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground font-body antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
