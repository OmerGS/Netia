import { 
    getAirlines as fetchAirlinesService, 
    getAirlineById as fetchAirlineByIdService,
    updateAirline as updateAirlineService,
    deleteAirline as deleteAirlineService,
    getAirlineCoverage as fetchAirlineCoverageService,
    getAirlineTopHubs as fetchAirlineTopHubsService,
    getAirlineFleetDiversity as fetchAirlineFleetDiversityService
} from '../services/airline.service.js';

const validateId = (id) => {
    const idInt = parseInt(id, 10);
    return !isNaN(idInt) && idInt > 0 ? idInt : null;
};

export const getAirlines = async (req, res) => {
    const { country, active, limit, skip } = req.query;
    
    const finalLimit = limit ? parseInt(limit, 10) : null;
    const finalSkip = skip ? parseInt(skip, 10) : 0;
    
    try {
        const response = await fetchAirlinesService({ 
            country, 
            active, 
            limit: finalLimit,
            skip: finalSkip
        });
        
        res.status(200).json({
            airlines: response.airlines,
            totalCount: response.totalCount
        });
        
    } catch (error) {
        console.error("Erreur dans le contrôleur getAirlines:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getAirlineById = async (req, res) => {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de compagnie invalide.' });

    try {
        const airline = await fetchAirlineByIdService(id);
        if (airline) {
            res.status(200).json(airline);
        } else {
            res.status(404).json({ status: 'error', message: 'Compagnie non trouvée.' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateAirline = async (req, res) => {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de compagnie invalide.' });

    const data = req.body;
    if (Object.keys(data).length === 0) {
        return res.status(400).json({ status: 'error', message: 'Aucune donnée fournie pour la mise à jour.' });
    }
    
    if (data.active !== undefined && typeof data.active === 'string') {
        data.active = data.active === 'true';
    }

    try {
        const success = await updateAirlineService(id, data);
        if (success) {
            res.status(200).json({ status: 'success', message: 'Compagnie mise à jour.' });
        } else {
            res.status(404).json({ status: 'error', message: 'Compagnie non trouvée ou échec de la mise à jour.' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const deleteAirline = async (req, res) => {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de compagnie invalide.' });

    try {
        const success = await deleteAirlineService(id);
        if (success) {
            res.status(200).json({ status: 'success', message: 'Compagnie supprimée avec succès (y compris ses relations).' });
        } else {
            res.status(404).json({ status: 'error', message: 'Compagnie non trouvée.' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getAirlineCoverage = async (req, res) => {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de compagnie invalide.' });
    
    try {
        const coverage = await fetchAirlineCoverageService(id);
        res.status(200).json(coverage);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getAirlineTopHubs = async (req, res) => {
    const id = validateId(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5;
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de compagnie invalide.' });
    
    try {
        const hubs = await fetchAirlineTopHubsService(id, limit);
        res.status(200).json(hubs);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const getAirlineFleetDiversity = async (req, res) => {
    const id = validateId(req.params.id);
    if (!id) return res.status(400).json({ status: 'error', message: 'ID de compagnie invalide.' });
    
    try {
        const diversity = await fetchAirlineFleetDiversityService(id);
        res.status(200).json(diversity);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};