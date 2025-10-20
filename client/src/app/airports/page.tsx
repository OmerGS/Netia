"use client"

import React from 'react';
import dynamic from 'next/dynamic'; // 1. Importer 'dynamic'

// 2. Créer une version dynamique du composant MapExplorer
//    Ceci est la correction cruciale.
const DynamicMap = dynamic(
  () => import('@/app/airports/AirportDashboard'), // Chemin vers votre composant client
  { 
    ssr: false, // 3. Désactiver le rendu côté serveur (SSR)
    loading: () => <p style={{ height: '90vh', width: '100%' }}>Loading map...</p> 
  }
);

export default function Home() {
  return (
    <main>      
      {/* 4. Utiliser le composant dynamique ici */}
      <DynamicMap />
    </main>
  );
}