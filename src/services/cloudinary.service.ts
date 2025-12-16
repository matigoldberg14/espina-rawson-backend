import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

function sanitizeFilename(filename: string): string {
  // Remover extensión y sanitizar caracteres especiales
  return filename
    .replace(/\.[^/.]+$/, '') // Remover extensión
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/-+/g, '-') // Eliminar guiones múltiples
    .replace(/^-|-$/g, '') // Eliminar guiones al inicio/final
    .substring(0, 100); // Limitar longitud
}

interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
}

export class CloudinaryService {
  private config: CloudinaryConfig | null = null;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      this.config = {
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      };

      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      console.log('✅ Cloudinary configurado correctamente');
    } else {
      console.warn(
        '⚠️ Cloudinary no está configurado. Variables de entorno faltantes:',
        {
          CLOUDINARY_CLOUD_NAME: !!cloudName,
          CLOUDINARY_API_KEY: !!apiKey,
          CLOUDINARY_API_SECRET: !!apiSecret,
        }
      );
    }
  }

  /**
   * Sube un archivo PDF a Cloudinary
   * @param buffer - Buffer del archivo PDF
   * @param filename - Nombre del archivo original
   * @returns URL del PDF subido
   */
  async uploadPdf(buffer: Buffer, filename: string): Promise<string> {
    if (!this.config) {
      throw new Error(
        'Cloudinary no está configurado. Verifique las variables de entorno: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
      );
    }

    if (!buffer || buffer.length === 0) {
      throw new Error('El buffer del archivo está vacío');
    }

    try {
      const sanitizedName = sanitizeFilename(filename);
      console.log(`📤 Subiendo PDF a Cloudinary: ${filename} -> ${sanitizedName} (${buffer.length} bytes)`);

      // Convertir buffer a stream
      const stream = Readable.from(buffer);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw', // Para PDFs y otros archivos no-imagen
            folder: 'espinasubastas', // Carpeta en Cloudinary
            public_id: sanitizedName, // Nombre sanitizado
            format: 'pdf', // Forzar formato PDF
            use_filename: false,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              console.error('❌ Error subiendo PDF a Cloudinary:', error);
              reject(error);
              return;
            }

            if (!result || !result.secure_url) {
              console.error('❌ Cloudinary no devolvió una URL válida');
              reject(new Error('No se recibió URL del servidor de Cloudinary'));
              return;
            }

            console.log(`✅ PDF subido exitosamente a Cloudinary:`, {
              url: result.secure_url,
              public_id: result.public_id,
              format: result.format,
              bytes: result.bytes,
            });

            resolve(result.secure_url);
          }
        );

        stream.pipe(uploadStream);
      });
    } catch (error) {
      console.error('❌ Error en uploadPdf:', error);
      throw error;
    }
  }

  /**
   * Elimina un archivo de Cloudinary por su URL pública
   * @param url - URL pública del archivo
   */
  async deletePdf(url: string): Promise<void> {
    if (!this.config) {
      console.warn('⚠️ Cloudinary no está configurado, no se puede eliminar el archivo');
      return;
    }

    try {
      // Extraer public_id de la URL
      // Formato: https://res.cloudinary.com/cloud_name/resource_type/upload/v1234567890/folder/filename.pdf
      const matches = url.match(/\/v\d+\/(.+)\.pdf$/);
      if (!matches || !matches[1]) {
        console.warn(`⚠️ No se pudo extraer public_id de la URL: ${url}`);
        return;
      }

      const publicId = matches[1];

      console.log(`🗑️ Eliminando PDF de Cloudinary: ${publicId}`);

      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
      });

      if (result.result === 'ok') {
        console.log(`✅ PDF eliminado exitosamente: ${publicId}`);
      } else {
        console.warn(`⚠️ No se pudo eliminar el PDF: ${result.result}`);
      }
    } catch (error) {
      console.error('❌ Error eliminando PDF de Cloudinary:', error);
      // No lanzar error para no romper el flujo
    }
  }
}

export const cloudinaryService = new CloudinaryService();

