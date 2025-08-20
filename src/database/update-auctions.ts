import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function updateAuctions() {
  try {
    console.log('🔄 Actualizando subastas existentes...');

    // Obtener todas las subastas
    const auctions = await prisma.auction.findMany();

    // Mapeo de títulos a tipos
    const typeMapping: Record<string, string> = {
      'Colección de Arte Contemporáneo': 'arte',
      'Propiedad en Recoleta': 'inmuebles',
      'Vehículos de Colección': 'vehiculos',
      'Maquinaria Agrícola de Alto Rendimiento': 'maquinaria',
      'Flota de Vehículos Comerciales': 'vehiculos',
      'Inmueble Industrial en Parque Patricios': 'inmuebles',
    };

    for (const auction of auctions) {
      const type = typeMapping[auction.title] || 'general';

      await prisma.auction.update({
        where: { id: auction.id },
        data: {
          type,
          mainImageUrl:
            auction.mainImageUrl || '/placeholder.svg?height=600&width=800',
        },
      });

      console.log(`✅ Actualizada subasta: ${auction.title} -> tipo: ${type}`);
    }

    console.log('✅ Todas las subastas han sido actualizadas');
  } catch (error) {
    console.error('❌ Error actualizando subastas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAuctions();
