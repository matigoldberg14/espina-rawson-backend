import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { AuctionController } from '../controllers/auction.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';
import {
  uploadMiddleware,
  uploadMultipleImages,
  uploadPDFMiddleware,
} from '../middleware/upload.middleware';

const router = Router();
const auctionController = new AuctionController();

// Validaciones
const auctionValidation = [
  body('title')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('El título es requerido'),
  body('description')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('La descripción es requerida'),
  body('location').optional().isString().trim(),
  body('startingPrice')
    .isNumeric()
    .withMessage('El precio inicial debe ser un número'),
  body('endDate')
    .isISO8601()
    .withMessage('La fecha de finalización debe ser válida'),
  body('status')
    .optional()
    .isIn(['DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED', 'CANCELLED'])
    .withMessage('Estado inválido'),
];

const idValidation = [
  param('id').isString().notEmpty().withMessage('ID inválido'),
];

// Todas las rutas requieren autenticación excepto las públicas
router.use(authenticate);

// Rutas
router.get('/', auctionController.getAllAuctions);
router.get('/featured', auctionController.getFeaturedAuctions);
router.get('/:id', idValidation, validate, auctionController.getAuctionById);
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  uploadMultipleImages.any(), // Permitir cualquier archivo con cualquier nombre de campo
  auctionValidation,
  validate,
  auctionController.createAuction
);
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  uploadMultipleImages.any(), // Permitir cualquier archivo con cualquier nombre de campo
  idValidation,
  auctionValidation,
  validate,
  auctionController.updateAuction
);
router.delete(
  '/:id',
  authorize('SUPER_ADMIN'),
  idValidation,
  validate,
  auctionController.deleteAuction
);

// Gestión de imágenes
router.post(
  '/:id/images',
  authorize('SUPER_ADMIN', 'ADMIN'),
  idValidation,
  uploadMiddleware.array('images', 10),
  validate,
  auctionController.uploadImages
);
router.delete(
  '/:auctionId/images/:imageId',
  authorize('SUPER_ADMIN', 'ADMIN'),
  auctionController.deleteImage
);
router.put(
  '/:auctionId/images/:imageId/primary',
  authorize('SUPER_ADMIN', 'ADMIN'),
  auctionController.setPrimaryImage
);

// Gestión de destacados
router.put(
  '/featured/update',
  authorize('SUPER_ADMIN', 'ADMIN'),
  body('auctionIds').isArray().withMessage('Se requiere un array de IDs'),
  validate,
  auctionController.updateFeaturedAuctions
);

// Cambiar estado
router.put(
  '/:id/status',
  authorize('SUPER_ADMIN', 'ADMIN'),
  idValidation,
  body('status').isIn(['DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED', 'CANCELLED']),
  validate,
  auctionController.updateStatus
);

export default router;
