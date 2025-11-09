import express from 'express';
import { getReportStats, getReportsByHealthState, getReportsBySpecies, getHeatmapData, getUserImpact } from '../controllers/statsController.js';
import { authenticateToken} from '../middlewares/auth.js';

const router = express.Router();

router.get('/heatmap-data', getHeatmapData);
router.get('/summary', getReportStats);
router.get('/health-states', getReportsByHealthState);
router.get('/species', getReportsBySpecies);
router.get('/stats/user-impact', authenticateToken, getUserImpact);

export default router;