import express from 'express';
import { getReportStats, getReportsByHealthState, getReportsBySpecies, getHeatmapData } from '../controllers/statsController.js';

const router = express.Router();

router.get('/heatmap-data', getHeatmapData);
router.get('/summary', getReportStats);
router.get('/health-states', getReportsByHealthState);
router.get('/species', getReportsBySpecies);

export default router;