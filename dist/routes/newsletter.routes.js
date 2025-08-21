"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const newsletter_controller_1 = require("../controllers/newsletter.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const express_validator_1 = require("express-validator");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
const newsletterController = new newsletter_controller_1.NewsletterController();
// Rutas públicas
router.post('/subscribe', (0, express_validator_1.body)('email').isEmail().normalizeEmail(), (0, express_validator_1.body)('name').optional().isString().trim(), validation_middleware_1.validate, newsletterController.subscribe);
router.post('/unsubscribe', (0, express_validator_1.body)('email').isEmail().normalizeEmail(), validation_middleware_1.validate, newsletterController.unsubscribe);
// Rutas protegidas (admin)
router.get('/subscribers', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), (0, express_validator_1.query)('active').optional().isBoolean(), (0, express_validator_1.query)('page').optional().isInt({ min: 1 }), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }), validation_middleware_1.validate, newsletterController.getSubscribers);
router.delete('/subscribers/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), (0, express_validator_1.param)('id').isString(), validation_middleware_1.validate, newsletterController.deleteSubscriber);
router.get('/campaigns', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), (0, express_validator_1.query)('page').optional().isInt({ min: 1 }), (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }), validation_middleware_1.validate, newsletterController.getCampaigns);
router.post('/campaigns/send', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('SUPER_ADMIN', 'ADMIN'), (0, express_validator_1.body)('subject').isString().notEmpty(), (0, express_validator_1.body)('content').isString().notEmpty(), (0, express_validator_1.body)('testMode').optional().isBoolean(), validation_middleware_1.validate, newsletterController.sendCampaign);
exports.default = router;
//# sourceMappingURL=newsletter.routes.js.map