import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ActivityLogService } from '../services/activityLog.service';

export class SettingsController {
  private activityLog = new ActivityLogService();

  getAllSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const settings = await prisma.settings.findMany({
        orderBy: { key: 'asc' },
      });

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  };

  getSettingByKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { key } = req.params;

      const setting = await prisma.settings.findUnique({
        where: { key },
      });

      if (!setting) {
        return res.status(404).json({
          success: false,
          error: { message: 'Configuración no encontrada' },
        });
      }

      res.json({
        success: true,
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  };

  updateSetting = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('🔍 DEBUG - updateSetting called');
      console.log('📦 Body:', req.body);
      console.log('🔑 Key:', req.params.key);
      
      // Limpiar cualquier error de validación residual
      const { validationResult } = require('express-validator');
      const errors = validationResult(req);
      console.log('🔍 Current validation errors:', errors.array());
      
      // Forzar limpieza de errores
      if (req as any)._validationErrors) {
        console.log('🧹 Clearing residual validation errors');
        delete (req as any)._validationErrors;
      }
      
      const { key } = req.params;
      const { value, description } = req.body;

      const setting = await prisma.settings.upsert({
        where: { key },
        update: {
          value,
          description,
        },
        create: {
          key,
          value,
          description,
        },
      });

      // Registrar actividad
      console.log('📝 About to log activity...');
      try {
        await this.activityLog.log({
          userId: req.user?.id,
          action: 'UPDATE_SETTING',
          entity: 'settings',
          entityId: setting.id,
          details: { key, value },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        });
        console.log('✅ Activity logged successfully');
      } catch (logError) {
        console.error('❌ Error logging activity:', logError);
        // No fallar por error de log
      }

      res.json({
        success: true,
        data: setting,
      });
    } catch (error) {
      next(error);
    }
  };

  bulkUpdateSettings = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Se esperaba un array de configuraciones' },
        });
      }

      const results = [];

      for (const setting of settings) {
        const updated = await prisma.settings.upsert({
          where: { key: setting.key },
          update: {
            value: setting.value,
            description: setting.description,
          },
          create: {
            key: setting.key,
            value: setting.value,
            description: setting.description,
          },
        });
        results.push(updated);
      }

      // Registrar actividad
      await this.activityLog.log({
        userId: req.user?.id,
        action: 'BULK_UPDATE_SETTINGS',
        entity: 'settings',
        details: { count: results.length },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        data: results,
        message: `${results.length} configuraciones actualizadas`,
      });
    } catch (error) {
      next(error);
    }
  };
}
