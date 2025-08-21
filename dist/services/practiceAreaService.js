"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeAreaService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PracticeAreaService {
    async getAll() {
        return prisma.practiceArea.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    }
    async getAllForAdmin() {
        return prisma.practiceArea.findMany({
            orderBy: { order: 'asc' },
        });
    }
    async getById(id) {
        return prisma.practiceArea.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma.practiceArea.create({
            data,
        });
    }
    async update(id, data) {
        return prisma.practiceArea.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma.practiceArea.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async reorder(ids) {
        const updates = ids.map((id, index) => prisma.practiceArea.update({
            where: { id },
            data: { order: index },
        }));
        await prisma.$transaction(updates);
    }
}
exports.PracticeAreaService = PracticeAreaService;
exports.default = new PracticeAreaService();
//# sourceMappingURL=practiceAreaService.js.map