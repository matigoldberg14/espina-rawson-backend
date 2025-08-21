import { StudioContent } from '@prisma/client';
export interface CreateStudioContentData {
    section: string;
    title?: string;
    subtitle?: string;
    content: string;
    image?: string;
    order?: number;
    isActive?: boolean;
}
export interface UpdateStudioContentData extends Partial<CreateStudioContentData> {
}
export declare class StudioContentService {
    getAll(): Promise<StudioContent[]>;
    getAllForAdmin(): Promise<StudioContent[]>;
    getBySection(section: string): Promise<StudioContent | null>;
    getById(id: string): Promise<StudioContent | null>;
    create(data: CreateStudioContentData): Promise<StudioContent>;
    update(id: string, data: UpdateStudioContentData): Promise<StudioContent>;
    delete(id: string): Promise<StudioContent>;
    reorder(ids: string[]): Promise<void>;
}
declare const _default: StudioContentService;
export default _default;
//# sourceMappingURL=studioContentService.d.ts.map