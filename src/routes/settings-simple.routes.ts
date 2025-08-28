import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';

const router = Router();
const settingsController = new SettingsController();

// RUTA SIMPLE SIN MIDDLEWARE - DEBE FUNCIONAR
router.put('/:key', settingsController.updateSetting);

export default router;
