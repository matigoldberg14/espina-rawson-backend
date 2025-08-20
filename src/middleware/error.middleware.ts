import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // Manejar errores de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 400;
      message = 'Ya existe un registro con estos datos únicos';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Registro no encontrado';
    }
  }

  // Manejar errores de validación
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
