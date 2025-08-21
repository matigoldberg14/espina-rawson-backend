"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const content_controller_1 = require("../controllers/content.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const contentController = new content_controller_1.ContentController();
// Validaciones
const contentValidation = [
    (0, express_validator_1.body)('key')
        .optional()
        .isString()
        .trim()
        .notEmpty()
        .withMessage('La clave es requerida'),
    (0, express_validator_1.body)('value')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('El valor es requerido'),
    (0, express_validator_1.body)('description').optional().isString().trim(),
    (0, express_validator_1.body)('section')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('La sección es requerida'),
];
const idValidation = [
    (0, express_validator_1.param)('id').isString().notEmpty().withMessage('ID inválido'),
];
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
// Rutas
router.get('/', contentController.getAllContent);
router.get('/section/:section', contentController.getContentBySection);
router.get('/:id', idValidation, validation_middleware_1.validate, contentController.getContentById);
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), contentValidation, validation_middleware_1.validate, contentController.createContent);
router.put('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), idValidation, contentValidation, validation_middleware_1.validate, contentController.updateContent);
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN'), idValidation, validation_middleware_1.validate, contentController.deleteContent);
// Ruta especial para actualización masiva
router.post('/bulk-update', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), contentController.bulkUpdateContent);
exports.default = router;
//# sourceMappingURL=content.routes.js.map