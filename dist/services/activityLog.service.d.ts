interface LogData {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
}
export declare class ActivityLogService {
    log(data: LogData): Promise<void>;
    getRecentActivity(limit?: number): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        } | null;
    } & {
        id: string;
        action: string;
        entity: string;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        userId: string | null;
    })[]>;
    getUserActivity(userId: string, limit?: number): Promise<{
        id: string;
        action: string;
        entity: string;
        entityId: string | null;
        details: import("@prisma/client/runtime/library").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        createdAt: Date;
        userId: string | null;
    }[]>;
    cleanOldLogs(daysToKeep?: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
export {};
//# sourceMappingURL=activityLog.service.d.ts.map