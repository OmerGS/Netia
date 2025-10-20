import { Router } from 'express';
import { getAirlines, getAirports } from '../controllers/data.controller.js';

const router = Router();

router.get('/airlines', getAirlines);
router.get('/airports', getAirports);

export default router;