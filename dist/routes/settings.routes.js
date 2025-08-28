"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// REMOVIDO: express-validator completamente
// import { body, param } from 'express-validator';
const settings_controller_1 = require("../controllers/settings.controller");
// REMOVIDO: validation middleware
// import { validate } from '../middleware/validation.middleware';
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const settingsController = new settings_controller_1.SettingsController();
// ENDPOINT DE DEBUG SIN AUTENTICACIÓN NI VALIDACIÓN
router.put('/debug/:key', settingsController.updateSetting);
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
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
router.put('/:key', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), settingsController.updateSetting);
// Actualización masiva - SIN VALIDACIONES
router.post('/bulk-update', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), settingsController.bulkUpdateSettings);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map