import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import React from 'react';

import Navbar from '@/components/ui/Navbar'; 

export const metadata: Metadata = {
  title: 'Netia Dashboard',
  description: 'Exploration du réseau aérien',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; 
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col min-h-screen">
          <Navbar /> 
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}