import { getAirlines as fetchAirlines } from '../services/data.service.js';
import { getAirports as fetchAirports } from '../services/data.service.js';
import { updateAirportName as updateAirportService } from '../services/data.service.js';

export const getAirlines = async (req, res) => {
  const { country, active } = req.query;

  try {
    const airlines = await fetchAirlines({ country, active });

    res.status(200).json(airlines);

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Gère la requête GET /airports
 */
export const getAirports = async (req, res) => {
  const { 
    country,
    minLat, maxLat, minLon, maxLon, 
    importances 
  } = req.query;

  try {
    const airports = await fetchAirports({ 
      country, 
      minLat, maxLat, minLon, maxLon, 
      importances
    });
    res.status(200).json(airports);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateAirport = async (req, res) => {
    const { iata } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ status: 'error', message: 'Le nouveau nom (name) est requis et doit être une chaîne non vide.' });
    }

    try {
        const success = await updateAirportService(iata.toUpperCase(), name.trim());

        if (success) {
            res.status(200).json({ status: 'success', message: `Le nom de l'aéroport ${iata} a été mis à jour.` });
        } else {
            res.status(404).json({ status: 'error', message: `Aucun aéroport trouvé avec l'IATA ${iata}.` });
        }
    } catch (error) {
        console.error('Erreur API lors de la mise à jour de l\'aéroport:', error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};