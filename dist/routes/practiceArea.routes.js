"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const practiceArea_controller_1 = require("../controllers/practiceArea.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const practiceAreaController = new practiceArea_controller_1.PracticeAreaController();
// Validaciones
const practiceAreaValidation = [
    (0, express_validator_1.body)('title')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('El título es requerido'),
    (0, express_validator_1.body)('description')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('La descripción es requerida'),
    (0, express_validator_1.body)('icon').optional().isString().trim(),
    (0, express_validator_1.body)('order')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El orden debe ser un número positivo'),
];
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
// Rutas
router.get('/', practiceAreaController.getAllPracticeAreas);
router.get('/:id', practiceAreaController.getPracticeAreaById);
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), practiceAreaValidation, validation_middleware_1.validate, practiceAreaController.createPracticeArea);
router.put('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), practiceAreaValidation, validation_middleware_1.validate, practiceAreaController.updatePracticeArea);
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN'), practiceAreaController.deletePracticeArea);
// Reordenar áreas
router.post('/reorder', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), (0, express_validator_1.body)('areas').isArray().withMessage('Se requiere un array de áreas'), validation_middleware_1.validate, practiceAreaController.reorderPracticeAreas);
exports.default = router;
//# sourceMappingURL=practiceArea.routes.js.map