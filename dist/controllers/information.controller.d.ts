import { Request, Response, NextFunction } from 'express';
export declare class InformationController {
    getAllInformation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getInformationByType: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getInformationByCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getInformationById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    createInformation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updateInformation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteInformation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    toggleInformationStatus: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    reorderInformation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getTags: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadFile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=information.controller.d.ts.map