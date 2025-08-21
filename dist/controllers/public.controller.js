"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicController = void 0;
const index_1 = require("../index");
class PublicController {
    getAllContent = async (req, res, next) => {
        try {
            const contents = await index_1.prisma.pageContent.findMany({
                select: {
                    id: true,
                    key: true,
                    value: true,
                    section: true,
                },
                orderBy: [{ section: 'asc' }, { key: 'asc' }],
            });
            // Agrupar por sección para facilitar el uso en el frontend
            const groupedContent = contents.reduce((acc, content) => {
                if (!acc[content.section]) {
                    acc[content.section] = {};
                }
                acc[content.section][content.key] = content.value;
                return acc;
            }, {});
            res.json({
                success: true,
                data: groupedContent,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getContentBySection = async (req, res, next) => {
        try {
            const { section } = req.params;
            const contents = await index_1.prisma.pageContent.findMany({
                where: { section },
                select: {
                    key: true,
                    value: true,
                },
            });
            // Convertir a objeto key-value
            const contentMap = contents.reduce((acc, content) => {
                acc[content.key] = content.value;
                return acc;
            }, {});
            res.json({
                success: true,
                data: contentMap,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getActiveAuctions = async (req, res, next) => {
        try {
            const { page = 1, limit = 12 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {
                status: 'PUBLISHED',
                endDate: {
                    gt: new Date(),
                },
            };
            const [auctions, total] = await Promise.all([
                index_1.prisma.auction.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        location: true,
                        startingPrice: true,
                        currentPrice: true,
                        endDate: true,
                        mainImageUrl: true,
                        secondaryImage1: true,
                        secondaryImage2: true,
                        secondaryImage3: true,
                        secondaryImage4: true,
                        secondaryImage5: true,
                        pdfUrl: true,
                        youtubeUrl: true,
                        type: true,
                        isFeatured: true,
                        images: {
                            where: { isPrimary: true },
                            select: {
                                url: true,
                            },
                            take: 1,
                        },
                        _count: {
                            select: { bids: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
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
                    endDate: {
                        gt: new Date(),
                    },
                },
                take: 3,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    location: true,
                    startingPrice: true,
                    currentPrice: true,
                    endDate: true,
                    images: {
                        where: { isPrimary: true },
                        select: {
                            url: true,
                        },
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
    getAuctionDetail = async (req, res, next) => {
        try {
            const { id } = req.params;
            const auction = await index_1.prisma.auction.findFirst({
                where: {
                    id,
                    status: 'PUBLISHED',
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    location: true,
                    startingPrice: true,
                    currentPrice: true,
                    endDate: true,
                    mainImageUrl: true,
                    secondaryImage1: true,
                    secondaryImage2: true,
                    secondaryImage3: true,
                    secondaryImage4: true,
                    secondaryImage5: true,
                    pdfUrl: true,
                    youtubeUrl: true,
                    type: true,
                    isFeatured: true,
                    metadata: true,
                    images: {
                        select: {
                            id: true,
                            url: true,
                            isPrimary: true,
                        },
                        orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }],
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
    getPracticeAreas = async (req, res, next) => {
        try {
            const areas = await index_1.prisma.practiceArea.findMany({
                where: { isActive: true },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    icon: true,
                },
                orderBy: { order: 'asc' },
            });
            res.json({
                success: true,
                data: areas,
            });
        }
        catch (error) {
            next(error);
        }
    };
    getPublicSettings = async (req, res, next) => {
        try {
            // Obtener solo configuraciones públicas
            const publicKeys = [
                'contact_email',
                'contact_phone',
                'contact_address',
                'social_links',
            ];
            const settings = await index_1.prisma.settings.findMany({
                where: {
                    key: { in: publicKeys },
                },
                select: {
                    key: true,
                    value: true,
                },
            });
            // Convertir a objeto
            const settingsMap = settings.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});
            res.json({
                success: true,
                data: settingsMap,
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.PublicController = PublicController;
//# sourceMappingURL=public.controller.js.map