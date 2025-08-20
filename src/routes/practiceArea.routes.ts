import { Router } from 'express';
import { body, param } from 'express-validator';
import { PracticeAreaController } from '../controllers/practiceArea.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const practiceAreaController = new PracticeAreaController();

// Validaciones
const practiceAreaValidation = [
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
  body('icon').optional().isString().trim(),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El orden debe ser un número positivo'),
];

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas
router.get('/', practiceAreaController.getAllPracticeAreas);
router.get('/:id', practiceAreaController.getPracticeAreaById);
router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  practiceAreaValidation,
  validate,
  practiceAreaController.createPracticeArea
);
router.put(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  practiceAreaValidation,
  validate,
  practiceAreaController.updatePracticeArea
);
router.delete(
  '/:id',
  authorize('SUPER_ADMIN'),
  practiceAreaController.deletePracticeArea
);

// Reordenar áreas
router.post(
  '/reorder',
  authorize('SUPER_ADMIN', 'ADMIN'),
  body('areas').isArray().withMessage('Se requiere un array de áreas'),
  validate,
  practiceAreaController.reorderPracticeAreas
);

export default router;
