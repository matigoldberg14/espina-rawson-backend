import { Request, Response, NextFunction } from 'express';
export declare class SettingsController {
    private activityLog;
    getAllSettings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSettingByKey: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    updateSetting: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    bulkUpdateSettings: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=settings.controller.d.ts.map