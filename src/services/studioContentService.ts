import { PrismaClient, StudioContent } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateStudioContentData {
  section: string;
  title?: string;
  subtitle?: string;
  content: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateStudioContentData
  extends Partial<CreateStudioContentData> {}

export class StudioContentService {
  async getAll(): Promise<StudioContent[]> {
    return prisma.studioContent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getAllForAdmin(): Promise<StudioContent[]> {
    return prisma.studioContent.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getBySection(section: string): Promise<StudioContent | null> {
    return prisma.studioContent.findFirst({
      where: { section, isActive: true },
    });
  }

  async getById(id: string): Promise<StudioContent | null> {
    return prisma.studioContent.findUnique({
      where: { id },
    });
  }

  async create(data: CreateStudioContentData): Promise<StudioContent> {
    return prisma.studioContent.create({
      data,
    });
  }

  async update(
    id: string,
    data: UpdateStudioContentData
  ): Promise<StudioContent> {
    return prisma.studioContent.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<StudioContent> {
    return prisma.studioContent.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async reorder(ids: string[]): Promise<void> {
    const updates = ids.map((id, index) =>
      prisma.studioContent.update({
        where: { id },
        data: { order: index },
      })
    );
    await prisma.$transaction(updates);
  }
}

export default new StudioContentService();
