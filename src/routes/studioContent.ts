import express from 'express';
import studioContentService from '../services/studioContentService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /api/studio-content - Obtener todo el contenido del estudio (público)
router.get('/', async (req, res) => {
  try {
    const studioContent = await studioContentService.getAll();
    res.json({ success: true, data: studioContent });
  } catch (error) {
    console.error('Error fetching studio content:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/studio-content/admin - Obtener todo el contenido del estudio (admin)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const studioContent = await studioContentService.getAllForAdmin();
    res.json({ success: true, data: studioContent });
  } catch (error) {
    console.error('Error fetching studio content for admin:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/studio-content/section/:section - Obtener contenido por sección
router.get('/section/:section', async (req, res) => {
  try {
    const { section } = req.params;
    const content = await studioContentService.getBySection(section);
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
    }
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching studio content by section:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// GET /api/studio-content/:id - Obtener contenido por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await studioContentService.getById(id);
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
    }
    
    res.json({ success: true, data: content });
  } catch (error) {
    console.error('Error fetching studio content:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// POST /api/studio-content - Crear nuevo contenido del estudio
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { section, title, subtitle, content, image, order, isActive } = req.body;
    
    if (!section || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sección y contenido son requeridos' 
      });
    }
    
    const studioContent = await studioContentService.create({
      section,
      title,
      subtitle,
      content,
      image,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json({ success: true, data: studioContent });
  } catch (error) {
    console.error('Error creating studio content:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// PUT /api/studio-content/:id - Actualizar contenido del estudio
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const studioContent = await studioContentService.update(id, updateData);
    
    if (!studioContent) {
      return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
    }
    
    res.json({ success: true, data: studioContent });
  } catch (error) {
    console.error('Error updating studio content:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// DELETE /api/studio-content/:id - Eliminar contenido del estudio
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const studioContent = await studioContentService.delete(id);
    
    if (!studioContent) {
      return res.status(404).json({ success: false, message: 'Contenido no encontrado' });
    }
    
    res.json({ success: true, data: studioContent });
  } catch (error) {
    console.error('Error deleting studio content:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// POST /api/studio-content/reorder - Reordenar contenido del estudio
router.post('/reorder', authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids)) {
      return res.status(400).json({ 
        success: false, 
        message: 'IDs debe ser un array' 
      });
    }
    
    await studioContentService.reorder(ids);
    res.json({ success: true, message: 'Orden actualizado correctamente' });
  } catch (error) {
    console.error('Error reordering studio content:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

export default router;
