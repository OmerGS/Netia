import React from 'react';
import type { AirportFilters } from '@/lib/types';
import styles from '../dashboard/Dashboard.module.css';

interface ActiveFiltersDisplayProps {
    filters: AirportFilters;
    isLoading: boolean;
}

export const ActiveFiltersDisplay = ({ filters, isLoading }: ActiveFiltersDisplayProps) => (
  <div className={styles.activeFilters}>
    {isLoading ? (
      <span>Chargement...</span>
    ) : (
      <>
        {filters.importances && filters.importances.length > 0 && (
          <span>Importance: <strong>{filters.importances.join(', ')}</strong></span>
        )}
        {(!filters.importances || filters.importances.length === 0) && (
          <span>Aucun filtre d'importance sélectionné.</span>
        )}
      </>
    )}
  </div>
);