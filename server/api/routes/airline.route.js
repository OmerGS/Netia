import { Router } from 'express';
import { 
    getAirlines, 
    getAirlineById, 
    updateAirline, 
    deleteAirline,
    getAirlineCoverage, 
    getAirlineTopHubs, 
    getAirlineFleetDiversity 
} from '../controllers/airline.controller.js';

const router = Router();

// Routes CRUD
router.get('/', getAirlines);
router.get('/:id', getAirlineById);
router.put('/:id', updateAirline);
router.delete('/:id', deleteAirline);

// Routes d'Analyse
router.get('/:id/coverage', getAirlineCoverage);
router.get('/:id/hubs', getAirlineTopHubs);
router.get('/:id/fleet', getAirlineFleetDiversity);

export default router;