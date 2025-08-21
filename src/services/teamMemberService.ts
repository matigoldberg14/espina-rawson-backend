import { PrismaClient, TeamMember } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateTeamMemberData {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {}

export class TeamMemberService {
  async getAll(): Promise<TeamMember[]> {
    return prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  }

  async getAllForAdmin(): Promise<TeamMember[]> {
    return prisma.teamMember.findMany({
      orderBy: { order: 'asc' }
    });
  }

  async getById(id: string): Promise<TeamMember | null> {
    return prisma.teamMember.findUnique({
      where: { id }
    });
  }

  async create(data: CreateTeamMemberData): Promise<TeamMember> {
    return prisma.teamMember.create({
      data
    });
  }

  async update(id: string, data: UpdateTeamMemberData): Promise<TeamMember> {
    return prisma.teamMember.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<TeamMember> {
    return prisma.teamMember.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async reorder(ids: string[]): Promise<void> {
    const updates = ids.map((id, index) =>
      prisma.teamMember.update({
        where: { id },
        data: { order: index }
      })
    );
    await prisma.$transaction(updates);
  }
}

export default new TeamMemberService();
