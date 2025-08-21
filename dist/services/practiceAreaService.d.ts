import { PracticeArea } from '@prisma/client';
export interface CreatePracticeAreaData {
    title: string;
    description: string;
    icon: string;
    order?: number;
    isActive?: boolean;
}
export interface UpdatePracticeAreaData extends Partial<CreatePracticeAreaData> {
}
export declare class PracticeAreaService {
    getAll(): Promise<PracticeArea[]>;
    getAllForAdmin(): Promise<PracticeArea[]>;
    getById(id: string): Promise<PracticeArea | null>;
    create(data: CreatePracticeAreaData): Promise<PracticeArea>;
    update(id: string, data: UpdatePracticeAreaData): Promise<PracticeArea>;
    delete(id: string): Promise<PracticeArea>;
    reorder(ids: string[]): Promise<void>;
}
declare const _default: PracticeAreaService;
export default _default;
//# sourceMappingURL=practiceAreaService.d.ts.map