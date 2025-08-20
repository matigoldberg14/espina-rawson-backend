import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ActivityLogService } from '../services/activityLog.service';

export class DashboardController {
  private activityLog = new ActivityLogService();

  getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [
        totalAuctions,
        activeAuctions,
        totalBids,
        totalUsers,
        recentAuctions,
      ] = await Promise.all([
        // Total de subastas
        prisma.auction.count(),

        // Subastas activas
        prisma.auction.count({
          where: {
            status: 'PUBLISHED',
            endDate: { gt: new Date() },
          },
        }),

        // Total de pujas
        prisma.bid.count(),

        // Total de usuarios
        prisma.user.count({
          where: { isActive: true },
        }),

        // Subastas recientes
        prisma.auction.findMany({
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
      const endingSoon = await prisma.auction.count({
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
    } catch (error) {
      next(error);
    }
  };

  getRecentActivity = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const activities = await this.activityLog.getRecentActivity(20);

      res.json({
        success: true,
        data: activities,
      });
    } catch (error) {
      next(error);
    }
  };

  getUpcomingAuctions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const auctions = await prisma.auction.findMany({
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
    } catch (error) {
      next(error);
    }
  };
}
