"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const index_1 = require("../index");
const activityLog_service_1 = require("../services/activityLog.service");
class SettingsController {
    activityLog = new activityLog_service_1.ActivityLogService();
    getAllSettings = async (req, res, next) => {
        try {
            const settings = await index_1.prisma.settings.findMany({
                orderBy: { key: 'asc' },
            });
            res.json({
                success: true,
                data: settings,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getSettingByKey = async (req, res, next) => {
        try {
            const { key } = req.params;
            const setting = await index_1.prisma.settings.findUnique({
                where: { key },
            });
            if (!setting) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Configuración no encontrada' },
                });
            }
            res.json({
                success: true,
                data: setting,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateSetting = async (req, res, next) => {
        try {
            const { key } = req.params;
            const { value, description } = req.body;
            const setting = await index_1.prisma.settings.upsert({
                where: { key },
                update: {
                    value,
                    description,
                },
                create: {
                    key,
                    value,
                    description,
                },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'UPDATE_SETTING',
                entity: 'settings',
                entityId: setting.id,
                details: { key, value },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: setting,
            });
        }
        catch (error) {
            next(error);
        }
    };
    bulkUpdateSettings = async (req, res, next) => {
        try {
            const { settings } = req.body;
            if (!Array.isArray(settings)) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Se esperaba un array de configuraciones' },
                });
            }
            const results = [];
            for (const setting of settings) {
                const updated = await index_1.prisma.settings.upsert({
                    where: { key: setting.key },
                    update: {
                        value: setting.value,
                        description: setting.description,
                    },
                    create: {
                        key: setting.key,
                        value: setting.value,
                        description: setting.description,
                    },
                });
                results.push(updated);
            }
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'BULK_UPDATE_SETTINGS',
                entity: 'settings',
                details: { count: results.length },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: results,
                message: `${results.length} configuraciones actualizadas`,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.SettingsController = SettingsController;
//# sourceMappingURL=settings.controller.js.map