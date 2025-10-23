'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
    fetchAirlines, fetchAirlineById, updateAirline, deleteAirline, 
    fetchAirlineCoverage, fetchAirlineTopHubs, fetchAirlineFleetDiversity
} from '@/lib/api.service';
import type { Airline } from '@/lib/types';

import { 
    Plane, Edit, Trash2, Globe, BarChart2, Zap, Loader2 
} from 'lucide-react';


interface AirlineAnalysis {
    coverage: any;
    topHubs: any[];
    fleetDiversity: any;
}
const EmptyAnalysis: AirlineAnalysis = { coverage: null, topHubs: null, fleetDiversity: null };


const AirlineDashboard = () => {
    const [airlinesList, setAirlinesList] = useState<Airline[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedAirline, setSelectedAirline] = useState<Airline | null>(null);
    const [analysisData, setAnalysisData] = useState<AirlineAnalysis>(EmptyAnalysis);
    
    const [isLoadingList, setIsLoadingList] = useState(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); 
    

    useEffect(() => {
        const loadAirlines = async () => {
            setIsLoadingList(true);
            try {
                const response = await fetchAirlines(0, 8000);
                
                setAirlinesList(response.data.airlines || []); 
                
            } catch (error) {
                console.error("Erreur fetching airlines list:", error);
            } finally {
                setIsLoadingList(false);
            }
        };
        loadAirlines();
    }, []);

    useEffect(() => {
        if (selectedId === null) {
            setSelectedAirline(null);
            setAnalysisData(EmptyAnalysis);
            return;
        }

        const loadDetailsAndAnalysis = async () => {
            setIsLoadingDetails(true);
            try {
                const [airlineRes, coverageRes, hubsRes, fleetRes] = await Promise.all([
                    fetchAirlineById(selectedId),
                    fetchAirlineCoverage(selectedId),
                    fetchAirlineTopHubs(selectedId, 5),
                    fetchAirlineFleetDiversity(selectedId),
                ]);
                
                setSelectedAirline(airlineRes.data);
                setAnalysisData({
                    coverage: coverageRes.data,
                    topHubs: hubsRes.data,
                    fleetDiversity: fleetRes.data,
                });
            } catch (error) {
                console.error(`Erreur fetching details for ID ${selectedId}:`, error);
                setSelectedAirline(null);
                setAnalysisData(EmptyAnalysis);
            } finally {
                setIsLoadingDetails(false);
            }
        };
        loadDetailsAndAnalysis();
    }, [selectedId]);

    const handleUpdate = useCallback(async (updatedData: Partial<Airline>) => {
        if (!selectedAirline) return;
        try {
            await updateAirline(selectedAirline.id, updatedData);
            alert(`Compagnie ${selectedAirline.iata} mise à jour!`);
            
            setSelectedId(selectedAirline.id);
            setIsEditing(false);

            const response = await fetchAirlines(0, 8000); 
            setAirlinesList(response.data.airlines || []);
            
        } catch (error) {
            alert("Erreur lors de la mise à jour.");
        }
    }, [selectedAirline]);

    const handleDelete = useCallback(async () => {
        if (!selectedAirline || !window.confirm(`Confirmer la suppression de ${selectedAirline.name}?`)) return;
        
        try {
            await deleteAirline(selectedAirline.id);
            alert(`Compagnie ${selectedAirline.name} supprimée!`);
            setSelectedId(null);
            
            const response = await fetchAirlines(0, 8000);
            setAirlinesList(response.data.airlines || []);
            
        } catch (error) {
            alert("Erreur lors de la suppression.");
        }
    }, [selectedAirline]);


    const filteredAirlines = airlinesList.filter(airline => 
        airline.name.toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50 font-sans">
            
            <aside className="w-72 border-r border-gray-200 p-4 bg-white overflow-y-auto shadow-lg">
                <h2 className="text-xl font-bold mb-4 flex items-center text-blue-800">
                    <Plane className="w-5 h-5 mr-2"/> Compagnies
                </h2>
                
                <input
                    type="text"
                    placeholder="Rechercher nom ou IATA..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    disabled={isLoadingList}
                />

                {isLoadingList ? (
                    <p className="text-gray-500 text-center py-4 flex items-center justify-center">
                        <Loader2 className="animate-spin w-5 h-5 mr-2"/> Chargement...
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {filteredAirlines.map((airline) => (
                            <AirlineListItem 
                                key={airline.id} 
                                airline={airline}
                                isSelected={airline.id === selectedId}
                                onSelect={() => setSelectedId(airline.id)}
                            />
                        ))}
                        {filteredAirlines.length === 0 && searchTerm && (
                            <p className="text-gray-500 text-center py-4">Aucun résultat trouvé.</p>
                        )}
                    </div>
                )}
            </aside>

            <main className="flex-1 p-6 overflow-y-auto bg-white">
                {selectedAirline ? (
                    <AirlineDetailPanel 
                        airline={selectedAirline}
                        analysis={analysisData}
                        isLoading={isLoadingDetails}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        isEditing={isEditing}
                        onToggleEdit={() => setIsEditing(prev => !prev)}
                    />
                ) : (
                    <div className="p-10 text-center bg-blue-50 border border-blue-200 rounded-xl mt-16">
                        <p className="text-xl text-gray-700">Sélectionnez une compagnie pour voir ses analyses détaillées.</p>
                        <Plane className="w-16 h-16 mx-auto mt-4 text-blue-400"/>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AirlineDashboard;







interface AirlineListItemProps { airline: Airline; isSelected: boolean; onSelect: () => void }

const AirlineListItem: React.FC<AirlineListItemProps> = ({ airline, isSelected, onSelect }) => (
    <div 
        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 
            ${isSelected 
                ? 'border border-blue-500 bg-blue-100 font-semibold shadow-md' 
                : 'border border-gray-100 bg-white hover:bg-gray-50 hover:shadow-sm'
            }`}
        onClick={onSelect}
    >
        <p className="m-0 text-sm text-gray-800">{airline.name} <span className="text-xs text-gray-500">({airline.iata})</span></p>
        <p className="m-0 text-xs text-gray-500 mt-0.5">{airline.country} | ID: {airline.id}</p>
    </div>
);


const AirlineDetailPanel: React.FC<any> = ({ airline, analysis, isLoading, onUpdate, onDelete, isEditing, onToggleEdit }) => {
    
    const [formData, setFormData] = useState<Partial<Airline>>({ name: airline.name, country: airline.country, active: airline.active });

    useEffect(() => {
        setFormData({ name: airline.name, country: airline.country, active: airline.active });
    }, [airline]);

    const handleSave = () => {
        if (!formData.name || !formData.country) { alert("Le nom et le pays sont requis."); return; }
        onUpdate(formData);
        onToggleEdit();
    };

    const RenderAnalysisCard: React.FC<any> = ({ title, icon: Icon, value, detail }) => (
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition duration-300">
            <div className="flex items-center mb-2">
                <Icon className="w-5 h-5 text-blue-600 mr-2"/>
                <h4 className="text-xs font-semibold text-gray-500 uppercase">{title}</h4>
            </div>
            <p className="text-3xl font-extrabold text-gray-900 m-0">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{detail}</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto">
            <header className="flex justify-between items-center pb-3 border-b-4 border-blue-600">
                <h3 className="text-4xl font-extrabold text-gray-800">{airline.name} <span className="text-lg font-normal text-gray-500">({airline.iata}/{airline.icao})</span></h3>
                <div className="flex gap-4">
                    <button 
                        onClick={onToggleEdit} 
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center
                                ${isEditing ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                    >
                        <Edit className="w-4 h-4 mr-1"/> {isEditing ? 'Annuler' : 'Modifier'}
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 flex items-center"
                    >
                        <Trash2 className="w-4 h-4 mr-1"/> Supprimer
                    </button>
                </div>
            </header>

            {isEditing ? (
                <div className="p-6 border border-gray-300 rounded-lg mt-6 bg-gray-50 shadow-inner">
                    <h4 className="text-xl font-bold mb-4 text-gray-700">Édition des Données de Base</h4>
                    <input 
                        type="text" 
                        value={formData.name || ''} 
                        onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} 
                        placeholder="Nom de la compagnie" 
                        className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input 
                        type="text" 
                        value={formData.country || ''} 
                        onChange={(e) => setFormData(p => ({...p, country: e.target.value}))} 
                        placeholder="Pays d'origine" 
                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            checked={!!formData.active}
                            onChange={(e) => setFormData(p => ({...p, active: e.target.checked}))}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            id="active-status"
                        />
                        <label htmlFor="active-status" className="ml-2 text-sm font-medium text-gray-700">Compagnie Active</label>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button 
                            onClick={handleSave} 
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md"
                        >
                            Sauvegarder les modifications
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-6">
                    <div className="grid grid-cols-4 gap-6">
                        <div className="p-4 bg-gray-50 border-l-4 border-blue-500 rounded-lg shadow-md">
                            <p className="text-xs text-gray-500 uppercase mb-1 font-semibold">Statut Opérationnel</p>
                            <p className={`text-xl font-bold ${airline.active ? 'text-green-600' : 'text-red-600'} mb-2`}>
                                {airline.active ? 'ACTIF' : 'INACTIF'}
                            </p>
                            <p className="text-sm text-gray-700">Pays : <span className="font-medium">{airline.country}</span></p>
                            <p className="text-sm text-gray-500">ID : {airline.id}</p>
                        </div>

                        {isLoading ? (
                            <div className="col-span-3 flex items-center justify-center text-gray-500 text-lg">
                                <Loader2 className="animate-spin w-5 h-5 mr-2"/> Chargement des analyses...
                            </div>
                        ) : (
                            <>
                                <RenderAnalysisCard 
                                    title="Couverture Pays" 
                                    icon={Globe} 
                                    value={analysis.coverage?.countries || 'N/A'} 
                                    detail="Pays desservis (vols directs)"
                                />
                                <RenderAnalysisCard 
                                    title="Destinations Totales" 
                                    icon={Plane} 
                                    value={analysis.coverage?.destinations || 'N/A'} 
                                    detail="Aéroports uniques dans le réseau"
                                />
                                <RenderAnalysisCard 
                                    title="Flotte Unique" 
                                    icon={BarChart2} 
                                    value={analysis.fleetDiversity?.uniqueAircraftTypes || 'N/A'} 
                                    detail={`Types d'avions (${analysis.fleetDiversity?.sampleFleet.slice(0, 3).join(', ') || ''}... )`}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
            
            {analysis.topHubs && analysis.topHubs.length > 0 && !isEditing && (
                <section className="bg-white p-6 border border-gray-200 rounded-lg mt-6 shadow-lg">
                    <h4 className="text-xl font-bold mb-4 flex items-center text-gray-700 border-b pb-2">
                        <Zap className="w-5 h-5 text-yellow-500 mr-2"/> Top 5 Hubs Stratégiques
                    </h4>
                    
                    <div className="grid grid-cols-5 gap-4 font-semibold text-gray-600 text-sm border-b-2 border-gray-100 pb-2 mb-2">
                        <p className="col-span-1">HUB (IATA)</p>
                        <p className="col-span-2">Ville/Nom de l'Aéroport</p>
                        <p className="col-span-1 text-right">Routes Opérées</p>
                        <p className="col-span-1 text-right">PageRank du Hub</p>
                    </div>
                    
                    {analysis.topHubs.map((hub: any, index: number) => (
                        <div key={hub.iata} className={`grid grid-cols-5 gap-4 py-2 text-sm ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 rounded-md px-1`}>
                            <p className="font-bold text-gray-800">{hub.iata}</p>
                            <p className="col-span-2 text-gray-600">{hub.hubName || hub.city}</p>
                            <p className="text-gray-700 font-medium text-right">{hub.routesOperated}</p>
                            <p className="text-blue-600 font-mono text-right">{hub.airportPageRank.toFixed(4)}</p>
                        </div>
                    ))}
                </section>
            )}

        </div>
    );
};