"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_direct_controller_1 = require("../controllers/settings-direct.controller");
const router = (0, express_1.Router)();
const settingsController = new settings_direct_controller_1.SettingsDirectController();
// RUTA DIRECTA SIN NINGÚN MIDDLEWARE
router.put('/:key', settingsController.updateSettingDirect);
exports.default = router;
//# sourceMappingURL=settings-direct.routes.js.map