import driver from '../../config/neo4j.driver.js';

const calculateMockPrice = (stops, pathLegs, totalDistance, destinationPageRank) => {
    const AIRCRAFT_CAPACITY = {
        '737': 180, '320': 170, '777': 350, '380': 550, 'DH8': 70, 
        'CR9': 88, '744': 410,
    };
    const primaryLeg = pathLegs[0];
    const equipmentCode = primaryLeg.equipmentIATA || '737'; 
    const primaryAirline = primaryLeg.airline;
    const capacity = AIRCRAFT_CAPACITY[equipmentCode] || 150; 
    const demandProxy = destinationPageRank * 10; 
    const demandCapacityRatio = demandProxy / capacity;
    const demandAdjustment = Math.min(2.0, demandCapacityRatio) * 50; 
    const premiumCarriers = ['LH', 'BA', 'SQ', 'EK', 'QR'];
    const airlinePremium = premiumCarriers.includes(primaryAirline) ? 45 : 0;
    const PRICE_PER_KM = 0.065; 
    const COST_PER_STOP = 90;
    const BASE_FARE = 60;
    
    const distanceCost = totalDistance * PRICE_PER_KM;
    const stopCost = stops * COST_PER_STOP;
    
    const finalPrice = BASE_FARE + distanceCost + stopCost + demandAdjustment + airlinePremium;
    return Math.max(1, Math.round(finalPrice / 10) * 10);
};

export const findItineraries = async (depIata, arrIata) => {
  const session = driver.session();
  
  const multiQueryCypher = `
    // --- REQUÊTE 1
    MATCH p = (dep:Airport {iata: $depIata})-[:FLIES_TO*1..3]->(arr:Airport {iata: $arrIata})
    WHERE dep <> arr AND NONE(n IN nodes(p) WHERE n IS NULL)
    
    WITH p, arr.pageRank AS destPageRank, nodes(p) AS pathNodes

    // --- REQUÊTE 2
    UNWIND relationships(p) AS segment
    
    WITH p, destPageRank, pathNodes, segment, startNode(segment) AS a, endNode(segment) AS b
    
    WITH p, destPageRank, pathNodes, segment, 
         round(point.distance(
            point({latitude: a.latitude, longitude: a.longitude}), 
            point({latitude: b.latitude, longitude: b.longitude})
         ) / 1000) AS segmentDistanceKm
         
    // --- REQUÊTE 3
    WITH p, destPageRank, pathNodes,
         collect({ 
             airline: segment.airline_iata, 
             distance: segmentDistanceKm,
             equipmentIATA: head(split(segment.equipment_list, ' ')) 
         }) AS pathLegs
         
    // --- REQUÊTE 4
    WITH 
      [n IN pathNodes | n.iata] AS pathAirports,
      pathLegs,
      length(p) - 1 AS stops,
      destPageRank,
      pathNodes,
      reduce(totalKm = 0, leg IN pathLegs | totalKm + leg.distance) AS totalDistance
         
    // --- REQUÊTE 5
    WITH 
      pathAirports,
      pathLegs,
      stops,
      destPageRank,
      totalDistance,
      [n IN pathNodes | {iata: n.iata, lat: n.latitude, lon: n.longitude}] AS routeCoordinates
    
    // --- REQUÊTE 6
    RETURN
      pathAirports,
      pathLegs,
      stops,
      totalDistance,
      routeCoordinates,
      destPageRank,
      pathAirports[0] AS departure,
      pathAirports[size(pathAirports) - 1] AS arrival
    LIMIT 50
  `;

  try {
    const result = await session.run(multiQueryCypher, { depIata, arrIata });

    const itineraries = result.records.map(record => {
      const stops = record.get('stops').low;
      const pathAirports = record.get('pathAirports');
      const pathLegs = record.get('pathLegs');
      const totalDistance = record.get('totalDistance');
      const destPageRank = record.get('destPageRank'); 
      const routeCoordinates = record.get('routeCoordinates');

      const pathAirlines = pathLegs.map(leg => leg.airline);

      const priceEUR = calculateMockPrice(stops, pathLegs, totalDistance, destPageRank);

      return {
        departure: record.get('departure'),
        arrival: record.get('arrival'),
        stops: stops,
        route: pathAirports,
        airlines: pathAirlines,
        totalKm: totalDistance,
        priceEUR: priceEUR,
        routeCoordinates: routeCoordinates,
      };
    }).filter(itinerary => itinerary !== null);

    return itineraries;

  } catch (error) {
    console.error(`Error finding multi-query itineraries between ${depIata} and ${arrIata}:`, error);
    throw new Error('Could not retrieve flight itineraries with multi-query analysis.');
  } finally {
    await session.close();
  }
};