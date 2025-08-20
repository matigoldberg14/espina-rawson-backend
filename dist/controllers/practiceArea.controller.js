"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeAreaController = void 0;
const index_1 = require("../index");
const activityLog_service_1 = require("../services/activityLog.service");
class PracticeAreaController {
    activityLog = new activityLog_service_1.ActivityLogService();
    getAllPracticeAreas = async (req, res, next) => {
        try {
            const areas = await index_1.prisma.practiceArea.findMany({
                orderBy: { order: 'asc' },
            });
            res.json({
                success: true,
                data: areas,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getPracticeAreaById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const area = await index_1.prisma.practiceArea.findUnique({
                where: { id },
            });
            if (!area) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Área de práctica no encontrada' },
                });
            }
            res.json({
                success: true,
                data: area,
            });
        }
        catch (error) {
            next(error);
        }
    };
    createPracticeArea = async (req, res, next) => {
        try {
            const { title, description, icon, order } = req.body;
            // Obtener el orden máximo si no se proporciona
            let finalOrder = order;
            if (finalOrder === undefined) {
                const maxOrder = await index_1.prisma.practiceArea.findFirst({
                    orderBy: { order: 'desc' },
                    select: { order: true },
                });
                finalOrder = (maxOrder?.order ?? -1) + 1;
            }
            const area = await index_1.prisma.practiceArea.create({
                data: {
                    title,
                    description,
                    icon,
                    order: finalOrder,
                },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'CREATE',
                entity: 'practiceArea',
                entityId: area.id,
                details: { title },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.status(201).json({
                success: true,
                data: area,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updatePracticeArea = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, description, icon, order, isActive } = req.body;
            const area = await index_1.prisma.practiceArea.update({
                where: { id },
                data: {
                    title,
                    description,
                    icon,
                    order,
                    isActive,
                },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'UPDATE',
                entity: 'practiceArea',
                entityId: area.id,
                details: { title },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: area,
            });
        }
        catch (error) {
            next(error);
        }
    };
    deletePracticeArea = async (req, res, next) => {
        try {
            const { id } = req.params;
            const area = await index_1.prisma.practiceArea.findUnique({
                where: { id },
            });
            if (!area) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Área de práctica no encontrada' },
                });
            }
            await index_1.prisma.practiceArea.delete({
                where: { id },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'DELETE',
                entity: 'practiceArea',
                entityId: id,
                details: { title: area.title },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'Área de práctica eliminada exitosamente',
            });
        }
        catch (error) {
            next(error);
        }
    };
    reorderPracticeAreas = async (req, res, next) => {
        try {
            const { areas } = req.body;
            if (!Array.isArray(areas)) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Se esperaba un array de áreas' },
                });
            }
            // Actualizar el orden de cada área
            const updatePromises = areas.map((area, index) => {
                return index_1.prisma.practiceArea.update({
                    where: { id: area.id },
                    data: { order: index },
                });
            });
            await Promise.all(updatePromises);
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'REORDER',
                entity: 'practiceArea',
                details: { count: areas.length },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'Orden actualizado exitosamente',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.PracticeAreaController = PracticeAreaController;
//# sourceMappingURL=practiceArea.controller.js.map