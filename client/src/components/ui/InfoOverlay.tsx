import React from 'react';
import type { Airport, RouteDestination } from '@/lib/types';
import styles from '@/components/dashboard/Dashboard.module.css';

interface InfoOverlayProps {
  selectedAirport: Airport | null;
  destinations: RouteDestination[];
  isLoadingRoutes: boolean;
}

export const InfoOverlay = ({ selectedAirport, destinations, isLoadingRoutes }: InfoOverlayProps) => {
  if (!selectedAirport) {
    return null;
  }

  return (
    <div className={styles.activeFilters} style={{ top: '60px', left: '50px', flexDirection: 'column', alignItems: 'flex-start' }}>
      <h4>Routes depuis {selectedAirport.iata}</h4>
      {isLoadingRoutes ? (
        <span>Chargement des routes...</span>
      ) : (
        <>
          <span>Aéroports desservis : <strong>{destinations.length}</strong></span>
        </>
      )}
    </div>
  );
};