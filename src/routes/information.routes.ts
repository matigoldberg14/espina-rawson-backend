import express from 'express';
import multer from 'multer';
import { InformationController } from '../controllers/information.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const informationController = new InformationController();

// Configuración de multer para upload de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/information/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Permitir PDFs, imágenes y videos
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// Rutas públicas
router.get('/', informationController.getAllInformation);
router.get('/type/:type', informationController.getInformationByType);
router.get(
  '/category/:category',
  informationController.getInformationByCategory
);
router.get('/:id', informationController.getInformationById);

// Rutas protegidas (requieren autenticación)
router.post('/', authenticate, informationController.createInformation);
router.put('/:id', authenticate, informationController.updateInformation);
router.delete(
  '/:id',
  authenticate,
  informationController.deleteInformation
);
router.patch(
  '/:id/toggle',
  authenticate,
  informationController.toggleInformationStatus
);

// Rutas adicionales para funcionalidades avanzadas
router.post('/reorder', authenticate, informationController.reorderInformation);
router.get('/categories/list', informationController.getCategories);
router.get('/tags/list', informationController.getTags);

// Ruta de upload de archivos
router.post('/upload', authenticate, upload.single('file'), informationController.uploadFile);

export default router;
