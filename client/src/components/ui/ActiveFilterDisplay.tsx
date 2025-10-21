import React from 'react';
import type { AirportFilters } from '@/lib/types';

interface ActiveFiltersDisplayProps {
    filters: AirportFilters;
    isLoading: boolean;
}

export const ActiveFiltersDisplay = ({ filters, isLoading }: ActiveFiltersDisplayProps) => {
  
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    top: 15,
    left: 50,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '8px 12px',
    borderRadius: 6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    fontSize: 14,
    color: '#333',
    display: 'flex',
    alignItems: 'center',
  };

  if (isLoading) {
    return (
      <div style={baseStyle}>
        <span>Chargement des aéroports...</span>
      </div>
    );
  }
  
  const activeImportances = filters.importances && filters.importances.length > 0;
  
  return (
    <div style={baseStyle}>
      {activeImportances ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          Filtre Importance: 
          <strong style={{ fontWeight: 600, color: '#007bff' }}>
            {filters.importances!.join(', ')}
          </strong>
        </span>
      ) : (
        <span style={{ color: '#dc3545' }}>
          Aucun filtre d'importance sélectionné.
        </span>
      )}
    </div>
  );
};