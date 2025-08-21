"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamMemberService_1 = __importDefault(require("../services/teamMemberService"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// GET /api/team-members - Obtener todos los miembros del equipo (público)
router.get('/', async (req, res) => {
    try {
        const teamMembers = await teamMemberService_1.default.getAll();
        res.json({ success: true, data: teamMembers });
    }
    catch (error) {
        console.error('Error fetching team members:', error);
        res
            .status(500)
            .json({ success: false, message: 'Error interno del servidor' });
    }
});
// GET /api/team-members/admin - Obtener todos los miembros del equipo (admin)
router.get('/admin', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const teamMembers = await teamMemberService_1.default.getAllForAdmin();
        res.json({ success: true, data: teamMembers });
    }
    catch (error) {
        console.error('Error fetching team members for admin:', error);
        res
            .status(500)
            .json({ success: false, message: 'Error interno del servidor' });
    }
});
// GET /api/team-members/:id - Obtener miembro del equipo por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const teamMember = await teamMemberService_1.default.getById(id);
        if (!teamMember) {
            return res
                .status(404)
                .json({ success: false, message: 'Miembro del equipo no encontrado' });
        }
        res.json({ success: true, data: teamMember });
    }
    catch (error) {
        console.error('Error fetching team member:', error);
        res
            .status(500)
            .json({ success: false, message: 'Error interno del servidor' });
    }
});
// POST /api/team-members - Crear nuevo miembro del equipo
router.post('/', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { name, role, bio, image, linkedin, order, isActive } = req.body;
        if (!name || !role || !bio || !image) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, rol, biografía e imagen son requeridos',
            });
        }
        const teamMember = await teamMemberService_1.default.create({
            name,
            role,
            bio,
            image,
            linkedin,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true,
        });
        res.status(201).json({ success: true, data: teamMember });
    }
    catch (error) {
        console.error('Error creating team member:', error);
        res
            .status(500)
            .json({ success: false, message: 'Error interno del servidor' });
    }
});
// PUT /api/team-members/:id - Actualizar miembro del equipo
router.put('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const teamMember = await teamMemberService_1.default.update(id, updateData);
        if (!teamMember) {
            return res
                .status(404)
                .json({ success: false, message: 'Miembro del equipo no encontrado' });
        }
        res.json({ success: true, data: teamMember });
    }
    catch (error) {
        console.error('Error updating team member:', error);
        res
            .status(500)
            .json({ success: false, message: 'Error interno del servidor' });
    }
});
// DELETE /api/team-members/:id - Eliminar miembro del equipo
router.delete('/:id', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const teamMember = await teamMemberService_1.default.delete(id);
        if (!teamMember) {
            return res
                .status(404)
                .json({ success: false, message: 'Miembro del equipo no encontrado' });
        }
        res.json({ success: true, data: teamMember });
    }
    catch (error) {
        console.error('Error deleting team member:', error);
        res
            .status(500)
            .json({ success: false, message: 'Error interno del servidor' });
    }
});
// POST /api/team-members/reorder - Reordenar miembros del equipo
router.post('/reorder', auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                message: 'IDs debe ser un array',
            });
        }
        await teamMemberService_1.default.reorder(ids);
        res.json({ success: true, message: 'Orden actualizado correctamente' });
    }
    catch (error) {
        console.error('Error reordering team members:', error);
        res
            .status(500)
            .json({ success: false, message: 'Error interno del servidor' });
    }
});
exports.default = router;
//# sourceMappingURL=teamMembers.js.map