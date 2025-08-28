import { Router } from 'express';
import { body, param } from 'express-validator';
import { SettingsController } from '../controllers/settings.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Validaciones
const settingValidation = [
  body('value').exists().withMessage('El valor es requerido'),
  body('description').optional().isString().trim(),
];

// Rutas
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);
router.put(
  '/:key',
  authorize('SUPER_ADMIN', 'ADMIN'),
  settingValidation,
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
