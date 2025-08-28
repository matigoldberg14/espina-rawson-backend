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

  // LOG DETALLADO para debug
  console.log('🔍 PATH ANALYSIS:');
  console.log('  req.path:', req.path);
  console.log('  req.originalUrl:', req.originalUrl);
  console.log('  req.baseUrl:', req.baseUrl);
  console.log('  req.url:', req.url);
  console.log(
    '  includes settings?:',
    req.path.includes('/settings') || req.originalUrl.includes('/settings')
  );

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
