import { Request, Response, NextFunction } from 'express';
export declare class DashboardController {
    private activityLog;
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getRecentActivity: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUpcomingAuctions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map