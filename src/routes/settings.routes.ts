import { Router } from 'express';
import { body, param } from 'express-validator';
import { SettingsController } from '../controllers/settings.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

// ENDPOINT DE DEBUG SIN AUTENTICACIÓN NI VALIDACIÓN
router.put('/debug/:key', settingsController.updateSetting);

// Todas las rutas requieren autenticación
router.use(authenticate);

// Validaciones
const settingValidation = [
  body('value')
    .exists({ checkNull: true, checkFalsy: false })
    .withMessage('El valor es requerido'),
  body('description').optional().isString().trim(),
];

// Rutas
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

// ENDPOINT TEMPORAL SIN MIDDLEWARE PARA DEBUG
router.put('/test/:key', settingsController.updateSetting);

router.put(
  '/:key',
  authorize('SUPER_ADMIN', 'ADMIN'),
  settingsController.updateSetting
);

// Actualización masiva
router.post(
  '/bulk-update',
  authorize('SUPER_ADMIN', 'ADMIN'),
  settingsController.bulkUpdateSettings
);

export default router;
