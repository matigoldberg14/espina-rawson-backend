"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const index_1 = require("../index");
class ActivityLogService {
    async log(data) {
        try {
            await index_1.prisma.activityLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    entity: data.entity,
                    entityId: data.entityId,
                    details: data.details,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                },
            });
        }
        catch (error) {
            // No lanzar error para no interrumpir el flujo principal
            console.error('Error al registrar actividad:', error);
        }
    }
    async getRecentActivity(limit = 50) {
        return index_1.prisma.activityLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    async getUserActivity(userId, limit = 50) {
        return index_1.prisma.activityLog.findMany({
            where: { userId },
            take: limit,
            orderBy: { createdAt: 'desc' },
        });
    }
    async cleanOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        return index_1.prisma.activityLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
    }
}
exports.ActivityLogService = ActivityLogService;
//# sourceMappingURL=activityLog.service.js.map