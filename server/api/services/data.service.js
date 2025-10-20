import driver from '../../config/neo4j.driver.js';

export const getAirports = async ({
  country,
  minLat, maxLat, minLon, maxLon,
  importances
}) => {
  const session = driver.session();

  const importanceList = importances ? (importances).split(',') : null;

  const params = {
    country: country || null,
    importanceList: importanceList,
    minLat: minLat ? parseFloat(minLat) : null,
    maxLat: maxLat ? parseFloat(maxLat) : null,
    minLon: minLon ? parseFloat(minLon) : null,
    maxLon: maxLon ? parseFloat(maxLon) : null,
  };

  const query = `
    MATCH (a:Airport)
    WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
    
    WITH a, 
      CASE
        WHEN a.pageRank >= 9.0 THEN 'major'
        WHEN a.pageRank >= 4.0 THEN 'regional'
        ELSE 'minor'
      END AS importanceCategory
      
    WHERE 
      ($minLat IS NULL OR a.latitude >= $minLat)
      AND ($maxLat IS NULL OR a.latitude <= $maxLat)
      AND ($minLon IS NULL OR a.longitude >= $minLon)
      AND ($maxLon IS NULL OR a.longitude <= $maxLon)
      
      AND ($country IS NULL OR a.country = $country)
      AND ($importanceList IS NULL OR importanceCategory IN $importanceList) 
      
    RETURN 
      a.iata AS iata, a.name AS name, a.city AS city, a.country AS country,
      a.latitude AS latitude, a.longitude AS longitude,
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
      latitude: record.get('latitude'),
      longitude: record.get('longitude'),
      pageRank: record.get('pageRank')
    }));

  } catch (error) {
    console.error('Erreur loading airports:', error);
    throw new Error('Could not fetch airports.');
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