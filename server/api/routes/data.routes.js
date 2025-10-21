import { Router } from 'express';
import { getAirlines, getAirports, updateAirport } from '../controllers/data.controller.js';

const router = Router();

router.get('/airlines', getAirlines);
router.get('/airports', getAirports);
router.put('/airport/:iata', updateAirport);

export default router;