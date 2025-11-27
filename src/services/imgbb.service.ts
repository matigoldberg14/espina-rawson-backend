import axios from 'axios';
import FormData from 'form-data';

interface ImgBBResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export class ImgBBService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.imgbb.com/1/upload';

  constructor() {
    this.apiKey = process.env.IMGBB_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ IMGBB_API_KEY environment variable not found. ImgBB service will not work until API key is provided.');
    }
  }

  /**
   * Sube una imagen a ImgBB y retorna la URL
   * IMPORTANTE: NO incluimos 'expiration' para que las imágenes sean PERMANENTES
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('IMGBB_API_KEY environment variable is required for image uploads');
    }
    
    if (!imageBuffer) {
      throw new Error('Image buffer is required for upload');
    }
    
    try {
      console.log('📤 Subiendo imagen a ImgBB:', filename);
      console.log('📊 Buffer size:', imageBuffer.length, 'bytes');

      // Convertir buffer a base64
      const base64Image = imageBuffer.toString('base64');

      // Crear FormData para la petición
      const formData = new FormData();
      formData.append('key', this.apiKey);
      formData.append('image', base64Image);
      formData.append('name', filename);

      // Hacer petición a ImgBB
      const response = await axios.post<ImgBBResponse>(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 segundos timeout
      });

      if (!response.data.success) {
        throw new Error('ImgBB upload failed');
      }

      // Usar display_url que es la URL optimizada para mostrar
      const imageUrl = response.data.data.display_url;
      console.log('✅ Imagen subida exitosamente a ImgBB:', imageUrl);
      console.log('📊 Detalles de la imagen:', {
        id: response.data.data.id,
        size: response.data.data.size,
        dimensions: `${response.data.data.width}x${response.data.data.height}`,
        expiration: response.data.data.expiration === '0' ? 'Permanente' : response.data.data.expiration
      });

      return imageUrl;
    } catch (error) {
      console.error('❌ Error subiendo imagen a ImgBB:', error);
      
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        throw new Error(`ImgBB API error: ${error.response?.data?.error?.message || error.message}`);
      }
      
      throw new Error(`Failed to upload image to ImgBB: ${error}`);
    }
  }

  /**
   * Sube múltiples imágenes a ImgBB
   */
  async uploadMultipleImages(files: Express.Multer.File[]): Promise<string[]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file.buffer, file.originalname)
    );

    try {
      const urls = await Promise.all(uploadPromises);
      console.log(`✅ ${urls.length} imágenes subidas exitosamente a ImgBB`);
      return urls;
    } catch (error) {
      console.error('❌ Error subiendo múltiples imágenes a ImgBB:', error);
      throw error;
    }
  }

  /**
   * Verifica si la API key es válida
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) {
      return false;
    }
    
    try {
      // Crear una imagen de prueba pequeña (1x1 pixel PNG transparente)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      
      const formData = new FormData();
      formData.append('key', this.apiKey);
      formData.append('image', testImageBase64);
      formData.append('name', 'test-validation');

      const response = await axios.post<ImgBBResponse>(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 10000,
      });

      return response.data.success;
    } catch (error) {
      console.error('❌ ImgBB API key validation failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const imgbbService = new ImgBBService();
