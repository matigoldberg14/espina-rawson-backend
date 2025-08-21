import { Request, Response, NextFunction } from 'express';
export declare class NewsletterController {
    private activityLog;
    subscribe: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    unsubscribe: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getSubscribers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCampaigns: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendCampaign: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteSubscriber: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=newsletter.controller.d.ts.map