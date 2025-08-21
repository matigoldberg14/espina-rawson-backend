"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class TeamMemberService {
    async getAll() {
        return prisma.teamMember.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
    }
    async getAllForAdmin() {
        return prisma.teamMember.findMany({
            orderBy: { order: 'asc' },
        });
    }
    async getById(id) {
        return prisma.teamMember.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return prisma.teamMember.create({
            data,
        });
    }
    async update(id, data) {
        return prisma.teamMember.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma.teamMember.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async reorder(ids) {
        const updates = ids.map((id, index) => prisma.teamMember.update({
            where: { id },
            data: { order: index },
        }));
        await prisma.$transaction(updates);
    }
}
exports.TeamMemberService = TeamMemberService;
exports.default = new TeamMemberService();
//# sourceMappingURL=teamMemberService.js.map