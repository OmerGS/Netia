import { getAirlines as fetchAirlines } from '../services/data.service.js';
import { getAirports as fetchAirports } from '../services/data.service.js';

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
    country, continent, 
    minLat, maxLat, minLon, maxLon, 
    minRank 
  } = req.query;

  try {
    const airports = await fetchAirports({ 
      country, continent, 
      minLat, maxLat, minLon, maxLon, 
      minRank 
    });

    res.status(200).json(airports);
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};