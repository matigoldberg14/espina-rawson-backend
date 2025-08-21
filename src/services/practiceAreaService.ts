import { PrismaClient, PracticeArea } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreatePracticeAreaData {
  title: string;
  description: string;
  icon: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdatePracticeAreaData extends Partial<CreatePracticeAreaData> {}

export class PracticeAreaService {
  async getAll(): Promise<PracticeArea[]> {
    return prisma.practiceArea.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
  }

  async getAllForAdmin(): Promise<PracticeArea[]> {
    return prisma.practiceArea.findMany({
      orderBy: { order: 'asc' }
    });
  }

  async getById(id: string): Promise<PracticeArea | null> {
    return prisma.practiceArea.findUnique({
      where: { id }
    });
  }

  async create(data: CreatePracticeAreaData): Promise<PracticeArea> {
    return prisma.practiceArea.create({
      data
    });
  }

  async update(id: string, data: UpdatePracticeAreaData): Promise<PracticeArea> {
    return prisma.practiceArea.update({
      where: { id },
      data
    });
  }

  async delete(id: string): Promise<PracticeArea> {
    return prisma.practiceArea.update({
      where: { id },
      data: { isActive: false }
    });
  }

  async reorder(ids: string[]): Promise<void> {
    const updates = ids.map((id, index) =>
      prisma.practiceArea.update({
        where: { id },
        data: { order: index }
      })
    );
    await prisma.$transaction(updates);
  }
}

export default new PracticeAreaService();
