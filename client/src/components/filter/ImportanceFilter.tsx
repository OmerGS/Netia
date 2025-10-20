import React from 'react';
import type { ImportanceLevel } from '@/lib/types';
import { Checkbox } from './Checkbox';

interface ImportanceFilterProps {
  currentImportances: ImportanceLevel[];
  onToggle: (level: ImportanceLevel) => void;
  isLoading: boolean;
  showWarning: boolean;
  options: { label: string, value: ImportanceLevel }[];
}

export const ImportanceFilter = ({
  currentImportances,
  onToggle,
  isLoading,
  showWarning,
  options
}: ImportanceFilterProps) => {
  return (
    <section className="mb-6 pb-6 border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-1">
        Importance (Hubs)
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Basé sur le score PageRank.
      </p>
      <div className="space-y-2">
        {options.map(imp => (
          <Checkbox
            key={imp.value}
            label={imp.label}
            isChecked={(currentImportances || []).includes(imp.value)}
            onChange={() => onToggle(imp.value)}
            disabled={isLoading}
          />
        ))}
      </div>
      {showWarning && (
        <p className="mt-2 text-xs text-red-600">
          Attention : Afficher les mineurs peut ralentir.
        </p>
      )}
    </section>
  );
};