"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const public_controller_1 = require("../controllers/public.controller");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const publicController = new public_controller_1.PublicController();
// Rutas públicas - NO requieren autenticación
// Obtener todo el contenido de la página
router.get('/content', publicController.getAllContent);
// Obtener contenido por sección
router.get('/content/section/:section', publicController.getContentBySection);
// Obtener subastas públicas
router.get('/auctions', publicController.getActiveAuctions);
// Obtener subastas destacadas
router.get('/auctions/featured', publicController.getFeaturedAuctions);
// Obtener detalle de subasta
router.get('/auctions/:id', (0, express_validator_1.param)('id').isString().notEmpty(), validation_middleware_1.validate, publicController.getAuctionDetail);
// Obtener áreas de práctica
router.get('/practice-areas', publicController.getPracticeAreas);
// Obtener configuración pública
router.get('/settings', publicController.getPublicSettings);
exports.default = router;
//# sourceMappingURL=public.routes.js.map