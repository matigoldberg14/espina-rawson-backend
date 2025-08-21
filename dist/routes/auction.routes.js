"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auction_controller_1 = require("../controllers/auction.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
const auctionController = new auction_controller_1.AuctionController();
// Validaciones
const auctionValidation = [
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
    (0, express_validator_1.body)('location').optional().isString().trim(),
    (0, express_validator_1.body)('startingPrice')
        .isNumeric()
        .withMessage('El precio inicial debe ser un número'),
    (0, express_validator_1.body)('endDate')
        .isISO8601()
        .withMessage('La fecha de finalización debe ser válida'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED', 'CANCELLED'])
        .withMessage('Estado inválido'),
];
const idValidation = [
    (0, express_validator_1.param)('id').isString().notEmpty().withMessage('ID inválido'),
];
// Todas las rutas requieren autenticación excepto las públicas
router.use(auth_middleware_1.authenticate);
// Rutas
router.get('/', auctionController.getAllAuctions);
router.get('/featured', auctionController.getFeaturedAuctions);
router.get('/:id', idValidation, validation_middleware_1.validate, auctionController.getAuctionById);
router.post('/', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), auctionValidation, validation_middleware_1.validate, auctionController.createAuction);
router.put('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), idValidation, auctionValidation, validation_middleware_1.validate, auctionController.updateAuction);
router.delete('/:id', (0, auth_middleware_1.authorize)('SUPER_ADMIN'), idValidation, validation_middleware_1.validate, auctionController.deleteAuction);
// Gestión de imágenes
router.post('/:id/images', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), idValidation, upload_middleware_1.uploadMiddleware.array('images', 10), validation_middleware_1.validate, auctionController.uploadImages);
router.delete('/:auctionId/images/:imageId', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), auctionController.deleteImage);
router.put('/:auctionId/images/:imageId/primary', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), auctionController.setPrimaryImage);
// Gestión de destacados
router.put('/featured/update', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), (0, express_validator_1.body)('auctionIds').isArray().withMessage('Se requiere un array de IDs'), validation_middleware_1.validate, auctionController.updateFeaturedAuctions);
// Cambiar estado
router.put('/:id/status', (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), idValidation, (0, express_validator_1.body)('status').isIn(['DRAFT', 'PUBLISHED', 'ACTIVE', 'ENDED', 'CANCELLED']), validation_middleware_1.validate, auctionController.updateStatus);
exports.default = router;
//# sourceMappingURL=auction.routes.js.map