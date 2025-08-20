import { Router } from 'express';
import { NewsletterController } from '../controllers/newsletter.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.middleware';

const router = Router();
const newsletterController = new NewsletterController();

// Rutas públicas
router.post(
  '/subscribe',
  body('email').isEmail().normalizeEmail(),
  body('name').optional().isString().trim(),
  validate,
  newsletterController.subscribe
);

router.post(
  '/unsubscribe',
  body('email').isEmail().normalizeEmail(),
  validate,
  newsletterController.unsubscribe
);

// Rutas protegidas (admin)
router.get(
  '/subscribers',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  query('active').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  newsletterController.getSubscribers
);

router.delete(
  '/subscribers/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  param('id').isString(),
  validate,
  newsletterController.deleteSubscriber
);

router.get(
  '/campaigns',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  validate,
  newsletterController.getCampaigns
);

router.post(
  '/campaigns/send',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  body('subject').isString().notEmpty(),
  body('content').isString().notEmpty(),
  body('testMode').optional().isBoolean(),
  validate,
  newsletterController.sendCampaign
);

export default router;
