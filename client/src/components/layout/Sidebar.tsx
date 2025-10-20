import React from 'react';
import Link from 'next/link';
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
      {/* Back Button */}
      <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium text-base inline-flex items-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0L7 10.414V17a1 1 0 11-2 0V3a1 1 0 112 0v6.586l4.293-4.293a1 1 0 111.414 1.414L8.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Accueil
      </Link>

      {/* Filters Title */}
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Filtres</h2>

      {/* Importance Filter Section */}
      {/* Assuming ImportanceFilter is now styled with Tailwind */}
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