import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class InformationController {
  // Obtener toda la información activa
  getAllInformation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const information = await prisma.information.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { publishDate: 'desc' }],
      });

      res.json({
        success: true,
        data: information,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtener información por tipo
  getInformationByType = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { type } = req.params;

      const information = await prisma.information.findMany({
        where: {
          type: type.toUpperCase() as any,
          isActive: true,
        },
        orderBy: [{ order: 'asc' }, { publishDate: 'desc' }],
      });

      res.json({
        success: true,
        data: information,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtener información por categoría
  getInformationByCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { category } = req.params;

      const information = await prisma.information.findMany({
        where: {
          category: category,
          isActive: true,
        },
        orderBy: [{ order: 'asc' }, { publishDate: 'desc' }],
      });

      res.json({
        success: true,
        data: information,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtener información por ID
  getInformationById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const information = await prisma.information.findUnique({
        where: { id },
      });

      if (!information) {
        return res.status(404).json({
          success: false,
          error: { message: 'Información no encontrada' },
        });
      }

      res.json({
        success: true,
        data: information,
      });
    } catch (error) {
      next(error);
    }
  };

  // Crear nueva información
  createInformation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        title,
        description,
        type,
        url,
        thumbnail,
        author,
        publishDate,
        tags,
        category,
        order,
      } = req.body;

      const information = await prisma.information.create({
        data: {
          title,
          description,
          type: type.toUpperCase(),
          url,
          thumbnail,
          author,
          publishDate: new Date(publishDate),
          tags: tags || [],
          category,
          order: order || 0,
        },
      });

      res.status(201).json({
        success: true,
        data: information,
      });
    } catch (error) {
      next(error);
    }
  };

  // Actualizar información
  updateInformation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        type,
        url,
        thumbnail,
        author,
        publishDate,
        tags,
        category,
        order,
        isActive,
      } = req.body;

      const information = await prisma.information.update({
        where: { id },
        data: {
          title,
          description,
          type: type?.toUpperCase(),
          url,
          thumbnail,
          author,
          publishDate: publishDate ? new Date(publishDate) : undefined,
          tags: tags || undefined,
          category,
          order: order || undefined,
          isActive,
        },
      });

      res.json({
        success: true,
        data: information,
      });
    } catch (error) {
      next(error);
    }
  };

  // Eliminar información
  deleteInformation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      await prisma.information.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Información eliminada correctamente',
      });
    } catch (error) {
      next(error);
    }
  };

  // Cambiar estado activo/inactivo
  toggleInformationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      const currentInfo = await prisma.information.findUnique({
        where: { id },
      });

      if (!currentInfo) {
        return res.status(404).json({
          success: false,
          error: { message: 'Información no encontrada' },
        });
      }

      const information = await prisma.information.update({
        where: { id },
        data: { isActive: !currentInfo.isActive },
      });

      res.json({
        success: true,
        data: information,
      });
    } catch (error) {
      next(error);
    }
  };
}
