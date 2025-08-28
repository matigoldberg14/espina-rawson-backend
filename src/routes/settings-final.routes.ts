import { Router } from 'express';
import { body, param } from 'express-validator';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();
const settingsController = new SettingsController();

// ENDPOINT DE DEBUG SIN AUTENTICACIÓN (ANTES del middleware authenticate)
router.put('/debug/:key', settingsController.updateSetting);

// MIDDLEWARE CUSTOM PARA LIMPIAR VALIDACIONES DE EXPRESS-VALIDATOR
const clearValidationErrors = (req: any, res: any, next: any) => {
  console.log('🧹 CLEARING validation errors for settings route');
  // Limpiar cualquier error de validación residual
  if (req._validationErrors) {
    delete req._validationErrors;
  }
  if (req.validationErrors) {
    delete req.validationErrors;
  }
  next();
};

// Todas las rutas requieren autenticación (EXCEPTO debug)
router.use(authenticate);

// Aplicar limpieza de validaciones a TODAS las rutas
router.use(clearValidationErrors);

// Rutas
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

// COPIAR ESTRUCTURA DE CONTENT - SIN validar 'key' en body
const settingsValidation = [
  body('value').notEmpty().withMessage('El valor es requerido'),
  body('description').optional().isString().trim(),
];

const keyValidation = [
  param('key').isString().notEmpty().withMessage('Key inválido'),
];

router.put(
  '/:key',
  authorize('SUPER_ADMIN', 'ADMIN'),
  keyValidation,
  settingsValidation,
  validate,
  settingsController.updateSetting
);

// Actualización masiva
router.post(
  '/bulk-update',
  authorize('SUPER_ADMIN', 'ADMIN'),
  settingsController.bulkUpdateSettings
);

export default router;
