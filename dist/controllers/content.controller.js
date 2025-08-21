"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentController = void 0;
const index_1 = require("../index");
const activityLog_service_1 = require("../services/activityLog.service");
class ContentController {
    activityLog = new activityLog_service_1.ActivityLogService();
    getAllContent = async (req, res, next) => {
        try {
            const contents = await index_1.prisma.pageContent.findMany({
                orderBy: [{ section: 'asc' }, { key: 'asc' }],
            });
            res.json({
                success: true,
                data: contents,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getContentBySection = async (req, res, next) => {
        try {
            const { section } = req.params;
            const contents = await index_1.prisma.pageContent.findMany({
                where: { section },
                orderBy: { key: 'asc' },
            });
            res.json({
                success: true,
                data: contents,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getContentById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const content = await index_1.prisma.pageContent.findUnique({
                where: { id },
            });
            if (!content) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Contenido no encontrado' },
                });
            }
            res.json({
                success: true,
                data: content,
            });
        }
        catch (error) {
            next(error);
        }
    };
    createContent = async (req, res, next) => {
        try {
            const { key, value, description, section } = req.body;
            // Verificar si ya existe una clave
            const existing = await index_1.prisma.pageContent.findUnique({
                where: { key },
            });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Ya existe contenido con esta clave' },
                });
            }
            const content = await index_1.prisma.pageContent.create({
                data: {
                    key,
                    value,
                    description,
                    section,
                },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'CREATE',
                entity: 'pageContent',
                entityId: content.id,
                details: { key, section },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.status(201).json({
                success: true,
                data: content,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateContent = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { value, description, section } = req.body;
            const content = await index_1.prisma.pageContent.update({
                where: { id },
                data: {
                    value,
                    description,
                    section,
                },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'UPDATE',
                entity: 'pageContent',
                entityId: content.id,
                details: { key: content.key, section },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: content,
            });
        }
        catch (error) {
            next(error);
        }
    };
    deleteContent = async (req, res, next) => {
        try {
            const { id } = req.params;
            const content = await index_1.prisma.pageContent.findUnique({
                where: { id },
            });
            if (!content) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Contenido no encontrado' },
                });
            }
            await index_1.prisma.pageContent.delete({
                where: { id },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'DELETE',
                entity: 'pageContent',
                entityId: id,
                details: { key: content.key, section: content.section },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'Contenido eliminado exitosamente',
            });
        }
        catch (error) {
            next(error);
        }
    };
    bulkUpdateContent = async (req, res, next) => {
        try {
            const { contents } = req.body;
            if (!Array.isArray(contents)) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Se esperaba un array de contenidos' },
                });
            }
            const results = [];
            for (const content of contents) {
                if (content.id) {
                    // Actualizar existente
                    const updated = await index_1.prisma.pageContent.update({
                        where: { id: content.id },
                        data: {
                            value: content.value,
                            description: content.description,
                            section: content.section,
                        },
                    });
                    results.push(updated);
                }
                else if (content.key) {
                    // Crear nuevo o actualizar por clave
                    const upserted = await index_1.prisma.pageContent.upsert({
                        where: { key: content.key },
                        update: {
                            value: content.value,
                            description: content.description,
                            section: content.section,
                        },
                        create: {
                            key: content.key,
                            value: content.value,
                            description: content.description,
                            section: content.section,
                        },
                    });
                    results.push(upserted);
                }
            }
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'BULK_UPDATE',
                entity: 'pageContent',
                details: { count: results.length },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: results,
                message: `${results.length} contenidos actualizados`,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ContentController = ContentController;
//# sourceMappingURL=content.controller.js.map