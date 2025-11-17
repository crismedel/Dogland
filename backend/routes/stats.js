import express from 'express';
import { getReportStats, getReportsByHealthState, getReportsBySpecies, getHeatmapData, getUserImpact, getReportsTrend } from '../controllers/statsController.js';
import { authenticateToken, authorizeRol } from '../middlewares/auth.js';

const router = express.Router();

router.get('/heatmap-data', getHeatmapData);
router.get('/summary', getReportStats);
router.get('/health-states', getReportsByHealthState);
router.get('/species', getReportsBySpecies);
router.get(
  '/user-impact',
  authenticateToken,
  authorizeRol(['Usuario', 'Trabajador', 'Admin']),
  getUserImpact
);
router.get('/trend', getReportsTrend);
export default router;