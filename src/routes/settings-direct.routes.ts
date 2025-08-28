import { Router } from 'express';
import { SettingsDirectController } from '../controllers/settings-direct.controller';

const router = Router();
const settingsController = new SettingsDirectController();

// RUTA DIRECTA SIN NINGÚN MIDDLEWARE
router.put('/:key', settingsController.updateSettingDirect);

export default router;
