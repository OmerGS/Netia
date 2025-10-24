import http from 'k6/http';
import { check } from 'k6';

const API_HOST = 'localhost'; 

export const options = {
  vus: 2500,
  duration: '10s',  
  iterations: 5000, 
};

function getRandomCoordinateNumber(min, max) {
    return Math.random() * (max - min) + min;
}

export default function () {
  const MIN_GLOBAL_LAT = 30;
  const MAX_GLOBAL_LAT = 60;
  const MIN_GLOBAL_LON = -15;
  const MAX_GLOBAL_LON = 30;
  
  const initialLat = getRandomCoordinateNumber(MIN_GLOBAL_LAT, MAX_GLOBAL_LAT);
  const initialLon = getRandomCoordinateNumber(MIN_GLOBAL_LON, MAX_GLOBAL_LON);
  
  const minLatNumber = initialLat;
  const maxLatNumber = getRandomCoordinateNumber(initialLat, initialLat + 5); 
  const minLonNumber = initialLon;
  const maxLonNumber = getRandomCoordinateNumber(initialLon, initialLon + 5);

  const minLat = minLatNumber.toFixed(15);
  const maxLat = maxLatNumber.toFixed(15);
  const minLon = minLonNumber.toFixed(15);
  const maxLon = maxLonNumber.toFixed(15);

  const url = `http://${API_HOST}:4000/api/v1/data/airports?importances=major,regional,minor&minLat=${minLat}&maxLat=${maxLat}&minLon=${minLon}&maxLon=${maxLon}`;

  const res = http.get(url);

  check(res, {
    'Corps de la réponse non vide': (r) => r.body && r.body.length > 0,
    'Statut 200 (OK)': (r) => r.status === 200,
    'Corps de la réponse non vide': (r) => r.body.length > 0, 
    'Temps de réponse < 500ms (p95)': (r) => r.timings.duration < 500,
  });
}