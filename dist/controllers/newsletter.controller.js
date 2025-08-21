"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterController = void 0;
const index_1 = require("../index");
const activityLog_service_1 = require("../services/activityLog.service");
const nodemailer_1 = __importDefault(require("nodemailer"));
class NewsletterController {
    activityLog = new activityLog_service_1.ActivityLogService();
    // Suscribirse al newsletter (público)
    subscribe = async (req, res, next) => {
        try {
            const { email, name } = req.body;
            // Verificar si ya existe
            const existing = await index_1.prisma.newsletterSubscriber.findUnique({
                where: { email },
            });
            if (existing) {
                if (existing.isActive) {
                    return res.status(400).json({
                        success: false,
                        error: { message: 'Este email ya está suscrito' },
                    });
                }
                else {
                    // Reactivar suscripción
                    await index_1.prisma.newsletterSubscriber.update({
                        where: { email },
                        data: {
                            isActive: true,
                            unsubscribedAt: null,
                            name: name || existing.name,
                        },
                    });
                    return res.json({
                        success: true,
                        message: 'Suscripción reactivada exitosamente',
                    });
                }
            }
            // Crear nueva suscripción
            const subscriber = await index_1.prisma.newsletterSubscriber.create({
                data: {
                    email,
                    name,
                },
            });
            res.status(201).json({
                success: true,
                message: 'Suscripción exitosa',
                data: { id: subscriber.id },
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Desuscribirse (público)
    unsubscribe = async (req, res, next) => {
        try {
            const { email } = req.body;
            const subscriber = await index_1.prisma.newsletterSubscriber.findUnique({
                where: { email },
            });
            if (!subscriber) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'Email no encontrado' },
                });
            }
            await index_1.prisma.newsletterSubscriber.update({
                where: { email },
                data: {
                    isActive: false,
                    unsubscribedAt: new Date(),
                },
            });
            res.json({
                success: true,
                message: 'Desuscripción exitosa',
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Obtener todos los suscriptores (admin)
    getSubscribers = async (req, res, next) => {
        try {
            const { active, page = 1, limit = 50 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const where = {};
            if (active !== undefined) {
                where.isActive = active === 'true';
            }
            const [subscribers, total] = await Promise.all([
                index_1.prisma.newsletterSubscriber.findMany({
                    where,
                    skip,
                    take: Number(limit),
                    orderBy: { subscribedAt: 'desc' },
                }),
                index_1.prisma.newsletterSubscriber.count({ where }),
            ]);
            res.json({
                success: true,
                data: subscribers,
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
    // Obtener campañas de email (admin)
    getCampaigns = async (req, res, next) => {
        try {
            const { page = 1, limit = 20 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const [campaigns, total] = await Promise.all([
                index_1.prisma.emailCampaign.findMany({
                    skip,
                    take: Number(limit),
                    orderBy: { createdAt: 'desc' },
                }),
                index_1.prisma.emailCampaign.count(),
            ]);
            res.json({
                success: true,
                data: campaigns,
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
    // Crear y enviar campaña de email (admin)
    sendCampaign = async (req, res, next) => {
        try {
            const { subject, content, testMode = false } = req.body;
            // Obtener suscriptores activos
            const subscribers = await index_1.prisma.newsletterSubscriber.findMany({
                where: { isActive: true },
            });
            if (subscribers.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'No hay suscriptores activos' },
                });
            }
            // Crear campaña
            const campaign = await index_1.prisma.emailCampaign.create({
                data: {
                    subject,
                    content,
                    createdBy: req.user?.id,
                    sentTo: testMode ? 0 : subscribers.length,
                    sentAt: testMode ? null : new Date(),
                },
            });
            // Configurar transporte de email
            // NOTA: En producción, usar un servicio como SendGrid, AWS SES, etc.
            const transporter = nodemailer_1.default.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: Number(process.env.SMTP_PORT) || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            if (testMode) {
                // Modo de prueba: solo enviar al admin
                const testEmail = req.user?.email || process.env.ADMIN_EMAIL;
                if (testEmail) {
                    await transporter.sendMail({
                        from: process.env.SMTP_FROM || 'noreply@espinarawson.com',
                        to: testEmail,
                        subject: `[PRUEBA] ${subject}`,
                        html: content,
                    });
                }
            }
            else {
                // Enviar a todos los suscriptores (en lotes para evitar límites)
                const batchSize = 50;
                for (let i = 0; i < subscribers.length; i += batchSize) {
                    const batch = subscribers.slice(i, i + batchSize);
                    await Promise.all(batch.map((subscriber) => transporter.sendMail({
                        from: process.env.SMTP_FROM || 'noreply@espinarawson.com',
                        to: subscriber.email,
                        subject,
                        html: content +
                            `
                  <hr>
                  <p style="font-size: 12px; color: #666;">
                    Para desuscribirse, haga clic 
                    <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${subscriber.email}">aquí</a>
                  </p>
                `,
                    })));
                    // Esperar entre lotes para evitar límites de rate
                    if (i + batchSize < subscribers.length) {
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                }
            }
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'SEND_CAMPAIGN',
                entity: 'email_campaign',
                entityId: campaign.id,
                details: { subject, sentTo: subscribers.length, testMode },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: testMode
                    ? 'Email de prueba enviado'
                    : `Campaña enviada a ${subscribers.length} suscriptores`,
                data: campaign,
            });
        }
        catch (error) {
            next(error);
        }
    };
    // Eliminar suscriptor (admin)
    deleteSubscriber = async (req, res, next) => {
        try {
            const { id } = req.params;
            await index_1.prisma.newsletterSubscriber.delete({
                where: { id },
            });
            // Registrar actividad
            await this.activityLog.log({
                userId: req.user?.id,
                action: 'DELETE',
                entity: 'newsletter_subscriber',
                entityId: id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'Suscriptor eliminado exitosamente',
            });
        }
        catch (error) {
            next(error);
        }
    };
}
exports.NewsletterController = NewsletterController;
//# sourceMappingURL=newsletter.controller.js.map