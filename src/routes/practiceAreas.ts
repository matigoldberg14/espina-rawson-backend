import express from 'express';
import practiceAreaService from '../services/practiceAreaService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/practice-areas - Obtener todas las áreas de práctica (público)
router.get('/', async (req, res) => {
  try {
    const practiceAreas = await practiceAreaService.getAll();
    res.json({ success: true, data: practiceAreas });
  } catch (error) {
    console.error('Error fetching practice areas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/practice-areas/admin - Obtener todas las áreas de práctica (admin)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const practiceAreas = await practiceAreaService.getAllForAdmin();
    res.json({ success: true, data: practiceAreas });
  } catch (error) {
    console.error('Error fetching practice areas for admin:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/practice-areas/:id - Obtener área de práctica por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const practiceArea = await practiceAreaService.getById(id);
    
    if (!practiceArea) {
      return res.status(404).json({ success: false, message: 'Área de práctica no encontrada' });
    }
    
    res.json({ success: true, data: practiceArea });
  } catch (error) {
    console.error('Error fetching practice area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// POST /api/practice-areas - Crear nueva área de práctica
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, icon, order, isActive } = req.body;
    
    if (!title || !description || !icon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Título, descripción e icono son requeridos' 
      });
    }
    
    const practiceArea = await practiceAreaService.create({
      title,
      description,
      icon,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json({ success: true, data: practiceArea });
  } catch (error) {
    console.error('Error creating practice area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// PUT /api/practice-areas/:id - Actualizar área de práctica
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const practiceArea = await practiceAreaService.update(id, updateData);
    
    if (!practiceArea) {
      return res.status(404).json({ success: false, message: 'Área de práctica no encontrada' });
    }
    
    res.json({ success: true, data: practiceArea });
  } catch (error) {
    console.error('Error updating practice area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// DELETE /api/practice-areas/:id - Eliminar área de práctica
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const practiceArea = await practiceAreaService.delete(id);
    
    if (!practiceArea) {
      return res.status(404).json({ success: false, message: 'Área de práctica no encontrada' });
    }
    
    res.json({ success: true, data: practiceArea });
  } catch (error) {
    console.error('Error deleting practice area:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// POST /api/practice-areas/reorder - Reordenar áreas de práctica
router.post('/reorder', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({ 
        success: false, 
        message: 'IDs debe ser un array' 
      });
    }
    
    await practiceAreaService.reorder(ids);
    res.json({ success: true, message: 'Orden actualizado correctamente' });
  } catch (error) {
    console.error('Error reordering practice areas:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
