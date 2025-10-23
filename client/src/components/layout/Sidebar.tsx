import React from 'react';
import Link from 'next/link';
import type { ImportanceLevel, AirportFilters } from '@/lib/types';
import { ImportanceFilter } from '@/components/filter/ImportanceFilter'; 
import { ChevronLeft, PlusCircle, XCircle } from 'lucide-react';

interface SidebarProps {
  isLoading: boolean;
  filters: AirportFilters;
  onImportanceToggle: (level: ImportanceLevel) => void;
  showWarning: boolean;
  importanceOptions: { label: string, value: ImportanceLevel }[];
  isCreationMode: boolean;
  onToggleCreationMode: () => void;
  isRouteCreationMode: boolean;
  onToggleRouteCreationMode: () => void;
}

export const Sidebar = ({
  isLoading,
  filters,
  onImportanceToggle,
  showWarning,
  importanceOptions,
  isCreationMode,
  onToggleCreationMode,
  isRouteCreationMode,
  onToggleRouteCreationMode,
}: SidebarProps) => {

  const creationButtonClass = isCreationMode 
    ? "bg-red-500 hover:bg-red-600"
    : "bg-blue-600 hover:bg-blue-700";

  const routeCreationButtonClass = isRouteCreationMode 
    ? "bg-red-500 hover:bg-red-600"
    : "bg-green-600 hover:bg-green-700";

  return (
    <aside className="w-80 h-screen flex flex-col flex-shrink-0 bg-gray-50 border-r border-gray-200 shadow-lg p-6 overflow-y-auto">
        
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium text-base inline-flex items-center transition-colors">
                <ChevronLeft />
                Accueil
            </Link>
        </div>


        <button
            onClick={onToggleCreationMode}
            disabled={isLoading || isRouteCreationMode}
            className={`
                w-full py-2 mb-3 rounded-lg font-semibold transition-colors flex items-center justify-center text-white 
                ${creationButtonClass} 
                ${isLoading || isRouteCreationMode ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {isCreationMode ? (
                <>
                    <XCircle />
                    Annuler Ajout Aéroport
                </>
            ) : (
                <>
                    <PlusCircle />
                    Créer un Nouvel Aéroport
                </>
            )}
        </button>
        
        <button
            onClick={onToggleRouteCreationMode}
            disabled={isLoading || isCreationMode} 
            className={`
                w-full py-2 mb-6 rounded-lg font-semibold transition-colors flex items-center justify-center text-white 
                ${routeCreationButtonClass} 
                ${isLoading || isCreationMode ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            {isRouteCreationMode ? (
                <>
                    <XCircle />
                    Annuler Ajout Route
                </>
            ) : (
                <>
                    <PlusCircle />
                    Créer une Nouvelle Route
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