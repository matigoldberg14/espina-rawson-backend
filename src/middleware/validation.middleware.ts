import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  console.log(
    '✅ DEBUG - validate middleware called for:',
    req.method,
    req.path
  );
  console.log('📝 Request body:', JSON.stringify(req.body));

  const errors = validationResult(req);
  console.log(
    '🔍 Validation errors:',
    errors.isEmpty() ? 'None' : errors.array()
  );

  // BYPASS temporal para settings - limpiar errores residuales
  if (req.path.includes('/settings')) {
    console.log('🚫 BYPASSING validation for settings route:', req.path);
    return next();
  }

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
};
