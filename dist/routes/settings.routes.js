"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const settings_controller_1 = require("../controllers/settings.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const settingsController = new settings_controller_1.SettingsController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
// Validaciones
const settingValidation = [
    (0, express_validator_1.body)('key').isString().trim().notEmpty().withMessage('La clave es requerida'),
    (0, express_validator_1.body)('value').exists().withMessage('El valor es requerido'),
    (0, express_validator_1.body)('description').optional().isString().trim(),
];
// Rutas
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);
router.put('/:key', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), settingValidation, validation_middleware_1.validate, settingsController.updateSetting);
// Actualización masiva
router.post('/bulk-update', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), settingsController.bulkUpdateSettings);
exports.default = router;
//# sourceMappingURL=settings.routes.js.map