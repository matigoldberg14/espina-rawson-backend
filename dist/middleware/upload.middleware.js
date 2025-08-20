"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupFiles = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
// Configurar almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        // Generar nombre único
        const uniqueSuffix = crypto_1.default.randomBytes(6).toString('hex');
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        const name = path_1.default.basename(file.originalname, ext);
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-');
        cb(null, `${sanitizedName}-${timestamp}-${uniqueSuffix}${ext}`);
    },
});
// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Tipos de archivo permitidos
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        cb(null, true);
    }
    else {
        cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)'));
    }
};
// Crear middleware
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB por defecto
    },
});
// Middleware para eliminar archivos en caso de error
const cleanupFiles = (files) => {
    const fs = require('fs').promises;
    files.forEach(async (file) => {
        try {
            await fs.unlink(file.path);
        }
        catch (error) {
            console.error(`Error al eliminar archivo ${file.path}:`, error);
        }
    });
};
exports.cleanupFiles = cleanupFiles;
//# sourceMappingURL=upload.middleware.js.map