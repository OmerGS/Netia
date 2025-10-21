'use client';

import React, { useState } from 'react';
import { searchItineraries } from '@/lib/api.service';
import type { Itinerary } from '@/lib/types';
import styles from '@/app/(dashboard)/pathfinder/pathfindertool.module.css';


const PathfinderTool = () => {
    const [departureIata, setDepartureIata] = useState('');
    const [arrivalIata, setArrivalIata] = useState('');
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
        setSelectedItinerary(itinerary);
    };

    return (
        <div className={styles.pathfinderContainer}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                    type="text"
                    value={departureIata}
                    onChange={(e) => setDepartureIata(e.target.value.toUpperCase())}
                    placeholder="Départ (IATA ex: CDG)"
                    className={styles.inputField}
                    maxLength={3}
                    disabled={isLoading}
                />
                <input
                    type="text"
                    value={arrivalIata}
                    onChange={(e) => setArrivalIata(e.target.value.toUpperCase())}
                    placeholder="Arrivée (IATA ex: JFK)"
                    className={styles.inputField}
                    maxLength={3}
                    disabled={isLoading}
                />
                <button type="submit" className={styles.searchButton} disabled={isLoading}>
                    {isLoading ? 'Recherche...' : 'Rechercher les Vols'}
                </button>
            </form>

            <div className={styles.resultsArea}>
                {error && <p className={styles.errorMessage}>{error}</p>}
                                
                {results && results.length > 0 && (
                    <>
                        <h3 className={styles.resultsHeader}>{results.length} Itinéraires trouvés</h3>
                        <div className={styles.itineraryList}>
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
                    <p className={styles.noResultsMessage}>Aucun itinéraire possible trouvé (Max. 2 escales).</p>
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
            className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
            onClick={() => onSelect(itinerary)}
        >
            <div className={styles.priceTag}>
                {itinerary.priceEUR} €
            </div>
            <div className={styles.details}>
                <p className={styles.routePath}>
                    {itinerary.route.join(' → ')}
                </p>
                <div className={styles.metrics}>
                    <span className={styles.stopsLabel}>{stopsLabel}</span>
                    <span>•</span>
                    <span title={itinerary.airlines.join(', ')}>{itinerary.airlines.join(' | ')}</span>
                    <span>•</span>
                    <span>{itinerary.totalKm.toLocaleString()} km</span>
                </div>
            </div>
        </div>
    );
};

export default PathfinderTool;