import express from 'express';
import { InformationController } from '../controllers/information.controller';
import { authenticateToken } from '../middleware/auth.middleware';

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
router.post('/', authenticateToken, informationController.createInformation);
router.put('/:id', authenticateToken, informationController.updateInformation);
router.delete(
  '/:id',
  authenticateToken,
  informationController.deleteInformation
);
router.patch(
  '/:id/toggle',
  authenticateToken,
  informationController.toggleInformationStatus
);

export default router;
