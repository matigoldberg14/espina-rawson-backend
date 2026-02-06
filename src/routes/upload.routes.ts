import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { uploadMultipleImages } from '../middleware/upload.middleware';
import { imgbbService } from '../services/imgbb.service';

const router = Router();

// Requiere autenticación
router.use(authenticate);

// Subir una imagen a ImgBB y devolver la URL
router.post(
  '/image',
  uploadMultipleImages.single('image'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: { message: 'No se proporcionó ninguna imagen' },
        });
      }

      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          error: { message: 'El archivo debe ser una imagen' },
        });
      }

      console.log(`📤 Subiendo imagen a ImgBB: ${file.originalname} (${file.size} bytes)`);

      const imageUrl = await imgbbService.uploadImage(
        file.buffer,
        file.originalname
      );

      console.log(`✅ Imagen subida a ImgBB: ${imageUrl}`);

      res.json({
        success: true,
        data: {
          url: imageUrl,
          filename: file.originalname,
          size: file.size,
        },
      });
    } catch (error: any) {
      console.error('❌ Error subiendo imagen:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Error al subir la imagen' },
      });
    }
  }
);

export default router;
