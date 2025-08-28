import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const settingsController = new SettingsController();

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

// Todas las rutas requieren autenticación
router.use(authenticate);

// Aplicar limpieza de validaciones a TODAS las rutas
router.use(clearValidationErrors);

// Rutas
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

// RUTA PRINCIPAL SIN VALIDACIONES
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
