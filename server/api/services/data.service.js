import driver from '../../config/neo4j.driver.js';

/**
 * Traduit le niveau d'importance qualitatif en un score PageRank minimum.
 * Basé sur l'analyse (Majeur >= 9.0, Régional >= 4.0).
 */
const translateImportanceToRank = (importanceLevel) => {
  const SCORE_MAJOR_HUB = 9.0; 
  
  const SCORE_REGIONAL_HUB = 4.0; 

  switch (importanceLevel) {
    case 'major':
      return SCORE_MAJOR_HUB;
    case 'regional':
      return SCORE_REGIONAL_HUB;
    case 'minor':
    default:
      return null;
  }
};


// === SERVICE POUR LES AÉROPORTS ===

export const getAirports = async ({ 
  country, continent, 
  minLat, maxLat, minLon, maxLon, 
  importance 
}) => {
  const session = driver.session();

  const minRank = translateImportanceToRank(importance);

  const params = {
    country: country || null,
    continent: continent || null,
    minLat: minLat ? parseFloat(minLat) : null,
    maxLat: maxLat ? parseFloat(maxLat) : null,
    minLon: minLon ? parseFloat(minLon) : null,
    maxLon: maxLon ? parseFloat(maxLon) : null,
    minRank: minRank
  };
  
  const query = `
    MATCH (a:Airport)
    WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL AND a.tz_db IS NOT NULL
    WITH a, split(a.tz_db, '/')[0] AS extractedContinent
    WHERE 
      ($minLat IS NULL OR a.latitude >= $minLat)
      AND ($maxLat IS NULL OR a.latitude <= $maxLat)
      AND ($minLon IS NULL OR a.longitude >= $minLon)
      AND ($maxLon IS NULL OR a.longitude <= $maxLon)
      AND ($country IS NULL OR a.country = $country)
      AND ($continent IS NULL OR extractedContinent = $continent)
      AND ($minRank IS NULL OR a.pageRank >= $minRank) 
    RETURN 
      a.iata AS iata, a.name AS name, a.city AS city, a.country AS country,
      extractedContinent AS continent, a.latitude AS latitude, a.longitude AS longitude,
      a.pageRank AS pageRank
    ORDER BY pageRank DESC
  `;

  try {
    const result = await session.run(query, params);

    return result.records.map(record => ({
      iata: record.get('iata'),
      name: record.get('name'),
      city: record.get('city'),
      country: record.get('country'),
      continent: record.get('continent'),
      latitude: record.get('latitude'),
      longitude: record.get('longitude'),
      pageRank: record.get('pageRank')
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des aéroports:', error);
    throw new Error('Impossible de récupérer les aéroports depuis la base de données.');
  } finally {
    await session.close();
  }
};


// === SERVICE POUR LES COMPAGNIES AÉRIENNES ===

export const getAirlines = async ({ country, active }) => {
  const session = driver.session();
  
  let isActive = null; 
  if (active === 'true') {
    isActive = true;
  } else if (active === 'false') {
    isActive = false;
  }

  const query = `
    MATCH (c:Airline)
    WHERE ($country IS NULL OR c.country = $country)
      AND ($active IS NULL OR c.active = $active)
    RETURN 
      c.name AS name,
      c.country AS country,
      c.iata AS iata,
      c.icao AS icao,
      c.callsign AS callsign,
      c.active AS active
    ORDER BY c.name
  `;

  try {
    const result = await session.run(query, { 
      country: country || null, 
      active: isActive 
    });

    return result.records.map(record => ({
      name: record.get('name'),
      country: record.get('country'),
      iata: record.get('iata'),
      icao: record.get('icao'),
      callsign: record.get('callsign'),
      active: record.get('active')
    }));

  } catch (error) {
    console.error('Erreur lors de la récupération des compagnies:', error);
    throw new Error('Impossible de récupérer les compagnies depuis la base de données.');
  } finally {
    await session.close();
  }
};