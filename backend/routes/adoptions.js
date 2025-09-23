import express from 'express';
import {
  getAdoptions,
  getAdoptionById,
  createAdoptionRequest,
  updateAdoptionRequest,
  deleteAdoptionRequest,
} from '../controllers/adoptionsController.js';

import { checkPermissions } from '../middlewares/permissions.js';
// Middleware de validación (similar a validateAlert)
import { validateAdoption } from '../middlewares/validationAdoption.js';

const router = express.Router();

router.get('/adoptions', getAdoptions);
router.get('/adoptions/:id', getAdoptionById);

router.post(
  '/adoptions',
  validateAdoption,
  checkPermissions('create_adoption'),
  createAdoptionRequest,
);

router.put(
  '/adoptions/:id',
  validateAdoption,
  checkPermissions('update_adoption'),
  updateAdoptionRequest,
);

router.delete(
  '/adoptions/:id',
  checkPermissions('delete_adoption'),
  deleteAdoptionRequest,
);

export default router;
