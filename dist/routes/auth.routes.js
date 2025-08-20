"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = new auth_controller_1.AuthController();
// Validaciones
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('La contraseña es requerida'),
];
const changePasswordValidation = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
];
// Rutas públicas
router.post('/login', loginValidation, validation_middleware_1.validate, authController.login);
router.post('/refresh', authController.refreshToken);
// Rutas protegidas
router.post('/logout', auth_middleware_1.authenticate, authController.logout);
router.get('/me', auth_middleware_1.authenticate, authController.getProfile);
router.put('/change-password', auth_middleware_1.authenticate, changePasswordValidation, validation_middleware_1.validate, authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map