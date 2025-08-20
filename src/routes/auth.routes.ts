import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Validaciones
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'
    ),
];

// Rutas públicas
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', authController.refreshToken);

// Rutas protegidas
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.put(
  '/change-password',
  authenticate,
  changePasswordValidation,
  validate,
  authController.changePassword
);

export default router;
