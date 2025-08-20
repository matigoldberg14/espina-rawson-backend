import { Request, Response, NextFunction } from 'express';
export declare class PracticeAreaController {
    private activityLog;
    getAllPracticeAreas: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPracticeAreaById: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    createPracticeArea: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    updatePracticeArea: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deletePracticeArea: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    reorderPracticeAreas: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=practiceArea.controller.d.ts.map