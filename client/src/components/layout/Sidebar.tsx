import React from 'react';
import type { ImportanceLevel, AirportFilters } from '@/lib/types';
import { ImportanceFilter } from '@/components/filter/ImportanceFilter';

interface SidebarProps {
  isLoading: boolean;
  filters: AirportFilters;
  onImportanceToggle: (level: ImportanceLevel) => void;
  showWarning: boolean;
  importanceOptions: { label: string, value: ImportanceLevel }[];
}

export const Sidebar = ({
  isLoading,
  filters,
  onImportanceToggle,
  showWarning,
  importanceOptions
}: SidebarProps) => {
  return (
    <aside className="w-72 h-screen flex-shrink-0 bg-gray-50 border-r border-gray-200 p-6 overflow-y-auto shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Filtres</h2>

      <ImportanceFilter
        currentImportances={filters.importances || []}
        onToggle={onImportanceToggle}
        isLoading={isLoading}
        showWarning={showWarning}
        options={importanceOptions}
      />

    </aside>
  );
};