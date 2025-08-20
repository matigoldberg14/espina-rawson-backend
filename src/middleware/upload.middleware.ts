import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import crypto from 'crypto';

// Configurar almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-');

    cb(null, `${sanitizedName}-${timestamp}-${uniqueSuffix}${ext}`);
  },
});

// Filtro de archivos
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Tipos de archivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'));
  }
};

// Crear middleware
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
  },
});

// Middleware para eliminar archivos en caso de error
export const cleanupFiles = (files: Express.Multer.File[]) => {
  const fs = require('fs').promises;
  files.forEach(async (file) => {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error(`Error al eliminar archivo ${file.path}:`, error);
    }
  });
};
