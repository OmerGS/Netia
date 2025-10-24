import React from 'react';
import type { AirportFilters } from '@/lib/types';

interface ActiveFiltersDisplayProps {
    filters: AirportFilters;
    isLoading: boolean;
}

export const ActiveFiltersDisplay = ({ filters, isLoading }: ActiveFiltersDisplayProps) => {
  
  const containerClasses = `
    absolute top-4 left-14 z-[600] 
    bg-white/90 backdrop-blur-sm // Utilisation d'une couleur de fond semi-transparente pour l'effet 'flottant'
    p-2 px-3 rounded-lg shadow-lg 
    text-sm text-gray-800 
    flex items-center space-x-2 
    transition-all duration-300
  `;

  if (isLoading) {
    return (
      <div className={containerClasses}>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Chargement des aéroports...</span>
      </div>
    );
  }
  
  const activeImportances = filters.importances && filters.importances.length > 0;
  
  return (
    <div className={containerClasses}>
      {activeImportances ? (
        <div className="flex items-center space-x-1">
            <span>Filtre Importance: </span>
            <strong className="font-semibold text-blue-600 ml-1">
              {filters.importances!.join(', ')}
            </strong>
        </div>
      ) : (
        <span className="text-red-600 font-medium">
          Aucun filtre d'importance sélectionné.
        </span>
      )}
    </div>
  );
};