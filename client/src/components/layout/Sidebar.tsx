import React from 'react';
import Link from 'next/link';
import type { ImportanceLevel, AirportFilters } from '@/lib/types';
import { ImportanceFilter } from '@/components/filter/ImportanceFilter'; 

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);
const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const XCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

interface SidebarProps {
  isLoading: boolean;
  filters: AirportFilters;
  onImportanceToggle: (level: ImportanceLevel) => void;
  showWarning: boolean;
  importanceOptions: { label: string, value: ImportanceLevel }[];
  isCreationMode: boolean;
  onToggleCreationMode: () => void;
}

export const Sidebar = ({
  isLoading,
  filters,
  onImportanceToggle,
  showWarning,
  importanceOptions,
  isCreationMode,
  onToggleCreationMode,
}: SidebarProps) => {

  const creationButtonClass = isCreationMode 
    ? "bg-red-500 hover:bg-red-600"
    : "bg-blue-600 hover:bg-blue-700";

  return (
    <aside className="w-80 h-screen flex flex-col flex-shrink-0 bg-gray-50 border-r border-gray-200 shadow-lg p-6 overflow-y-auto">
        
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium text-base inline-flex items-center transition-colors">
                <ChevronLeftIcon />
                Accueil
            </Link>
        </div>

        <button
            onClick={onToggleCreationMode}
            disabled={isLoading}
            className={`
                w-full py-2 mb-6 rounded-lg font-semibold transition-colors flex items-center justify-center text-white 
                ${creationButtonClass} 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {isCreationMode ? (
                <>
                    <XCircleIcon />
                    Annuler la Création
                </>
            ) : (
                <>
                    <PlusCircleIcon />
                    Créer un Nouvel Aéroport
                </>
            )}
        </button>

        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtres</h2>

        <div className="flex-grow">
            <ImportanceFilter
                currentImportances={filters.importances || []}
                onToggle={onImportanceToggle}
                isLoading={isLoading}
                showWarning={showWarning}
                options={importanceOptions}
            />
        </div>
    </aside>
  );
};