import { Router } from 'express';
// REMOVIDO: express-validator completamente
// import { body, param } from 'express-validator';
import { SettingsController } from '../controllers/settings.controller';
// REMOVIDO: validation middleware
// import { validate } from '../middleware/validation.middleware';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

// ENDPOINT DE DEBUG SIN AUTENTICACIÓN NI VALIDACIÓN
router.put('/debug/:key', settingsController.updateSetting);

// Todas las rutas requieren autenticación
router.use(authenticate);

// REMOVIDO: Todas las validaciones de express-validator
// const settingValidation = [
//   body('value')
//     .exists({ checkNull: true, checkFalsy: false })
//     .withMessage('El valor es requerido'),
//   body('description').optional().isString().trim(),
// ];

// Rutas
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

// ENDPOINT TEMPORAL SIN MIDDLEWARE PARA DEBUG
router.put('/test/:key', settingsController.updateSetting);

// TEMPORAL: Sin validación para debug
router.put(
  '/:key',
  authorize('SUPER_ADMIN', 'ADMIN'),
  settingsController.updateSetting
);

// Actualización masiva - SIN VALIDACIONES
router.post(
  '/bulk-update',
  authorize('SUPER_ADMIN', 'ADMIN'),
  settingsController.bulkUpdateSettings
);

export default router;
