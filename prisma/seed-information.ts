import { PrismaClient, InformationType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInformation() {
  console.log('🌱 Seeding información...');

  const informationData = [
    {
      title: 'Guía Completa de Subastas Judiciales',
      description:
        'Todo lo que necesitas saber sobre el proceso de subastas judiciales en Argentina, desde la presentación hasta la adjudicación. Incluye requisitos, documentación necesaria y pasos a seguir.',
      type: InformationType.ARTICLE,
      url: 'https://example.com/guia-subastas-judiciales.pdf',
      thumbnail:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      author: 'Dr. Carlos Espina',
      publishDate: new Date('2024-01-15'),
      tags: ['Subastas', 'Judicial', 'Guía', 'Legal'],
      category: 'Subastas',
      order: 1,
    },
    {
      title: 'Video: Cómo Participar en una Subasta',
      description:
        'Tutorial paso a paso sobre cómo participar correctamente en una subasta judicial. Aprende sobre los requisitos, documentación y procedimientos necesarios.',
      type: InformationType.VIDEO,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail:
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      author: 'Equipo Legal Espina Rawson',
      publishDate: new Date('2024-01-10'),
      tags: ['Tutorial', 'Subastas', 'Video', 'Educativo'],
      category: 'Educativo',
      order: 2,
    },
    {
      title: 'Galería: Casos de Éxito en Subastas',
      description:
        'Imágenes de propiedades subastadas exitosamente y testimonios de clientes satisfechos. Conoce nuestros casos más destacados.',
      type: InformationType.IMAGE,
      url: 'https://example.com/galeria-casos-exito',
      thumbnail:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
      author: 'Marketing Espina Rawson',
      publishDate: new Date('2024-01-05'),
      tags: ['Casos de Éxito', 'Galería', 'Testimonios', 'Propiedades'],
      category: 'Casos de Éxito',
      order: 3,
    },
    {
      title: 'Derechos y Obligaciones del Comprador',
      description:
        'Artículo detallado sobre los derechos y obligaciones que adquiere el comprador en una subasta judicial. Información legal esencial.',
      type: InformationType.ARTICLE,
      url: 'https://example.com/derechos-obligaciones-comprador.pdf',
      thumbnail:
        'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
      author: 'Dra. María Rawson',
      publishDate: new Date('2024-01-20'),
      tags: ['Derechos', 'Obligaciones', 'Comprador', 'Legal'],
      category: 'Legal',
      order: 4,
    },
    {
      title: 'Webinar: Inversión en Subastas Inmobiliarias',
      description:
        'Grabación de nuestro webinar sobre cómo invertir inteligentemente en subastas inmobiliarias. Estrategias y consejos de expertos.',
      type: InformationType.VIDEO,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail:
        'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=400&h=300&fit=crop',
      author: 'Dr. Carlos Espina',
      publishDate: new Date('2024-01-25'),
      tags: ['Webinar', 'Inversión', 'Inmobiliarias', 'Estrategias'],
      category: 'Educativo',
      order: 5,
    },
    {
      title: 'Galería: Antes y Después de Propiedades',
      description:
        'Transformaciones impresionantes de propiedades adquiridas en subastas. Ver el potencial de cada inversión.',
      type: InformationType.IMAGE,
      url: 'https://example.com/galeria-transformaciones',
      thumbnail:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
      author: 'Equipo Técnico',
      publishDate: new Date('2024-02-01'),
      tags: ['Transformación', 'Propiedades', 'Antes y Después', 'Renovación'],
      category: 'Casos de Éxito',
      order: 6,
    },
  ];

  for (const info of informationData) {
    const created = await prisma.information.create({
      data: info,
    });
    console.log(`✅ Created: ${created.title}`);
  }

  console.log('✅ Información seed completado!');
}

seedInformation()
  .catch((e) => {
    console.error('❌ Error seeding información:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
