import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { ActivityLogService } from '../services/activityLog.service';

export class AuthController {
  private activityLog = new ActivityLogService();

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Buscar usuario
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Credenciales inválidas' },
        });
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: { message: 'Credenciales inválidas' },
        });
      }

      // Verificar si el usuario está activo
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          error: { message: 'Usuario desactivado' },
        });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRE || '30d' } as jwt.SignOptions
      );

      // Calcular fecha de expiración
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Crear sesión
      await prisma.session.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      });

      // Actualizar último login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Registrar actividad
      await this.activityLog.log({
        userId: user.id,
        action: 'LOGIN',
        entity: 'auth',
        details: { email: user.email },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.substring(7);

      if (token) {
        // Eliminar sesión
        await prisma.session.deleteMany({
          where: { token },
        });
      }

      // Registrar actividad
      if (req.user) {
        await this.activityLog.log({
          userId: req.user.id,
          action: 'LOGOUT',
          entity: 'auth',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
      }

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token: oldToken } = req.body;

      if (!oldToken) {
        return res.status(400).json({
          success: false,
          error: { message: 'Token requerido' },
        });
      }

      // Verificar token viejo
      let decoded;
      try {
        decoded = jwt.verify(
          oldToken,
          process.env.JWT_SECRET || 'default-secret'
        ) as any;
      } catch (error) {
        return res.status(401).json({
          success: false,
          error: { message: 'Token inválido' },
        });
      }

      // Buscar sesión
      const session = await prisma.session.findUnique({
        where: { token: oldToken },
        include: { user: true },
      });

      if (!session || !session.user.isActive) {
        return res.status(401).json({
          success: false,
          error: { message: 'Sesión inválida' },
        });
      }

      // Generar nuevo token
      const newToken = jwt.sign(
        {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRE || '30d' } as jwt.SignOptions
      );

      // Actualizar sesión
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await prisma.session.update({
        where: { id: session.id },
        data: {
          token: newToken,
          expiresAt,
        },
      });

      res.json({
        success: true,
        data: {
          token: newToken,
          user: {
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'No autenticado' },
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          lastLogin: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'No autenticado' },
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Verificar contraseña actual
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuario no encontrado' },
        });
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          error: { message: 'Contraseña actual incorrecta' },
        });
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Actualizar contraseña
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      // Invalidar todas las sesiones del usuario
      await prisma.session.deleteMany({
        where: { userId: user.id },
      });

      // Registrar actividad
      await this.activityLog.log({
        userId: user.id,
        action: 'CHANGE_PASSWORD',
        entity: 'auth',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        message:
          'Contraseña actualizada exitosamente. Por favor, inicia sesión nuevamente.',
      });
    } catch (error) {
      next(error);
    }
  };
}
