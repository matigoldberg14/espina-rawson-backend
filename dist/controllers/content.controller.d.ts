import { Request, Response, NextFunction } from 'express';
export declare class ContentController {
    private activityLog;
    getAllContent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getContentBySection: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getContentById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    createContent: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    updateContent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteContent: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    bulkUpdateContent: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=content.controller.d.ts.map