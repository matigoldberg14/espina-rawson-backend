import { Router } from 'express';
import { PublicController } from '../controllers/public.controller';
import { param } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();
const publicController = new PublicController();

// Rutas públicas - NO requieren autenticación

// Obtener todo el contenido de la página
router.get('/content', publicController.getAllContent);

// Obtener contenido por sección
router.get('/content/section/:section', publicController.getContentBySection);

// Obtener subastas públicas
router.get('/auctions', publicController.getActiveAuctions);

// Obtener subastas destacadas
router.get('/auctions/featured', publicController.getFeaturedAuctions);

// Obtener detalle de subasta
router.get(
  '/auctions/:id',
  param('id').isString().notEmpty(),
  validate,
  publicController.getAuctionDetail
);

// Obtener áreas de práctica
router.get('/practice-areas', publicController.getPracticeAreas);

// Obtener configuración pública
router.get('/settings', publicController.getPublicSettings);

export default router;
