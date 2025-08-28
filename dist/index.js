"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
// Importar rutas
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const content_routes_1 = __importDefault(require("./routes/content.routes"));
const auction_routes_1 = __importDefault(require("./routes/auction.routes"));
const settings_final_routes_1 = __importDefault(require("./routes/settings-final.routes"));
const settings_simple_routes_1 = __importDefault(require("./routes/settings-simple.routes"));
const settings_clean_routes_1 = __importDefault(require("./routes/settings-clean.routes"));
const settings_direct_routes_1 = __importDefault(require("./routes/settings-direct.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const practiceAreas_1 = __importDefault(require("./routes/practiceAreas"));
const teamMembers_1 = __importDefault(require("./routes/teamMembers"));
const studioContent_1 = __importDefault(require("./routes/studioContent"));
const information_routes_1 = __importDefault(require("./routes/information.routes"));
const public_routes_1 = __importDefault(require("./routes/public.routes"));
const newsletter_routes_1 = __importDefault(require("./routes/newsletter.routes"));
// Middlewares
const error_middleware_1 = require("./middleware/error.middleware");
const notFound_middleware_1 = require("./middleware/notFound.middleware");
// Cargar variables de entorno
dotenv_1.default.config();
// TIMESTAMP: Force deploy v1.0.25 SETTINGS FIX - ${new Date().toISOString()}
// Inicializar Prisma
exports.prisma = new client_1.PrismaClient();
// Crear aplicación Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 requests por IP
    message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
});
// Middlewares globales
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// Servir archivos estáticos desde public
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:4321',
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Servir archivos estáticos (uploads)
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Servir el backoffice en producción
if (process.env.NODE_ENV === 'production') {
    app.use('/backoffice', express_1.default.static(path_1.default.join(__dirname, '../backoffice/dist')));
    app.get('/backoffice/*', (req, res) => {
        res.sendFile(path_1.default.join(__dirname, '../backoffice/dist/index.html'));
    });
}
// Rate limiting para rutas específicas
app.use('/api/auth/login', (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login, por favor intente más tarde.',
}));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});
// Rutas de la API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/content', content_routes_1.default);
app.use('/api/auctions', auction_routes_1.default);
// RUTA SIMPLE SIN NADA DE MIDDLEWARE
app.use('/api/settings-simple', settings_simple_routes_1.default);
// TEMPORAL: Nueva ruta para debug TOTAL
app.use('/api/settings-test', settings_final_routes_1.default);
// USAR LA RUTA FINAL LIMPIA
app.use('/api/settings', settings_final_routes_1.default);
app.use('/api/settings-clean', settings_clean_routes_1.default);
app.use('/api/settings-direct', settings_direct_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/practice-areas', practiceAreas_1.default);
app.use('/api/team-members', teamMembers_1.default);
app.use('/api/studio-content', studioContent_1.default);
app.use('/api/information', information_routes_1.default);
// Rutas públicas (para el frontend)
app.use('/api/public', public_routes_1.default);
app.use('/api/newsletter', newsletter_routes_1.default);
// Middleware de manejo de errores
app.use(notFound_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
// Función para inicializar el servidor
async function startServer() {
    try {
        // Conectar a la base de datos
        await exports.prisma.$connect();
        console.log('✅ Conexión a la base de datos establecida');
        // Crear carpeta de uploads si no existe
        const uploadsDir = path_1.default.join(__dirname, '../uploads');
        const fs = await Promise.resolve().then(() => __importStar(require('fs')));
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        // Iniciar servidor - Escuchar en 0.0.0.0 para Railway
        const HOST = '0.0.0.0';
        const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
        app.listen(port, HOST, () => {
            console.log(`🚀 Servidor corriendo en http://${HOST}:${port}`);
            console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
            console.log(`🔒 CORS habilitado para: ${process.env.FRONTEND_URL}`);
        });
    }
    catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n⏹️  Cerrando servidor...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n⏹️  Cerrando servidor...');
    await exports.prisma.$disconnect();
    process.exit(0);
});
// Iniciar servidor
startServer();
//# sourceMappingURL=index.js.map