import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import authRoutes from './routes/auth.routes';
import contentRoutes from './routes/content.routes';
import auctionRoutes from './routes/auction.routes';
import settingsRoutes from './routes/settings.routes';
import settingsFinalRoutes from './routes/settings-final.routes';
import settingsSimpleRoutes from './routes/settings-simple.routes';
import settingsCleanRoutes from './routes/settings-clean.routes';
import settingsDirectRoutes from './routes/settings-direct.routes';
import dashboardRoutes from './routes/dashboard.routes';
import practiceAreaRoutes from './routes/practiceAreas';
import teamMemberRoutes from './routes/teamMembers';
import studioContentRoutes from './routes/studioContent';
import informationRoutes from './routes/information.routes';
import publicRoutes from './routes/public.routes';
import newsletterRoutes from './routes/newsletter.routes';
import lotRoutes from './routes/lot.routes';
import uploadRoutes from './routes/upload.routes';
import clientRoutes from './routes/client.routes';

// Importar controlador para prueba directa
import { SettingsController } from './controllers/settings.controller';

// Middlewares
import { errorHandler } from './middleware/error.middleware';
import { notFound } from './middleware/notFound.middleware';

// Cargar variables de entorno
dotenv.config();

// TIMESTAMP: Force deploy v1.0.25 SETTINGS FIX - ${new Date().toISOString()}

// Inicializar Prisma
export const prisma = new PrismaClient();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway/production environments
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde.',
});

// Middlewares globales
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Servir archivos estáticos desde public
app.use(express.static(path.join(__dirname, '../public')));

// CORS: permitir múltiples orígenes (dominio principal + Vercel + localhost)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ALT,
  'http://localhost:3000',
  'http://localhost:4321',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (ej: curl, Postman, server-side)
      if (!origin) return callback(null, true);
      if (allowedOrigins.some(allowed => origin === allowed)) {
        return callback(null, true);
      }
      // También permitir subdominios de vercel.app del proyecto
      if (origin.includes('diseno-espina-rawson') && origin.includes('vercel.app')) {
        return callback(null, true);
      }
      console.warn(`⚠️ CORS bloqueó origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Servir el backoffice en producción
if (process.env.NODE_ENV === 'production') {
  app.use(
    '/backoffice',
    express.static(path.join(__dirname, '../backoffice/dist'))
  );
  app.get('/backoffice/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../backoffice/dist/index.html'));
  });
}

// Rate limiting para rutas específicas
app.use(
  '/api/auth/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Demasiados intentos de login, por favor intente más tarde.',
  })
);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Health check for Railway (API path)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    service: 'espina-rawson-backend',
    version: '1.0.28',
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/auctions', auctionRoutes);

// PRUEBA SUPER SIMPLE
app.put('/api/test-simple/:key', (req, res) => {
  res.json({
    success: true,
    message: 'RUTA FUNCIONA!',
    key: req.params.key,
    body: req.body,
  });
});

// PRUEBA DIRECTA SIN ARCHIVO SEPARADO
const directSettingsController = new SettingsController();
app.put(
  '/api/settings-direct-test/:key',
  directSettingsController.updateSetting
);

// RUTA SIMPLE SIN NADA DE MIDDLEWARE
app.use('/api/settings-simple', settingsSimpleRoutes);
// TEMPORAL: Nueva ruta para debug TOTAL
app.use('/api/settings-test', settingsFinalRoutes);
// USAR LA RUTA FINAL LIMPIA
app.use('/api/settings', settingsFinalRoutes);
app.use('/api/settings-clean', settingsCleanRoutes);
app.use('/api/settings-direct', settingsDirectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/practice-areas', practiceAreaRoutes);
app.use('/api/team-members', teamMemberRoutes);
app.use('/api/studio-content', studioContentRoutes);
app.use('/api/information', informationRoutes);
app.use('/api/lots', lotRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/clients', clientRoutes);

// Rutas públicas (para el frontend)
app.use('/api/public', publicRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Función para inicializar el servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor Espina Rawson...');
    console.log(`📦 NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(
      `🔗 DATABASE_URL configurado: ${process.env.DATABASE_URL ? 'SÍ' : 'NO'}`
    );
    console.log(`🌐 PORT: ${PORT}`);

    // Conectar a la base de datos
    console.log('🔄 Conectando a la base de datos...');
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');

    // Crear carpeta de uploads si no existe
    const uploadsDir = path.join(__dirname, '../uploads');
    const fs = await import('fs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Iniciar servidor - Escuchar en 0.0.0.0 para Railway
    const HOST = '0.0.0.0';
    const port = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
    app.listen(port, HOST, () => {
      console.log(`🚀 Servidor corriendo en http://${HOST}:${port}`);
      console.log(`📝 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`🔒 CORS habilitado para: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⏹️  Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar servidor
startServer();
