import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';

const router = Router();
const settingsController = new SettingsController();

// ENDPOINT COMPLETAMENTE LIMPIO PARA TESTING
router.put('/clean/:key', settingsController.updateSetting);

export default router;
