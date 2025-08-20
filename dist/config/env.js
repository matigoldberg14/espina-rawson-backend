"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
exports.config = {
    // Server
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    // Database
    databaseUrl: process.env.DATABASE_URL || '',
    // JWT
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-this',
    jwtExpire: process.env.JWT_EXPIRE || '30d',
    // Admin
    adminEmail: process.env.ADMIN_EMAIL || 'admin@espinarawson.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
    // CORS
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4321',
    // Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    // Development
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
// Validar configuración requerida
const validateConfig = () => {
    const required = ['DATABASE_URL', 'JWT_SECRET'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};
exports.validateConfig = validateConfig;
//# sourceMappingURL=env.js.map