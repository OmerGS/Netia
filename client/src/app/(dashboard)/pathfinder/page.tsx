"use client"

import React from 'react';
import dynamic from 'next/dynamic'; 

const DynamicPathfinder = dynamic(
  () => import('./pathfindertool'),
  { 
    ssr: false,
    loading: () => <p style={{ height: '90vh', width: '100%' }}>Loading pathfinder...</p> 
  }
);

export default function Home() {
  return (
    <main>      
      <DynamicPathfinder />
    </main>
  );
}