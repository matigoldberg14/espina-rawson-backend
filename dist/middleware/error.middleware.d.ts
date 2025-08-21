import { Request, Response, NextFunction } from 'express';
interface ErrorWithStatusCode extends Error {
    statusCode?: number;
    code?: string;
}
export declare const errorHandler: (err: ErrorWithStatusCode, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map