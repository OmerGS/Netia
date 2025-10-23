'use client';

import React, { useState } from 'react';
import { searchItineraries } from '@/lib/api.service';
import type { Itinerary } from '@/lib/types';

const PathfinderTool = () => {
    const [departureIata, setDepartureIata] = useState('');
    const [arrivalIata, setArrivalIata] = useState('');
    const [maxStops, setMaxStops] = useState(2); 

    const [results, setResults] = useState<Itinerary[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedItinerary, setSelectedItinerary] = useState<Itinerary | null>(null); 

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResults(null);
        setSelectedItinerary(null);

        if (!departureIata || !arrivalIata) {
            setError("Veuillez saisir les deux codes IATA.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await searchItineraries(departureIata, arrivalIata);
            
            const sortedResults = response.data.sort((a, b) => a.priceEUR - b.priceEUR);
            
            setResults(sortedResults);
            if (sortedResults.length > 0) {
                setSelectedItinerary(sortedResults[0]);
            }
        } catch (err: any) {
            console.error("Pathfinding API Error:", err);
            setError("Erreur lors de la recherche d'itinéraires. Vérifiez les codes IATA ou la connexion API.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSelectItinerary = (itinerary: Itinerary) => {
        const isCurrentlySelected = selectedItinerary?.route.join('-') === itinerary.route.join('-');
        setSelectedItinerary(isCurrentlySelected ? null : itinerary);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-xl max-w-4xl mx-auto my-8">
            
            <form onSubmit={handleSearch} className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                
                <input
                    type="text"
                    value={departureIata}
                    onChange={(e) => setDepartureIata(e.target.value.toUpperCase())}
                    placeholder="Départ (IATA)"
                    className="p-2.5 border border-gray-300 rounded-md flex-grow text-base uppercase focus:ring-blue-500 focus:border-blue-500"
                    maxLength={3}
                    disabled={isLoading}
                />
                
                <input
                    type="text"
                    value={arrivalIata}
                    onChange={(e) => setArrivalIata(e.target.value.toUpperCase())}
                    placeholder="Arrivée (IATA)"
                    className="p-2.5 border border-gray-300 rounded-md flex-grow text-base uppercase focus:ring-blue-500 focus:border-blue-500"
                    maxLength={3}
                    disabled={isLoading}
                />
                
                <input
                    type="number"
                    value={maxStops}
                    onChange={(e) => setMaxStops(Math.min(3, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="Max. Escales"
                    title="Nombre maximum d'escales (0 à 3)"
                    className="p-2.5 border border-gray-300 rounded-md w-24 text-center text-base focus:ring-blue-500 focus:border-blue-500"
                    min={0}
                    max={3}
                    disabled={isLoading}
                />
                
                <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-md transition-colors hover:bg-blue-700 disabled:opacity-50" disabled={isLoading}>
                    {isLoading ? 'Recherche...' : 'Rechercher les Vols'}
                </button>
            </form>

            <div className="pt-2">
                {error && <p className="p-3 bg-red-100 text-red-700 border border-red-400 rounded-md mb-4">{error}</p>}
                
                {results === null && !error && !isLoading && (
                    <div className="p-8 text-center bg-blue-50 rounded-xl border border-blue-200/50 my-6">
                        <h3 className="text-xl font-bold text-blue-800 mb-2">Trouvez le Trajet Optimal</h3>
                        <p className="text-gray-600">Saisissez le code IATA de départ et d'arrivée pour explorer toutes les options de vol jusqu'à {maxStops} escales. Les itinéraires sont classés par coût optimal.</p>
                        <p className="mt-3 font-semibold text-gray-700">Exemple : CDG &rarr; IST</p>
                    </div>
                )}
                
                {results && results.length > 0 && (
                    <>
                        <h3 className="text-xl font-bold text-gray-800 mt-6 mb-4">{results.length} Itinéraires trouvés</h3>
                        <div className="flex flex-col space-y-4">
                            {results.map((itinerary, index) => (
                                <ItineraryCard 
                                    key={index} 
                                    itinerary={itinerary}
                                    isSelected={selectedItinerary?.route.join('-') === itinerary.route.join('-')}
                                    onSelect={handleSelectItinerary}
                                />
                            ))}
                        </div>
                    </>
                )}

                {results && results.length === 0 && (
                    <p className="p-4 bg-yellow-100 text-yellow-800 rounded-md text-center">Aucun itinéraire possible trouvé (Max. {maxStops} escales).</p>
                )}
            </div>
        </div>
    );
};

interface ItineraryCardProps {
    itinerary: Itinerary;
    isSelected: boolean;
    onSelect: (itinerary: Itinerary) => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, isSelected, onSelect }) => {
    const stopsLabel = itinerary.stops === 0 ? 'Direct' : `${itinerary.stops} Escale${itinerary.stops > 1 ? 's' : ''}`;
    
    return (
        <div 
            className={`
                flex justify-between items-center p-4 rounded-lg border cursor-pointer transition-all duration-150 
                ${isSelected 
                    ? 'border-blue-600 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:shadow-sm'
                }
            `}
            onClick={() => onSelect(itinerary)}
        >
            <div className="text-3xl font-bold text-emerald-600 flex-shrink-0 ml-3">
                {itinerary.priceEUR} €
            </div>

            <div className="flex-grow mr-4 ml-4">
                <p className="text-lg font-semibold text-gray-800 mb-1 truncate">
                    {itinerary.route.join(' → ')}
                </p>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{stopsLabel}</span>
                    <span>•</span>
                    <span title={itinerary.airlines.join(', ')} className="truncate max-w-[150px]">{itinerary.airlines.join(' | ')}</span>
                    <span>•</span>
                    <span>{itinerary.totalKm.toLocaleString()} km</span>
                </div>
            </div>
        </div>
    );
};

export default PathfinderTool;