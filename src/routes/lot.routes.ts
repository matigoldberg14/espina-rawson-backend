import { Router } from 'express';
import { lotController } from '../controllers/lot.controller';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);
router.use(isAdmin);

// Obtener todos los lotes de una subasta
router.get('/auction/:auctionId', lotController.getLotsByAuction);

// Obtener un lote específico
router.get('/:id', lotController.getLotById);

// Crear un nuevo lote (con hasta 15 imágenes)
router.post('/', upload.array('images', 15), lotController.createLot);

// Actualizar un lote
router.put('/:id', upload.array('images', 15), lotController.updateLot);

// Eliminar un lote
router.delete('/:id', lotController.deleteLot);

// Agregar imágenes a un lote existente
router.post('/:id/images', upload.array('images', 15), lotController.addImages);

// Agregar video a un lote
router.post('/:id/videos', lotController.addVideo);

// Eliminar imagen de un lote
router.delete('/:id/images/:imageId', lotController.deleteImage);

// Eliminar video de un lote
router.delete('/:id/videos/:videoId', lotController.deleteVideo);

export default router;

