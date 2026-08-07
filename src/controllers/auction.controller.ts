import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ActivityLogService } from '../services/activityLog.service';
import { cleanupFiles } from '../middleware/upload.middleware';
import { imgbbService } from '../services/imgbb.service';
import { cloudinaryService } from '../services/cloudinary.service';
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
        currency,
        startingPrice,
        startDate,
        endDate,
        closingTime,
        termsAndConditions,
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
        details,
      } = req.body;

      // Procesar archivos: mainImage, secondaryImages y pdfFile van por campos separados
      const files = (req.files as Express.Multer.File[]) || [];
      console.log('🔍 DEBUG - Files received:', files.map(f => ({ name: f.originalname, field: f.fieldname, type: f.mimetype })));

      let processedMainImage = mainImageUrl;
      let processedSecondaryImages: Record<string, string | undefined> = {
        secondaryImage1,
        secondaryImage2,
        secondaryImage3,
        secondaryImage4,
        secondaryImage5,
      };
      let processedPdfUrl = pdfUrl;
      let hasNewSecondaryImages = false;

      if (files.length > 0) {
        try {
          // Imagen principal: solo si se envió el campo mainImage (o legacy 'files' como fallback)
          const mainFile =
            files.find((f) => f.fieldname === 'mainImage' && f.mimetype.startsWith('image/')) ||
            // Compatibilidad: si vienen todas como 'files', la primera imagen es la principal
            (files.some((f) => f.fieldname === 'files')
              ? files.find((f) => f.fieldname === 'files' && f.mimetype.startsWith('image/'))
              : undefined);

          if (mainFile && mainFile.fieldname === 'mainImage') {
            processedMainImage = await imgbbService.uploadImage(mainFile.buffer, mainFile.originalname);
            console.log('✅ Imagen principal subida:', processedMainImage);
          }

          // Imágenes secundarias: campo secondaryImages (o resto de 'files' si es legacy)
          let secondaryFiles = files.filter(
            (f) => f.fieldname === 'secondaryImages' && f.mimetype.startsWith('image/')
          );

          // Fallback legacy: si todo vino como 'files', secundarias = todas menos la primera
          if (secondaryFiles.length === 0 && files.some((f) => f.fieldname === 'files')) {
            const allLegacyImages = files.filter(
              (f) => f.fieldname === 'files' && f.mimetype.startsWith('image/')
            );
            if (mainFile && mainFile.fieldname === 'files') {
              // Primera = principal, resto = secundarias
              processedMainImage = await imgbbService.uploadImage(mainFile.buffer, mainFile.originalname);
              console.log('✅ Imagen principal (legacy) subida:', processedMainImage);
              secondaryFiles = allLegacyImages.slice(1);
            } else {
              secondaryFiles = allLegacyImages;
            }
          }

          if (secondaryFiles.length > 0) {
            hasNewSecondaryImages = true;
            console.log(`📤 Subiendo ${secondaryFiles.length} imágenes secundarias a ImgBB...`);
            for (let i = 0; i < Math.min(secondaryFiles.length, 5); i++) {
              const imageUrl = await imgbbService.uploadImage(
                secondaryFiles[i].buffer,
                secondaryFiles[i].originalname
              );
              processedSecondaryImages[`secondaryImage${i + 1}`] = imageUrl;
              console.log(`✅ Imagen secundaria ${i + 1} subida:`, imageUrl);
            }
            if (secondaryFiles.length > 5) {
              (req as any)._extraImages = secondaryFiles.slice(5);
            }
          }

          // PDF
          const pdfFile = files.find(
            (f) =>
              f.mimetype === 'application/pdf' &&
              (f.fieldname === 'pdfFile' || f.fieldname === 'files')
          );
          if (pdfFile) {
            try {
              processedPdfUrl = await cloudinaryService.uploadPdf(pdfFile.buffer, pdfFile.originalname);
              console.log('✅ PDF subido a Cloudinary:', processedPdfUrl);
            } catch (cloudinaryError) {
              console.error('❌ Error subiendo PDF a Cloudinary:', cloudinaryError);
            }
          }
        } catch (error) {
          console.error('❌ Error subiendo archivos:', error);
        }
      }

      const auction = await prisma.auction.create({
        data: {
          title,
          description,
          type: type || 'general',
          location,
          currency: currency || 'ARS',
          startingPrice,
          currentPrice: startingPrice,
          startDate: startDate ? new Date(startDate + 'T00:00:00.000Z') : null,
          endDate: new Date(endDate + 'T23:59:59.999Z'),
          closingTime: closingTime || null,
          termsAndConditions: termsAndConditions || null,
          status: status || 'DRAFT',
          metadata,
          youtubeUrl,
          mainImageUrl: processedMainImage,
          secondaryImage1: hasNewSecondaryImages ? processedSecondaryImages.secondaryImage1 : secondaryImage1,
          secondaryImage2: hasNewSecondaryImages ? processedSecondaryImages.secondaryImage2 : secondaryImage2,
          secondaryImage3: hasNewSecondaryImages ? processedSecondaryImages.secondaryImage3 : secondaryImage3,
          secondaryImage4: hasNewSecondaryImages ? processedSecondaryImages.secondaryImage4 : secondaryImage4,
          secondaryImage5: hasNewSecondaryImages ? processedSecondaryImages.secondaryImage5 : secondaryImage5,
          pdfUrl: processedPdfUrl,
          auctionLink,
          details: details || null,
        },
      });

      // Guardar imágenes extra (6-20) en AuctionImage
      const extraImages = (req as any)._extraImages as Express.Multer.File[] | undefined;
      if (extraImages && extraImages.length > 0) {
        for (let i = 0; i < extraImages.length; i++) {
          try {
            const imageUrl = await imgbbService.uploadImage(extraImages[i].buffer, extraImages[i].originalname);
            await prisma.auctionImage.create({
              data: {
                auctionId: auction.id,
                url: imageUrl,
                filename: extraImages[i].originalname,
                isPrimary: false,
                order: 5 + i,
              },
            });
            console.log(`✅ Imagen extra ${i + 6} guardada en AuctionImage`);
          } catch (err) {
            console.error(`❌ Error subiendo imagen extra ${i + 6}:`, err);
          }
        }
      }

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
        currency,
        startingPrice,
        startDate,
        endDate,
        closingTime,
        termsAndConditions,
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
        details,
      } = req.body;

      // Procesar archivos: mainImage, secondaryImages y pdfFile van por campos separados
      const files = (req.files as Express.Multer.File[]) || [];
      console.log('🔍 DEBUG - Files received (update):', files.map(f => ({ name: f.originalname, field: f.fieldname, type: f.mimetype })));

      let processedMainImage: string | undefined = undefined;
      let processedSecondaryImages: Record<string, string | undefined> = {};
      let processedPdfUrl: string | undefined = undefined;
      let hasNewMainImage = false;
      let hasNewSecondaryImages = false;
      let hasNewPdf = false;

      if (files.length > 0) {
        try {
          // Imagen principal: SOLO si se envió el campo mainImage
          const mainFile = files.find(
            (f) => f.fieldname === 'mainImage' && f.mimetype.startsWith('image/')
          );
          if (mainFile) {
            processedMainImage = await imgbbService.uploadImage(mainFile.buffer, mainFile.originalname);
            hasNewMainImage = true;
            console.log('✅ Imagen principal actualizada:', processedMainImage);
          }

          // Imágenes secundarias: SOLO si se envió el campo secondaryImages
          let secondaryFiles = files.filter(
            (f) => f.fieldname === 'secondaryImages' && f.mimetype.startsWith('image/')
          );

          // Fallback legacy: si todo vino como 'files' sin mainImage separado
          if (
            !mainFile &&
            secondaryFiles.length === 0 &&
            files.some((f) => f.fieldname === 'files')
          ) {
            // En legacy, si hay mainImageUrl en body no tocamos principal; todas van a secundarias
            // Si no hay mainImageUrl, primera = principal (solo en create; en update preferimos no pisar)
            secondaryFiles = files.filter(
              (f) => f.fieldname === 'files' && f.mimetype.startsWith('image/')
            );
          }

          if (secondaryFiles.length > 0) {
            hasNewSecondaryImages = true;
            console.log(`📤 Subiendo ${secondaryFiles.length} imágenes secundarias a ImgBB...`);
            for (let i = 0; i < Math.min(secondaryFiles.length, 5); i++) {
              const imageUrl = await imgbbService.uploadImage(
                secondaryFiles[i].buffer,
                secondaryFiles[i].originalname
              );
              processedSecondaryImages[`secondaryImage${i + 1}`] = imageUrl;
              console.log(`✅ Imagen secundaria ${i + 1} subida:`, imageUrl);
            }
            if (secondaryFiles.length > 5) {
              (req as any)._extraImages = secondaryFiles.slice(5);
            }
          }

          // PDF
          const pdfFile = files.find(
            (f) =>
              f.mimetype === 'application/pdf' &&
              (f.fieldname === 'pdfFile' || f.fieldname === 'files')
          );
          if (pdfFile) {
            try {
              processedPdfUrl = await cloudinaryService.uploadPdf(pdfFile.buffer, pdfFile.originalname);
              hasNewPdf = true;
              console.log('✅ PDF actualizado en Cloudinary:', processedPdfUrl);
            } catch (cloudinaryError) {
              console.error('❌ Error subiendo PDF a Cloudinary:', cloudinaryError);
            }
          }
        } catch (error) {
          console.error('❌ Error subiendo archivos:', error);
        }
      }

      // Solo actualizar campos de imagen si realmente se subieron archivos nuevos
      const updateData: any = {
        title,
        description,
        type,
        location,
        currency: currency || 'ARS',
        startingPrice,
        startDate: startDate ? new Date(startDate + 'T00:00:00.000Z') : null,
        endDate: new Date(endDate + 'T23:59:59.999Z'),
        closingTime: closingTime || null,
        termsAndConditions: termsAndConditions || null,
        status,
        metadata,
        youtubeUrl,
        auctionLink,
        details: details || null,
      };

      if (hasNewMainImage) {
        updateData.mainImageUrl = processedMainImage;
      }
      if (hasNewSecondaryImages) {
        updateData.secondaryImage1 = processedSecondaryImages.secondaryImage1 || null;
        updateData.secondaryImage2 = processedSecondaryImages.secondaryImage2 || null;
        updateData.secondaryImage3 = processedSecondaryImages.secondaryImage3 || null;
        updateData.secondaryImage4 = processedSecondaryImages.secondaryImage4 || null;
        updateData.secondaryImage5 = processedSecondaryImages.secondaryImage5 || null;
      }
      if (hasNewPdf) {
        updateData.pdfUrl = processedPdfUrl;
      }

      const auction = await prisma.auction.update({
        where: { id },
        data: updateData,
        include: {
          images: true,
        },
      });

      // Guardar imágenes extra (6-20) en AuctionImage
      const extraImagesUpdate = (req as any)._extraImages as Express.Multer.File[] | undefined;
      if (extraImagesUpdate && extraImagesUpdate.length > 0) {
        const existingCount = await prisma.auctionImage.count({ where: { auctionId: id } });
        for (let i = 0; i < extraImagesUpdate.length; i++) {
          try {
            const imageUrl = await imgbbService.uploadImage(extraImagesUpdate[i].buffer, extraImagesUpdate[i].originalname);
            await prisma.auctionImage.create({
              data: {
                auctionId: id,
                url: imageUrl,
                filename: extraImagesUpdate[i].originalname,
                isPrimary: false,
                order: existingCount + i,
              },
            });
            console.log(`✅ Imagen extra ${i + 6} actualizada en AuctionImage`);
          } catch (err) {
            console.error(`❌ Error subiendo imagen extra ${i + 6}:`, err);
          }
        }
      }

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

  // Servir PDF - redirige a Cloudinary si está disponible, sino intenta desde BD (compatibilidad)
  getPdf = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      console.log(`📄 GET PDF - Buscando PDF para subasta: ${id}`);

      const auction = await prisma.auction.findUnique({
        where: { id },
        select: {
          pdfData: true,
          pdfFilename: true,
          pdfUrl: true,
        },
      });

      if (!auction) {
        console.log(`❌ Subasta no encontrada: ${id}`);
        return res.status(404).json({
          success: false,
          error: { message: 'Subasta no encontrada' },
        });
      }

      // Prioridad 1: Si hay URL de Cloudinary, redirigir
      if (auction.pdfUrl && auction.pdfUrl.includes('cloudinary.com')) {
        console.log(`✅ Redirigiendo a Cloudinary: ${auction.pdfUrl}`);
        return res.redirect(auction.pdfUrl);
      }

      // Prioridad 2: Si hay PDF en BD (compatibilidad con datos antiguos)
      if (auction.pdfData) {
        console.log(`📄 Sirviendo PDF desde BD (compatibilidad)`);
        const pdfBuffer = Buffer.isBuffer(auction.pdfData) 
          ? auction.pdfData 
          : Buffer.from(auction.pdfData as any);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${auction.pdfFilename || 'documento.pdf'}"`);
        res.setHeader('Content-Length', pdfBuffer.length.toString());
        
        return res.send(pdfBuffer);
      }

      // No hay PDF disponible
      console.log(`❌ PDF no disponible para subasta ${id}`);
      return res.status(404).json({
        success: false,
        error: { message: 'PDF no encontrado' },
      });
    } catch (error) {
      console.error('❌ Error sirviendo PDF:', error);
      next(error);
    }
  };
}
