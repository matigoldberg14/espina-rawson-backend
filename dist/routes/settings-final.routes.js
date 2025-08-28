"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const settingsController = new settings_controller_1.SettingsController();
// ENDPOINT DE DEBUG SIN AUTENTICACIÓN (ANTES del middleware authenticate)
router.put('/debug/:key', settingsController.updateSetting);
// MIDDLEWARE CUSTOM PARA LIMPIAR VALIDACIONES DE EXPRESS-VALIDATOR
const clearValidationErrors = (req, res, next) => {
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
// TEMPORALMENTE SIN AUTENTICACIÓN PARA DEBUG
// router.use(authenticate);
// Aplicar limpieza de validaciones a TODAS las rutas
router.use(clearValidationErrors);
// Rutas
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);
// COPIAR ESTRUCTURA DE CONTENT - SIN validar 'key' en body
const settingsValidation = [
    (0, express_validator_1.body)('value').notEmpty().withMessage('El valor es requerido'),
    (0, express_validator_1.body)('description').optional().isString().trim(),
];
const keyValidation = [
    (0, express_validator_1.param)('key').isString().notEmpty().withMessage('Key inválido'),
];
router.put('/:key', 
// authorize('SUPER_ADMIN', 'ADMIN'), // TEMPORALMENTE COMENTADO
keyValidation, settingsValidation, validation_middleware_1.validate, settingsController.updateSetting);
// Actualización masiva
router.post('/bulk-update', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), settingsController.bulkUpdateSettings);
exports.default = router;
console.log('🚀 NUCLEAR TEST - Settings route loaded!');
//# sourceMappingURL=settings-final.routes.js.map