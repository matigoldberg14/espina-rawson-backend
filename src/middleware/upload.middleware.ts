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

// Filtro de archivos para imágenes
const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Tipos de archivo permitidos para imágenes
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

// Filtro de archivos para PDFs
const pdfFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Solo PDFs
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = file.mimetype === 'application/pdf';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'));
  }
};

// Crear middlewares
export const uploadMiddleware = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
  },
});

export const uploadPDFMiddleware = multer({
  storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
  },
});

// Middleware para múltiples archivos (imágenes)
export const uploadMultipleImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    files: 10, // Máximo 10 archivos
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
