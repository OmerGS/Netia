import React from 'react';
import styles from '../dashboard/Dashboard.module.css';
import { Checkbox } from './Checkbox';

interface ContinentFilterProps {
  currentContinents: string[];
  onToggle: (continent: string) => void;
  isLoading: boolean;
  options: string[];
}

export const ContinentFilter = ({ 
  currentContinents, 
  onToggle, 
  isLoading, 
  options 
}: ContinentFilterProps) => {
  return (
    <section className={styles.filterSection}>
      <h3>Continents</h3>
      <div className={styles.checkboxGroup}>
        {options.map(continent => (
          <Checkbox
            key={continent}
            label={continent}
            isChecked={(currentContinents || []).includes(continent)}
            onChange={() => onToggle(continent)}
            disabled={isLoading}
          />
        ))}
      </div>
    </section>
  );
};