"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../index");
const authenticate = async (req, res, next) => {
    try {
        console.log('🔐 DEBUG - authenticate middleware called for:', req.method, req.path);
        // Obtener token del header
        const authHeader = req.headers.authorization;
        console.log('🔑 Auth header:', authHeader ? 'Present' : 'Missing');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: { message: 'No se proporcionó token de autenticación' },
            });
        }
        const token = authHeader.substring(7);
        // Verificar token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        // Verificar si la sesión existe
        const session = await index_1.prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!session) {
            return res.status(401).json({
                success: false,
                error: { message: 'Sesión inválida' },
            });
        }
        // Verificar si la sesión ha expirado
        if (new Date() > session.expiresAt) {
            await index_1.prisma.session.delete({ where: { id: session.id } });
            return res.status(401).json({
                success: false,
                error: { message: 'Sesión expirada' },
            });
        }
        // Verificar si el usuario está activo
        if (!session.user.isActive) {
            return res.status(403).json({
                success: false,
                error: { message: 'Usuario desactivado' },
            });
        }
        // Adjuntar usuario a la request
        req.user = session.user;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                error: { message: 'Token inválido' },
            });
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: { message: 'Token expirado' },
            });
        }
        return res.status(500).json({
            success: false,
            error: { message: 'Error al verificar autenticación' },
        });
    }
};
exports.authenticate = authenticate;
// Middleware para verificar roles
const authorize = (...roles) => {
    return (req, res, next) => {
        console.log('🛡️ DEBUG - authorize middleware called');
        console.log('👤 User:', req.user ? `${req.user.email} (${req.user.role})` : 'None');
        console.log('🎭 Required roles:', roles);
        if (!req.user) {
            console.log('❌ No user found');
            return res.status(401).json({
                success: false,
                error: { message: 'No autenticado' },
            });
        }
        if (!roles.includes(req.user.role)) {
            console.log('❌ User role not authorized:', req.user.role);
            return res.status(403).json({
                success: false,
                error: { message: 'No tienes permisos para realizar esta acción' },
            });
        }
        console.log('✅ Authorization successful');
        next();
    };
};
exports.authorize = authorize;
// Middleware opcional para rutas que pueden o no requerir autenticación
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default-secret');
        const session = await index_1.prisma.session.findUnique({
            where: { token },
            include: { user: true },
        });
        if (session && new Date() <= session.expiresAt && session.user.isActive) {
            req.user = session.user;
        }
        next();
    }
    catch (error) {
        // Si hay error, simplemente continuar sin usuario
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.middleware.js.map