"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const dashboardController = new dashboard_controller_1.DashboardController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
// Rutas del dashboard
router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getRecentActivity);
router.get('/auctions/upcoming', dashboardController.getUpcomingAuctions);
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map