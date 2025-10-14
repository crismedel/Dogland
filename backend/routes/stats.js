import express from 'express';
import { getReportStats, getReportsByHealthState, getReportsBySpecies } from '../controllers/statsController.js';

const router = express.Router();

router.get('/summary', getReportStats);
router.get('/health-states', getReportsByHealthState);
router.get('/species', getReportsBySpecies);

export default router;