"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const router = (0, express_1.Router)();
const settingsController = new settings_controller_1.SettingsController();
// RUTA SIMPLE SIN MIDDLEWARE - DEBE FUNCIONAR
router.put('/:key', settingsController.updateSetting);
exports.default = router;
//# sourceMappingURL=settings-simple.routes.js.map