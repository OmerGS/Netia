import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';

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
      <body>{children}</body>
    </html>
  );
}