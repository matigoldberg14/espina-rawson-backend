import express from 'express';
import { InformationController } from '../controllers/information.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const informationController = new InformationController();

// Rutas públicas
router.get('/', informationController.getAllInformation);
router.get('/type/:type', informationController.getInformationByType);
router.get(
  '/category/:category',
  informationController.getInformationByCategory
);
router.get('/:id', informationController.getInformationById);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticate, informationController.createInformation);
router.put('/:id', authenticate, informationController.updateInformation);
router.delete(
  '/:id',
  authenticate,
  informationController.deleteInformation
);
router.patch(
  '/:id/toggle',
  authenticate,
  informationController.toggleInformationStatus
);

export default router;
