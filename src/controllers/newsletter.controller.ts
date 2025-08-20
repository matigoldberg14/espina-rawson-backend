import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { ActivityLogService } from '../services/activityLog.service';
import nodemailer from 'nodemailer';

export class NewsletterController {
  private activityLog = new ActivityLogService();

  // Suscribirse al newsletter (público)
  subscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body;

      // Verificar si ya existe
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email },
      });

      if (existing) {
        if (existing.isActive) {
          return res.status(400).json({
            success: false,
            error: { message: 'Este email ya está suscrito' },
          });
        } else {
          // Reactivar suscripción
          await prisma.newsletterSubscriber.update({
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
      const subscriber = await prisma.newsletterSubscriber.create({
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
    } catch (error) {
      next(error);
    }
  };

  // Desuscribirse (público)
  unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email },
      });

      if (!subscriber) {
        return res.status(404).json({
          success: false,
          error: { message: 'Email no encontrado' },
        });
      }

      await prisma.newsletterSubscriber.update({
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
    } catch (error) {
      next(error);
    }
  };

  // Obtener todos los suscriptores (admin)
  getSubscribers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { active, page = 1, limit = 50 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};
      if (active !== undefined) {
        where.isActive = active === 'true';
      }

      const [subscribers, total] = await Promise.all([
        prisma.newsletterSubscriber.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { subscribedAt: 'desc' },
        }),
        prisma.newsletterSubscriber.count({ where }),
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
    } catch (error) {
      next(error);
    }
  };

  // Obtener campañas de email (admin)
  getCampaigns = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [campaigns, total] = await Promise.all([
        prisma.emailCampaign.findMany({
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.emailCampaign.count(),
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
    } catch (error) {
      next(error);
    }
  };

  // Crear y enviar campaña de email (admin)
  sendCampaign = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subject, content, testMode = false } = req.body;

      // Obtener suscriptores activos
      const subscribers = await prisma.newsletterSubscriber.findMany({
        where: { isActive: true },
      });

      if (subscribers.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'No hay suscriptores activos' },
        });
      }

      // Crear campaña
      const campaign = await prisma.emailCampaign.create({
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
      const transporter = nodemailer.createTransport({
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
      } else {
        // Enviar a todos los suscriptores (en lotes para evitar límites)
        const batchSize = 50;
        for (let i = 0; i < subscribers.length; i += batchSize) {
          const batch = subscribers.slice(i, i + batchSize);

          await Promise.all(
            batch.map((subscriber) =>
              transporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@espinarawson.com',
                to: subscriber.email,
                subject,
                html:
                  content +
                  `
                  <hr>
                  <p style="font-size: 12px; color: #666;">
                    Para desuscribirse, haga clic 
                    <a href="${process.env.FRONTEND_URL}/unsubscribe?email=${subscriber.email}">aquí</a>
                  </p>
                `,
              })
            )
          );

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
    } catch (error) {
      next(error);
    }
  };

  // Eliminar suscriptor (admin)
  deleteSubscriber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      await prisma.newsletterSubscriber.delete({
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
    } catch (error) {
      next(error);
    }
  };
}
