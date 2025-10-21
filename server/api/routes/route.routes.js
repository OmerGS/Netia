import { Router } from 'express';
import { getDestinationsFromAirport } from '../controllers/route.controller.js';

const router = Router();

router.get('/from/:iata', getDestinationsFromAirport);

// TODO: Add endpoints for shortest path (/shortest/:dep/:arr) later

export default router;