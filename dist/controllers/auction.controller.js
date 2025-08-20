"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionController = void 0;
const index_1 = require("../index");
const activityLog_service_1 = require("../services/activityLog.service");
const upload_middleware_1 = require("../middleware/upload.middleware");
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
class AuctionController {
    activityLog = new activityLog_service_1.ActivityLogService();
    getAllAuctions = async (req, res, next) => {
        try {
            const { status, featured, page = 1, limit = 20 } = req.query;
            const where = {};
            if (status) {
                where.status = status;
            }
            if (featured === 'true') {
                where.isFeatured = true;
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [auctions, total] = await Promise.all([
                index_1.prisma.auction.findMany({
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
                index_1.prisma.auction.count({ where }),
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
        }
        catch (error) {
            next(error);
        }
    };
    getFeaturedAuctions = async (req, res, next) => {
        try {
            const auctions = await index_1.prisma.auction.findMany({
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
        }
        catch (error) {
            next(error);
        }
    };
    getAuctionById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const auction = await index_1.prisma.auction.findUnique({
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
        }
        catch (error) {
            next(error);
        }
    };
    createAuction = async (req, res, next) => {
        try {
            const { title, description, location, startingPrice, endDate, status, metadata, } = req.body;
            const auction = await index_1.prisma.auction.create({
                data: {
                    title,
                    description,
                    location,
                    startingPrice,
                    currentPrice: startingPrice,
                    endDate: new Date(endDate),
                    status: status || 'DRAFT',
                    metadata,
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
        }
        catch (error) {
            next(error);
        }
    };
    updateAuction = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, description, location, startingPrice, endDate, status, metadata, } = req.body;
            const auction = await index_1.prisma.auction.update({
                where: { id },
                data: {
                    title,
                    description,
                    location,
                    startingPrice,
                    endDate: new Date(endDate),
                    status,
                    metadata,
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
        }
        catch (error) {
            next(error);
        }
    };
    deleteAuction = async (req, res, next) => {
        try {
            const { id } = req.params;
            // Obtener subasta con imágenes
            const auction = await index_1.prisma.auction.findUnique({
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
                const filePath = path_1.default.join(__dirname, '../../uploads', image.filename);
                try {
                    await promises_1.default.unlink(filePath);
                }
                catch (error) {
                    console.error(`Error al eliminar archivo ${filePath}:`, error);
                }
            }
            // Eliminar de la base de datos
            await index_1.prisma.auction.delete({
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
        }
        catch (error) {
            next(error);
        }
    };
    uploadImages = async (req, res, next) => {
        try {
            const { id } = req.params;
            const files = req.files;
            if (!files || files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'No se proporcionaron imágenes' },
                });
            }
            // Verificar que la subasta existe
            const auction = await index_1.prisma.auction.findUnique({
                where: { id },
                include: { images: true },
            });
            if (!auction) {
                // Limpiar archivos subidos
                (0, upload_middleware_1.cleanupFiles)(files);
                return res.status(404).json({
                    success: false,
                    error: { message: 'Subasta no encontrada' },
                });
            }
            // Crear registros de imágenes
            const imagePromises = files.map((file, index) => {
                const isPrimary = auction.images.length === 0 && index === 0;
                const order = auction.images.length + index;
                return index_1.prisma.auctionImage.create({
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
        }
        catch (error) {
            // Limpiar archivos en caso de error
            if (req.files) {
                (0, upload_middleware_1.cleanupFiles)(req.files);
            }
            next(error);
        }
    };
    deleteImage = async (req, res, next) => {
        try {
            const { auctionId, imageId } = req.params;
            const image = await index_1.prisma.auctionImage.findFirst({
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
            const filePath = path_1.default.join(__dirname, '../../uploads', image.filename);
            try {
                await promises_1.default.unlink(filePath);
            }
            catch (error) {
                console.error(`Error al eliminar archivo ${filePath}:`, error);
            }
            // Eliminar de la base de datos
            await index_1.prisma.auctionImage.delete({
                where: { id: imageId },
            });
            // Si era la imagen principal, asignar otra
            if (image.isPrimary) {
                const nextImage = await index_1.prisma.auctionImage.findFirst({
                    where: { auctionId },
                    orderBy: { order: 'asc' },
                });
                if (nextImage) {
                    await index_1.prisma.auctionImage.update({
                        where: { id: nextImage.id },
                        data: { isPrimary: true },
                    });
                }
            }
            res.json({
                success: true,
                message: 'Imagen eliminada exitosamente',
            });
        }
        catch (error) {
            next(error);
        }
    };
    setPrimaryImage = async (req, res, next) => {
        try {
            const { auctionId, imageId } = req.params;
            // Desmarcar todas las imágenes como principales
            await index_1.prisma.auctionImage.updateMany({
                where: { auctionId },
                data: { isPrimary: false },
            });
            // Marcar la nueva imagen principal
            const image = await index_1.prisma.auctionImage.update({
                where: { id: imageId },
                data: { isPrimary: true },
            });
            res.json({
                success: true,
                data: image,
            });
        }
        catch (error) {
            next(error);
        }
    };
    updateFeaturedAuctions = async (req, res, next) => {
        try {
            const { auctionIds } = req.body;
            if (auctionIds.length > 3) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Solo se pueden destacar hasta 3 subastas' },
                });
            }
            // Desmarcar todas las subastas destacadas
            await index_1.prisma.auction.updateMany({
                data: {
                    isFeatured: false,
                    order: 0,
                },
            });
            // Marcar las nuevas subastas destacadas
            const updatePromises = auctionIds.map((id, index) => {
                return index_1.prisma.auction.update({
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
        }
        catch (error) {
            next(error);
        }
    };
    updateStatus = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const auction = await index_1.prisma.auction.update({
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
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AuctionController = AuctionController;
//# sourceMappingURL=auction.controller.js.map