"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const index_1 = require("../index");
const activityLog_service_1 = require("../services/activityLog.service");
class DashboardController {
    activityLog = new activityLog_service_1.ActivityLogService();
    getStats = async (req, res, next) => {
        try {
            const [totalAuctions, activeAuctions, totalBids, totalUsers, recentAuctions,] = await Promise.all([
                // Total de subastas
                index_1.prisma.auction.count(),
                // Subastas activas
                index_1.prisma.auction.count({
                    where: {
                        status: 'PUBLISHED',
                        endDate: { gt: new Date() },
                    },
                }),
                // Total de pujas
                index_1.prisma.bid.count(),
                // Total de usuarios
                index_1.prisma.user.count({
                    where: { isActive: true },
                }),
                // Subastas recientes
                index_1.prisma.auction.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        createdAt: true,
                        endDate: true,
                    },
                }),
            ]);
            // Calcular estadísticas adicionales
            const endingSoon = await index_1.prisma.auction.count({
                where: {
                    status: 'PUBLISHED',
                    endDate: {
                        gt: new Date(),
                        lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
                    },
                },
            });
            res.json({
                success: true,
                data: {
                    overview: {
                        totalAuctions,
                        activeAuctions,
                        totalBids,
                        totalUsers,
                        endingSoon,
                    },
                    recentAuctions,
                },
            });
        }
        catch (error) {
            next(error);
        }
    };
    getRecentActivity = async (req, res, next) => {
        try {
            const activities = await this.activityLog.getRecentActivity(20);
            res.json({
                success: true,
                data: activities,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getUpcomingAuctions = async (req, res, next) => {
        try {
            const auctions = await index_1.prisma.auction.findMany({
                where: {
                    status: 'PUBLISHED',
                    endDate: {
                        gt: new Date(),
                        lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Próximos 30 días
                    },
                },
                select: {
                    id: true,
                    title: true,
                    endDate: true,
                    startingPrice: true,
                    currentPrice: true,
                    _count: {
                        select: { bids: true },
                    },
                },
                orderBy: { endDate: 'asc' },
                take: 10,
            });
            res.json({
                success: true,
                data: auctions,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.DashboardController = DashboardController;
//# sourceMappingURL=dashboard.controller.js.map