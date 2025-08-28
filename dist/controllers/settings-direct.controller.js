"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsDirectController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class SettingsDirectController {
    // Actualización DIRECTA sin validaciones
    updateSettingDirect = async (req, res) => {
        try {
            console.log('🚀 DIRECT UPDATE - No validation');
            console.log('Key:', req.params.key);
            console.log('Body:', req.body);
            const { key } = req.params;
            const { value, description } = req.body;
            if (!value) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'El valor es requerido' },
                });
            }
            const setting = await prisma.settings.upsert({
                where: { key },
                create: {
                    key,
                    value,
                    description: description || `Configuración ${key}`,
                },
                update: {
                    value,
                    ...(description && { description }),
                },
            });
            res.json({
                success: true,
                data: setting,
            });
        }
        catch (error) {
            console.error('Error updating setting:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Error al actualizar configuración' },
            });
        }
    };
}
exports.SettingsDirectController = SettingsDirectController;
//# sourceMappingURL=settings-direct.controller.js.map