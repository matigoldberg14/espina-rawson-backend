import { Request, Response, NextFunction } from 'express';
export declare class AuctionController {
    private activityLog;
    getAllAuctions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getFeaturedAuctions: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getAuctionById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    createAuction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateAuction: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteAuction: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    uploadImages: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    deleteImage: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    setPrimaryImage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateFeaturedAuctions: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    updateStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=auction.controller.d.ts.map