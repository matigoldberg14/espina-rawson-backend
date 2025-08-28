import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';

const router = Router();
const settingsController = new SettingsController();

console.log('🚀 SIMPLE SETTINGS ROUTE LOADED - NO AUTH NO VALIDATION');

// RUTA SIMPLE SIN NADA - SOLO EL CONTROLADOR
router.put('/:key', settingsController.updateSetting);
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

export default router;
