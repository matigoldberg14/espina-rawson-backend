import { Request, Response, NextFunction } from 'express';
export declare class PublicController {
    getAllContent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getContentBySection: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getActiveAuctions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFeaturedAuctions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuctionDetail: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getPracticeAreas: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPublicSettings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=public.controller.d.ts.map