import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas del dashboard
router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getRecentActivity);
router.get('/auctions/upcoming', dashboardController.getUpcomingAuctions);

export default router;
