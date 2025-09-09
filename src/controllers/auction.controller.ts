import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ActivityLogService } from '../services/activityLog.service';
import { cleanupFiles } from '../middleware/upload.middleware';
import path from 'path';
import fs from 'fs/promises';

export class AuctionController {
  private activityLog = new ActivityLogService();

  getAllAuctions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, featured, page = 1, limit = 20 } = req.query;

      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (featured === 'true') {
        where.isFeatured = true;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [auctions, total] = await Promise.all([
        prisma.auction.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            images: {
              orderBy: { order: 'asc' },
            },
            _count: {
              select: { bids: true },
            },
          },
          orderBy: [
            { isFeatured: 'desc' },
            { order: 'asc' },
            { createdAt: 'desc' },
          ],
        }),
        prisma.auction.count({ where }),
      ]);

      res.json({
        success: true,
        data: auctions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getFeaturedAuctions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const auctions = await prisma.auction.findMany({
        where: {
          isFeatured: true,
          status: 'PUBLISHED',
        },
        take: 3,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: { order: 'asc' },
      });

      res.json({
        success: true,
        data: auctions,
      });
    } catch (error) {
      next(error);
    }
  };

  getAuctionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const auction = await prisma.auction.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          bids: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: { bids: true },
          },
        },
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Subasta no encontrada' },
        });
      }

      res.json({
        success: true,
        data: auction,
      });
    } catch (error) {
      next(error);
    }
  };

  createAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        description,
        type,
        location,
        startingPrice,
        endDate,
        status,
        metadata,
        youtubeUrl,
        mainImageUrl,
        secondaryImage1,
        secondaryImage2,
        secondaryImage3,
        secondaryImage4,
        secondaryImage5,
        pdfUrl,
        auctionLink,
      } = req.body;

      // Procesar archivos subidos
      const files = req.files as Express.Multer.File[];
      let processedMainImage = mainImageUrl;
      let processedSecondaryImages = {
        secondaryImage1,
        secondaryImage2,
        secondaryImage3,
        secondaryImage4,
        secondaryImage5,
      };
      let processedPdfUrl = pdfUrl;

      if (files && files.length > 0) {
        const baseUrl = process.env.BASE_URL || 'https://espina-rawson-backend-production.up.railway.app';
        
        // Procesar imágenes
        const imageFiles = files.filter(file => file.mimetype.startsWith('image/'));
        if (imageFiles.length > 0) {
          processedMainImage = `${baseUrl}/uploads/${imageFiles[0].filename}`;
          
          // Asignar imágenes secundarias
          imageFiles.slice(1, 6).forEach((file, index) => {
            const fieldName = `secondaryImage${index + 1}`;
            processedSecondaryImages[fieldName] = `${baseUrl}/uploads/${file.filename}`;
          });
        }

        // Procesar PDF
        const pdfFile = files.find(file => file.mimetype === 'application/pdf');
        if (pdfFile) {
          processedPdfUrl = `${baseUrl}/uploads/${pdfFile.filename}`;
        }
      }

      const auction = await prisma.auction.create({
        data: {
          title,
          description,
          type: type || 'general',
          location,
          startingPrice,
          currentPrice: startingPrice,
          endDate: new Date(endDate),
          status: status || 'DRAFT',
          metadata,
          youtubeUrl,
          mainImageUrl: processedMainImage,
          secondaryImage1: processedSecondaryImages.secondaryImage1,
          secondaryImage2: processedSecondaryImages.secondaryImage2,
          secondaryImage3: processedSecondaryImages.secondaryImage3,
          secondaryImage4: processedSecondaryImages.secondaryImage4,
          secondaryImage5: processedSecondaryImages.secondaryImage5,
          pdfUrl: processedPdfUrl,
          auctionLink,
        },
      });

      // Registrar actividad
      await this.activityLog.log({
        userId: req.user?.id,
        action: 'CREATE',
        entity: 'auction',
        entityId: auction.id,
        details: { title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json({
        success: true,
        data: auction,
      });
    } catch (error) {
      next(error);
    }
  };

  updateAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        type,
        location,
        startingPrice,
        endDate,
        status,
        metadata,
        youtubeUrl,
        mainImageUrl,
        secondaryImage1,
        secondaryImage2,
        secondaryImage3,
        secondaryImage4,
        secondaryImage5,
        pdfUrl,
        auctionLink,
      } = req.body;

      // Procesar archivos subidos
      const files = req.files as Express.Multer.File[];
      let processedMainImage = mainImageUrl;
      let processedSecondaryImages = {
        secondaryImage1,
        secondaryImage2,
        secondaryImage3,
        secondaryImage4,
        secondaryImage5,
      };
      let processedPdfUrl = pdfUrl;

      if (files && files.length > 0) {
        const baseUrl = process.env.BASE_URL || 'https://espina-rawson-backend-production.up.railway.app';
        
        // Procesar imágenes
        const imageFiles = files.filter(file => file.mimetype.startsWith('image/'));
        if (imageFiles.length > 0) {
          processedMainImage = `${baseUrl}/uploads/${imageFiles[0].filename}`;
          
          // Asignar imágenes secundarias
          imageFiles.slice(1, 6).forEach((file, index) => {
            const fieldName = `secondaryImage${index + 1}`;
            processedSecondaryImages[fieldName] = `${baseUrl}/uploads/${file.filename}`;
          });
        }

        // Procesar PDF
        const pdfFile = files.find(file => file.mimetype === 'application/pdf');
        if (pdfFile) {
          processedPdfUrl = `${baseUrl}/uploads/${pdfFile.filename}`;
        }
      }

      const auction = await prisma.auction.update({
        where: { id },
        data: {
          title,
          description,
          type,
          location,
          startingPrice,
          endDate: new Date(endDate),
          status,
          metadata,
          youtubeUrl,
          mainImageUrl: processedMainImage,
          secondaryImage1: processedSecondaryImages.secondaryImage1,
          secondaryImage2: processedSecondaryImages.secondaryImage2,
          secondaryImage3: processedSecondaryImages.secondaryImage3,
          secondaryImage4: processedSecondaryImages.secondaryImage4,
          secondaryImage5: processedSecondaryImages.secondaryImage5,
          pdfUrl: processedPdfUrl,
          auctionLink,
        },
        include: {
          images: true,
        },
      });

      // Registrar actividad
      await this.activityLog.log({
        userId: req.user?.id,
        action: 'UPDATE',
        entity: 'auction',
        entityId: auction.id,
        details: { title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        data: auction,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Obtener subasta con imágenes
      const auction = await prisma.auction.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Subasta no encontrada' },
        });
      }

      // Eliminar archivos físicos
      for (const image of auction.images) {
        const filePath = path.join(__dirname, '../../uploads', image.filename);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error(`Error al eliminar archivo ${filePath}:`, error);
        }
      }

      // Eliminar de la base de datos
      await prisma.auction.delete({
        where: { id },
      });

      // Registrar actividad
      await this.activityLog.log({
        userId: req.user?.id,
        action: 'DELETE',
        entity: 'auction',
        entityId: id,
        details: { title: auction.title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        message: 'Subasta eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  uploadImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'No se proporcionaron imágenes' },
        });
      }

      // Verificar que la subasta existe
      const auction = await prisma.auction.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!auction) {
        // Limpiar archivos subidos
        cleanupFiles(files);
        return res.status(404).json({
          success: false,
          error: { message: 'Subasta no encontrada' },
        });
      }

      // Crear registros de imágenes
      const imagePromises = files.map((file, index) => {
        const isPrimary = auction.images.length === 0 && index === 0;
        const order = auction.images.length + index;

        return prisma.auctionImage.create({
          data: {
            auctionId: id,
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            isPrimary,
            order,
          },
        });
      });

      const images = await Promise.all(imagePromises);

      // Registrar actividad
      await this.activityLog.log({
        userId: req.user?.id,
        action: 'UPLOAD_IMAGES',
        entity: 'auction',
        entityId: id,
        details: { count: images.length },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        data: images,
        message: `${images.length} imágenes subidas exitosamente`,
      });
    } catch (error) {
      // Limpiar archivos en caso de error
      if (req.files) {
        cleanupFiles(req.files as Express.Multer.File[]);
      }
      next(error);
    }
  };

  deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auctionId, imageId } = req.params;

      const image = await prisma.auctionImage.findFirst({
        where: {
          id: imageId,
          auctionId,
        },
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          error: { message: 'Imagen no encontrada' },
        });
      }

      // Eliminar archivo físico
      const filePath = path.join(__dirname, '../../uploads', image.filename);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error(`Error al eliminar archivo ${filePath}:`, error);
      }

      // Eliminar de la base de datos
      await prisma.auctionImage.delete({
        where: { id: imageId },
      });

      // Si era la imagen principal, asignar otra
      if (image.isPrimary) {
        const nextImage = await prisma.auctionImage.findFirst({
          where: { auctionId },
          orderBy: { order: 'asc' },
        });

        if (nextImage) {
          await prisma.auctionImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true },
          });
        }
      }

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente',
      });
    } catch (error) {
      next(error);
    }
  };

  setPrimaryImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auctionId, imageId } = req.params;

      // Desmarcar todas las imágenes como principales
      await prisma.auctionImage.updateMany({
        where: { auctionId },
        data: { isPrimary: false },
      });

      // Marcar la nueva imagen principal
      const image = await prisma.auctionImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });

      res.json({
        success: true,
        data: image,
      });
    } catch (error) {
      next(error);
    }
  };

  updateFeaturedAuctions = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { auctionIds } = req.body;

      if (auctionIds.length > 3) {
        return res.status(400).json({
          success: false,
          error: { message: 'Solo se pueden destacar hasta 3 subastas' },
        });
      }

      // Desmarcar todas las subastas destacadas
      await prisma.auction.updateMany({
        data: {
          isFeatured: false,
          order: 0,
        },
      });

      // Marcar las nuevas subastas destacadas
      const updatePromises = auctionIds.map((id: string, index: number) => {
        return prisma.auction.update({
          where: { id },
          data: {
            isFeatured: true,
            order: index,
          },
        });
      });

      await Promise.all(updatePromises);

      // Registrar actividad
      await this.activityLog.log({
        userId: req.user?.id,
        action: 'UPDATE_FEATURED',
        entity: 'auction',
        details: { auctionIds },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        message: 'Subastas destacadas actualizadas',
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const auction = await prisma.auction.update({
        where: { id },
        data: { status },
      });

      // Registrar actividad
      await this.activityLog.log({
        userId: req.user?.id,
        action: 'UPDATE_STATUS',
        entity: 'auction',
        entityId: id,
        details: { status, title: auction.title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json({
        success: true,
        data: auction,
      });
    } catch (error) {
      next(error);
    }
  };
}
