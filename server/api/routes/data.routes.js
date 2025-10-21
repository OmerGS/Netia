import { Router } from 'express';
import { getAirlines, getAirports, updateAirport, createAirport } from '../controllers/data.controller.js';

const router = Router();

router.get('/airlines', getAirlines);
router.get('/airports', getAirports);
router.put('/airport/:iata', updateAirport);
router.post('/airport', createAirport);

export default router;