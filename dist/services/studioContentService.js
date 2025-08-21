"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioContentService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class StudioContentService {
    async getAll() {
        return prisma.studioContent.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    }
    async getAllForAdmin() {
        return prisma.studioContent.findMany({
            orderBy: { order: 'asc' },
        });
    }
    async getBySection(section) {
        return prisma.studioContent.findFirst({
            where: { section, isActive: true },
        });
    }
    async getById(id) {
        return prisma.studioContent.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma.studioContent.create({
            data,
        });
    }
    async update(id, data) {
        return prisma.studioContent.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma.studioContent.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async reorder(ids) {
        const updates = ids.map((id, index) => prisma.studioContent.update({
            where: { id },
            data: { order: index },
        }));
        await prisma.$transaction(updates);
    }
}
exports.StudioContentService = StudioContentService;
exports.default = new StudioContentService();
//# sourceMappingURL=studioContentService.js.map