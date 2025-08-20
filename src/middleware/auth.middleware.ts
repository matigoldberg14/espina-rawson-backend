import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { User } from '@prisma/client';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { message: 'No se proporcionó token de autenticación' },
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret'
    ) as JwtPayload;

    // Verificar si la sesión existe
    const session = await prisma.session.findUnique({
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
      await prisma.session.delete({ where: { id: session.id } });
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
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token inválido' },
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
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

// Middleware para verificar roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'No autenticado' },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: 'No tienes permisos para realizar esta acción' },
      });
    }

    next();
  };
};

// Middleware opcional para rutas que pueden o no requerir autenticación
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default-secret'
    ) as JwtPayload;

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (session && new Date() <= session.expiresAt && session.user.isActive) {
      req.user = session.user;
    }

    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin usuario
    next();
  }
};
