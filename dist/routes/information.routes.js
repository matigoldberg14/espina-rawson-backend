"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const information_controller_1 = require("../controllers/information.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const informationController = new information_controller_1.InformationController();
// Configuración de multer para upload de archivos
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/information/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname +
            '-' +
            uniqueSuffix +
            '.' +
            file.originalname.split('.').pop());
    },
});
const upload = (0, multer_1.default)({
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
            'video/ogg',
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    },
});
// Rutas públicas
router.get('/', informationController.getAllInformation);
router.get('/type/:type', informationController.getInformationByType);
router.get('/category/:category', informationController.getInformationByCategory);
router.get('/:id', informationController.getInformationById);
// Rutas protegidas (requieren autenticación)
router.post('/', auth_middleware_1.authenticate, informationController.createInformation);
router.put('/:id', auth_middleware_1.authenticate, informationController.updateInformation);
router.delete('/:id', auth_middleware_1.authenticate, informationController.deleteInformation);
router.patch('/:id/toggle', auth_middleware_1.authenticate, informationController.toggleInformationStatus);
// Rutas adicionales para funcionalidades avanzadas
router.post('/reorder', auth_middleware_1.authenticate, informationController.reorderInformation);
router.get('/categories/list', informationController.getCategories);
router.get('/tags/list', informationController.getTags);
// Ruta de upload de archivos
router.post('/upload', auth_middleware_1.authenticate, upload.single('file'), informationController.uploadFile);
exports.default = router;
//# sourceMappingURL=information.routes.js.map