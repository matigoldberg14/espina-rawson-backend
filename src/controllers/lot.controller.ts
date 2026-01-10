import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ActivityLogService } from '../services/activityLog.service';
import { imgbbService } from '../services/imgbb.service';

export class LotController {
  private activityLog = new ActivityLogService();

  // Obtener todos los lotes de una subasta
  getLotsByAuction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { auctionId } = req.params;

      const lots = await prisma.lot.findMany({
        where: { auctionId },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          videos: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: [{ lotNumber: 'asc' }, { order: 'asc' }],
      });

      res.json({
        success: true,
        data: lots,
      });
    } catch (error) {
      next(error);
    }
  };

  // Obtener un lote específico
  getLotById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const lot = await prisma.lot.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          videos: {
            orderBy: { order: 'asc' },
          },
          auction: {
            select: {
              id: true,
              title: true,
              endDate: true,
              status: true,
            },
          },
        },
      });

      if (!lot) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lote no encontrado' },
        });
      }

      res.json({
        success: true,
        data: lot,
      });
    } catch (error) {
      next(error);
    }
  };

  // Crear un nuevo lote
  createLot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        auctionId,
        lotNumber,
        title,
        description,
        currency,
        startingPrice,
        currentPrice,
        details,
        videos, // Array de URLs de YouTube
      } = req.body;

      // Verificar que la subasta existe
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
      });

      if (!auction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Subasta no encontrada' },
        });
      }

      // Verificar que el número de lote no esté duplicado
      const existingLot = await prisma.lot.findFirst({
        where: { auctionId, lotNumber: parseInt(lotNumber) },
      });

      if (existingLot) {
        return res.status(400).json({
          success: false,
          error: { message: `El lote número ${lotNumber} ya existe en esta subasta` },
        });
      }

      // Procesar imágenes subidas
      const files = req.files as Express.Multer.File[];
      const imageUrls: { url: string; filename: string; order: number }[] = [];

      if (files && files.length > 0) {
        console.log(`📤 Subiendo ${files.length} imágenes del lote a ImgBB...`);
        
        for (let i = 0; i < Math.min(files.length, 15); i++) {
          const file = files[i];
          if (file.mimetype.startsWith('image/')) {
            const imageUrl = await imgbbService.uploadImage(
              file.buffer,
              file.originalname
            );
            imageUrls.push({
              url: imageUrl,
              filename: file.originalname,
              order: i,
            });
            console.log(`✅ Imagen ${i + 1} del lote subida:`, imageUrl);
          }
        }
      }

      // Crear el lote con imágenes y videos
      const lot = await prisma.lot.create({
        data: {
          auctionId,
          lotNumber: parseInt(lotNumber),
          title,
          description: description || null,
          currency: currency || 'ARS',
          startingPrice: parseFloat(startingPrice),
          currentPrice: currentPrice ? parseFloat(currentPrice) : null,
          details: details ? (typeof details === 'string' ? JSON.parse(details) : details) : null,
          images: {
            create: imageUrls.map((img, index) => ({
              url: img.url,
              filename: img.filename,
              isPrimary: index === 0,
              order: img.order,
            })),
          },
          videos: videos && videos.length > 0
            ? {
                create: (Array.isArray(videos) ? videos : [videos])
                  .filter((v: string) => v && v.trim())
                  .map((url: string, index: number) => ({
                    url: url.trim(),
                    order: index,
                  })),
              }
            : undefined,
        },
        include: {
          images: true,
          videos: true,
        },
      });

      await this.activityLog.log({
        userId: (req as any).user?.id,
        action: 'CREATE',
        entity: 'lot',
        entityId: lot.id,
        details: { title: lot.title, lotNumber: lot.lotNumber, auctionId },
      });

      res.status(201).json({
        success: true,
        data: lot,
      });
    } catch (error) {
      console.error('Error creating lot:', error);
      next(error);
    }
  };

  // Actualizar un lote
  updateLot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {
        lotNumber,
        title,
        description,
        currency,
        startingPrice,
        currentPrice,
        details,
        videos,
        existingImages, // Array de IDs de imágenes existentes a mantener
      } = req.body;

      const existingLot = await prisma.lot.findUnique({
        where: { id },
        include: { images: true, videos: true },
      });

      if (!existingLot) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lote no encontrado' },
        });
      }

      // Verificar número de lote duplicado (si cambió)
      if (lotNumber && parseInt(lotNumber) !== existingLot.lotNumber) {
        const duplicateLot = await prisma.lot.findFirst({
          where: {
            auctionId: existingLot.auctionId,
            lotNumber: parseInt(lotNumber),
            NOT: { id },
          },
        });

        if (duplicateLot) {
          return res.status(400).json({
            success: false,
            error: { message: `El lote número ${lotNumber} ya existe en esta subasta` },
          });
        }
      }

      // Procesar nuevas imágenes
      const files = req.files as Express.Multer.File[];
      const newImageUrls: { url: string; filename: string; order: number }[] = [];

      if (files && files.length > 0) {
        console.log(`📤 Subiendo ${files.length} nuevas imágenes del lote a ImgBB...`);
        
        const existingCount = existingImages ? JSON.parse(existingImages).length : existingLot.images.length;
        
        for (let i = 0; i < Math.min(files.length, 15 - existingCount); i++) {
          const file = files[i];
          if (file.mimetype.startsWith('image/')) {
            const imageUrl = await imgbbService.uploadImage(
              file.buffer,
              file.originalname
            );
            newImageUrls.push({
              url: imageUrl,
              filename: file.originalname,
              order: existingCount + i,
            });
            console.log(`✅ Nueva imagen ${i + 1} del lote subida:`, imageUrl);
          }
        }
      }

      // Determinar qué imágenes eliminar
      const imagesToKeep = existingImages ? JSON.parse(existingImages) : existingLot.images.map(img => img.id);
      const imagesToDelete = existingLot.images
        .filter(img => !imagesToKeep.includes(img.id))
        .map(img => img.id);

      // Actualizar el lote
      const lot = await prisma.lot.update({
        where: { id },
        data: {
          lotNumber: lotNumber ? parseInt(lotNumber) : undefined,
          title: title || undefined,
          description: description !== undefined ? description : undefined,
          currency: currency || undefined,
          startingPrice: startingPrice ? parseFloat(startingPrice) : undefined,
          currentPrice: currentPrice !== undefined ? (currentPrice ? parseFloat(currentPrice) : null) : undefined,
          details: details !== undefined 
            ? (details ? (typeof details === 'string' ? JSON.parse(details) : details) : null)
            : undefined,
          images: {
            deleteMany: imagesToDelete.length > 0 ? { id: { in: imagesToDelete } } : undefined,
            create: newImageUrls.map((img, index) => ({
              url: img.url,
              filename: img.filename,
              isPrimary: existingLot.images.length === 0 && index === 0,
              order: img.order,
            })),
          },
          videos: videos !== undefined
            ? {
                deleteMany: {},
                create: (Array.isArray(videos) ? videos : [videos])
                  .filter((v: string) => v && v.trim())
                  .map((url: string, index: number) => ({
                    url: url.trim(),
                    order: index,
                  })),
              }
            : undefined,
        },
        include: {
          images: {
            orderBy: { order: 'asc' },
          },
          videos: {
            orderBy: { order: 'asc' },
          },
        },
      });

      await this.activityLog.log({
        userId: (req as any).user?.id,
        action: 'UPDATE',
        entity: 'lot',
        entityId: lot.id,
        details: { title: lot.title, lotNumber: lot.lotNumber },
      });

      res.json({
        success: true,
        data: lot,
      });
    } catch (error) {
      console.error('Error updating lot:', error);
      next(error);
    }
  };

  // Eliminar un lote
  deleteLot = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const lot = await prisma.lot.findUnique({
        where: { id },
      });

      if (!lot) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lote no encontrado' },
        });
      }

      await prisma.lot.delete({
        where: { id },
      });

      await this.activityLog.log({
        userId: (req as any).user?.id,
        action: 'DELETE',
        entity: 'lot',
        entityId: id,
        details: { title: lot.title, lotNumber: lot.lotNumber },
      });

      res.json({
        success: true,
        message: 'Lote eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  };

  // Agregar imágenes a un lote existente
  addImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      const lot = await prisma.lot.findUnique({
        where: { id },
        include: { images: true },
      });

      if (!lot) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lote no encontrado' },
        });
      }

      if (lot.images.length >= 15) {
        return res.status(400).json({
          success: false,
          error: { message: 'El lote ya tiene el máximo de 15 imágenes' },
        });
      }

      const availableSlots = 15 - lot.images.length;
      const imagesToUpload = Math.min(files.length, availableSlots);

      const imageUrls: { url: string; filename: string; order: number }[] = [];

      for (let i = 0; i < imagesToUpload; i++) {
        const file = files[i];
        if (file.mimetype.startsWith('image/')) {
          const imageUrl = await imgbbService.uploadImage(
            file.buffer,
            file.originalname
          );
          imageUrls.push({
            url: imageUrl,
            filename: file.originalname,
            order: lot.images.length + i,
          });
        }
      }

      const createdImages = await prisma.lotImage.createMany({
        data: imageUrls.map((img) => ({
          lotId: id,
          url: img.url,
          filename: img.filename,
          order: img.order,
        })),
      });

      const updatedLot = await prisma.lot.findUnique({
        where: { id },
        include: {
          images: { orderBy: { order: 'asc' } },
          videos: { orderBy: { order: 'asc' } },
        },
      });

      res.json({
        success: true,
        data: updatedLot,
        message: `${imageUrls.length} imágenes agregadas correctamente`,
      });
    } catch (error) {
      next(error);
    }
  };

  // Agregar video a un lote
  addVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { url, title } = req.body;

      const lot = await prisma.lot.findUnique({
        where: { id },
        include: { videos: true },
      });

      if (!lot) {
        return res.status(404).json({
          success: false,
          error: { message: 'Lote no encontrado' },
        });
      }

      const video = await prisma.lotVideo.create({
        data: {
          lotId: id,
          url,
          title,
          order: lot.videos.length,
        },
      });

      res.status(201).json({
        success: true,
        data: video,
      });
    } catch (error) {
      next(error);
    }
  };

  // Eliminar imagen de un lote
  deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, imageId } = req.params;

      const image = await prisma.lotImage.findFirst({
        where: { id: imageId, lotId: id },
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          error: { message: 'Imagen no encontrada' },
        });
      }

      await prisma.lotImage.delete({
        where: { id: imageId },
      });

      res.json({
        success: true,
        message: 'Imagen eliminada correctamente',
      });
    } catch (error) {
      next(error);
    }
  };

  // Eliminar video de un lote
  deleteVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, videoId } = req.params;

      const video = await prisma.lotVideo.findFirst({
        where: { id: videoId, lotId: id },
      });

      if (!video) {
        return res.status(404).json({
          success: false,
          error: { message: 'Video no encontrado' },
        });
      }

      await prisma.lotVideo.delete({
        where: { id: videoId },
      });

      res.json({
        success: true,
        message: 'Video eliminado correctamente',
      });
    } catch (error) {
      next(error);
    }
  };
}

export const lotController = new LotController();

