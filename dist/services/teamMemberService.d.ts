import { TeamMember } from '@prisma/client';
export interface CreateTeamMemberData {
    name: string;
    role: string;
    bio: string;
    image: string;
    linkedin?: string;
    order?: number;
    isActive?: boolean;
}
export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {
}
export declare class TeamMemberService {
    getAll(): Promise<TeamMember[]>;
    getAllForAdmin(): Promise<TeamMember[]>;
    getById(id: string): Promise<TeamMember | null>;
    create(data: CreateTeamMemberData): Promise<TeamMember>;
    update(id: string, data: UpdateTeamMemberData): Promise<TeamMember>;
    delete(id: string): Promise<TeamMember>;
    reorder(ids: string[]): Promise<void>;
}
declare const _default: TeamMemberService;
export default _default;
//# sourceMappingURL=teamMemberService.d.ts.map