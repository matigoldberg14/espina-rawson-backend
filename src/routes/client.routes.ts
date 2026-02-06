import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ========== RUTAS PÚBLICAS ==========

// GET /api/clients - Obtener todos los clientes activos (público)
router.get('/', async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// ========== RUTAS ADMIN (requieren autenticación) ==========

// GET /api/clients/admin - Obtener todos los clientes (admin)
router.get('/admin', authenticate, async (req: Request, res: Response) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: clients });
  } catch (error) {
    console.error('Error fetching clients (admin):', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// POST /api/clients - Crear un nuevo cliente
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { name, logoUrl, website, order, isActive } = req.body;

    if (!name || !logoUrl) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el logo son obligatorios',
      });
    }

    const client = await prisma.client.create({
      data: {
        name,
        logoUrl,
        website: website || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    console.log(`✅ Cliente creado: ${client.name}`);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, message: 'Error al crear el cliente' });
  }
});

// PUT /api/clients/:id - Actualizar un cliente
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, website, order, isActive } = req.body;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(website !== undefined && { website }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date(),
      },
    });

    console.log(`✅ Cliente actualizado: ${client.name}`);
    res.json({ success: true, data: client });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el cliente' });
  }
});

// DELETE /api/clients/:id - Eliminar un cliente
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.client.delete({ where: { id } });
    console.log(`🗑️ Cliente eliminado: ${id}`);
    res.json({ success: true, message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el cliente' });
  }
});

export default router;
