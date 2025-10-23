import { Router } from 'express';
import { getAirlines, getAirports, updateAirport, createAirport, deleteAirport } from '../controllers/data.controller.js';

const router = Router();

router.get('/airlines', getAirlines);
router.get('/airports', getAirports);
router.put('/airport/:iata', updateAirport);
router.post('/airport', createAirport);
router.delete('/airport/:iata', deleteAirport);

export default router;