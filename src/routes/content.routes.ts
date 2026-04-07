import { Router } from 'express';
import { body, param } from 'express-validator';
import { ContentController } from '../controllers/content.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const contentController = new ContentController();

// Validaciones
const contentValidation = [
  body('key')
    .optional()
    .isString()
    .trim()
    .notEmpty()
    .withMessage('La clave es requerida'),
  body('value')
    .isString()
    .trim()
    .withMessage('El valor debe ser texto'),
  body('description').optional().isString().trim(),
  body('section')
    .optional()
    .isString()
    .trim(),
];

const idValidation = [
  param('id').isString().notEmpty().withMessage('ID inválido'),
];

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas
router.get('/', contentController.getAllContent);
router.get('/section/:section', contentController.getContentBySection);
router.get('/:id', idValidation, validate, contentController.getContentById);
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  contentValidation,
  validate,
  contentController.createContent
);
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  idValidation,
  contentValidation,
  validate,
  contentController.updateContent
);
router.delete(
  '/:id',
  authorize('SUPER_ADMIN'),
  idValidation,
  validate,
  contentController.deleteContent
);

// Ruta especial para actualización masiva
router.post(
  '/bulk-update',
  authorize('SUPER_ADMIN', 'ADMIN'),
  contentController.bulkUpdateContent
);

export default router;
