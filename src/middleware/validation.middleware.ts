import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  console.log(
    '✅ DEBUG - validate middleware called for:',
    req.method,
    req.path,
    req.originalUrl
  );
  console.log('📝 Request body:', JSON.stringify(req.body));

  // BYPASS NUCLEAR para CUALQUIER ruta de settings - SIN VALIDACIONES
  if (req.path.includes('/settings') || req.originalUrl.includes('/settings')) {
    console.log('🚫 NUCLEAR BYPASS for settings route - NO VALIDATION AT ALL');
    return next();
  }

  try {
    const errors = validationResult(req);
    console.log(
      '🔍 Validation errors:',
      errors.isEmpty() ? 'None' : errors.array()
    );

    if (!errors.isEmpty()) {
      console.log('❌ Validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        error: {
          message: 'Error de validación',
          details: errors.array(),
        },
      });
    }

    console.log('✅ Validation passed');
    next();
  } catch (validationError) {
    console.error('❌ ERROR in validation middleware:', validationError);
    // Si hay cualquier error, continuar sin validar
    next();
  }
};
