"use client"

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(
  () => import('@/app/(dashboard)/airports/AirportDashboard'),
  { 
    ssr: false,
    loading: () => <p style={{ height: '90vh', width: '100%' }}>Loading map...</p> 
  }
);

export default function Home() {
  return (
    <main>      
      <DynamicMap />
    </main>
  );
}