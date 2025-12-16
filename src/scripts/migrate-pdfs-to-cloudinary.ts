/**
 * Script de migración: Sube PDFs existentes de la BD a Cloudinary
 * Ejecutar con: npx tsx src/scripts/migrate-pdfs-to-cloudinary.ts
 */

import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sanitizeFilename(filename: string): string {
  // Remover extensión y sanitizar caracteres especiales
  return filename
    .replace(/\.[^/.]+$/, '') // Remover extensión
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/-+/g, '-') // Eliminar guiones múltiples
    .replace(/^-|-$/g, '') // Eliminar guiones al inicio/final
    .substring(0, 100); // Limitar longitud
}

async function uploadPdfToCloudinary(buffer: Buffer, filename: string): Promise<string> {
  const stream = Readable.from(buffer);
  const sanitizedName = sanitizeFilename(filename);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'espinasubastas',
        public_id: sanitizedName,
        format: 'pdf',
        use_filename: false,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result || !result.secure_url) {
          reject(new Error('No URL returned from Cloudinary'));
          return;
        }
        resolve(result.secure_url);
      }
    );

    stream.pipe(uploadStream);
  });
}

async function migratePdfs() {
  console.log('🚀 Iniciando migración de PDFs a Cloudinary...\n');

  // Verificar configuración de Cloudinary
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Error: Variables de entorno de Cloudinary no configuradas');
    console.error('   Configura: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  console.log('✅ Cloudinary configurado:', process.env.CLOUDINARY_CLOUD_NAME);

  // Buscar subastas con pdfData pero sin URL de Cloudinary
  const auctionsWithPdfData = await prisma.auction.findMany({
    where: {
      pdfData: {
        not: null,
      },
    },
    select: {
      id: true,
      title: true,
      pdfData: true,
      pdfFilename: true,
      pdfUrl: true,
    },
  });

  console.log(`📦 Encontradas ${auctionsWithPdfData.length} subastas con pdfData\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const auction of auctionsWithPdfData) {
    console.log(`\n📄 Procesando: ${auction.title}`);
    console.log(`   ID: ${auction.id}`);
    console.log(`   pdfUrl actual: ${auction.pdfUrl || 'ninguno'}`);

    // Si ya tiene URL de Cloudinary, saltar
    if (auction.pdfUrl && auction.pdfUrl.includes('cloudinary.com')) {
      console.log('   ⏭️ Ya tiene URL de Cloudinary, saltando...');
      skipped++;
      continue;
    }

    if (!auction.pdfData) {
      console.log('   ⚠️ No tiene pdfData, saltando...');
      skipped++;
      continue;
    }

    try {
      const pdfBuffer = Buffer.isBuffer(auction.pdfData)
        ? auction.pdfData
        : Buffer.from(auction.pdfData as any);

      const filename = auction.pdfFilename || `subasta-${auction.id}.pdf`;
      console.log(`   📤 Subiendo ${filename} (${pdfBuffer.length} bytes)...`);

      const cloudinaryUrl = await uploadPdfToCloudinary(pdfBuffer, filename);

      // Actualizar en BD
      await prisma.auction.update({
        where: { id: auction.id },
        data: { pdfUrl: cloudinaryUrl },
      });

      console.log(`   ✅ Migrado exitosamente: ${cloudinaryUrl}`);
      migrated++;
    } catch (error) {
      console.error(`   ❌ Error migrando:`, error);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(50));
  console.log(`   ✅ Migrados: ${migrated}`);
  console.log(`   ⏭️ Saltados: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

migratePdfs().catch(console.error);

