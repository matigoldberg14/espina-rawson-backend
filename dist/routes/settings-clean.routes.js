"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const router = (0, express_1.Router)();
const settingsController = new settings_controller_1.SettingsController();
// ENDPOINT COMPLETAMENTE LIMPIO PARA TESTING
router.put('/clean/:key', settingsController.updateSetting);
exports.default = router;
//# sourceMappingURL=settings-clean.routes.js.map