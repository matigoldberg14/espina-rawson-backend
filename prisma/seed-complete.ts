import { PrismaClient, InformationType, AuctionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedComplete() {
  console.log('🌱 Iniciando seed completo...');

  // 1. Crear usuario administrador
  console.log('🔐 Creando usuario administrador...');
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@espinarawson.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123456', 12);
    await prisma.user.create({
      data: {
        email: 'admin@espinarawson.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'SUPER_ADMIN',
        isActive: true,
      },
    });
    console.log('✅ Usuario administrador creado');
  } else {
    console.log('✅ Usuario administrador ya existe');
  }

  // 2. Crear contenido de páginas
  console.log('📝 Creando contenido de páginas...');
  const pageContents = [
    {
      key: 'hero_title',
      value: 'Espina Rawson & Asociados',
      description: 'Título principal del hero',
      section: 'hero',
    },
    {
      key: 'hero_subtitle',
      value: 'Excelencia en Subastas Judiciales',
      description: 'Subtítulo del hero',
      section: 'hero',
    },
    {
      key: 'hero_description',
      value:
        'Más de 25 años de experiencia en subastas judiciales, brindando servicios profesionales y confiables en todo el territorio argentino.',
      description: 'Descripción del hero',
      section: 'hero',
    },
    {
      key: 'about_title',
      value: 'Sobre Nosotros',
      description: 'Título de la sección sobre nosotros',
      section: 'about',
    },
    {
      key: 'about_description',
      value:
        'Somos un estudio jurídico especializado en subastas judiciales con más de dos décadas de experiencia. Nuestro compromiso es brindar servicios profesionales, transparentes y eficientes.',
      description: 'Descripción sobre nosotros',
      section: 'about',
    },
  ];

  for (const content of pageContents) {
    await prisma.pageContent.upsert({
      where: { key: content.key },
      update: { value: content.value },
      create: content,
    });
  }
  console.log('✅ Contenido de páginas creado');

  // 3. Crear áreas de práctica
  console.log('⚖️ Creando áreas de práctica...');
  const practiceAreas = [
    {
      title: 'Subastas Judiciales',
      description:
        'Especialistas en la conducción de subastas judiciales de bienes inmuebles, muebles, vehículos y maquinaria industrial.',
      icon: 'gavel',
      order: 1,
    },
    {
      title: 'Asesoramiento Legal',
      description:
        'Brindamos asesoramiento integral en procesos judiciales, ejecuciones y procedimientos concursales.',
      icon: 'scale',
      order: 2,
    },
    {
      title: 'Tasaciones',
      description:
        'Realizamos tasaciones profesionales de bienes para procesos judiciales y extrajudiciales.',
      icon: 'calculator',
      order: 3,
    },
    {
      title: 'Gestión de Cobros',
      description:
        'Especialistas en gestión y recupero de créditos mediante procedimientos judiciales y extrajudiciales.',
      icon: 'credit-card',
      order: 4,
    },
  ];

  for (const area of practiceAreas) {
    await prisma.practiceArea.create({
      data: area,
    });
  }
  console.log('✅ Áreas de práctica creadas');

  // 4. Crear subastas de ejemplo
  console.log('🏠 Creando subastas de ejemplo...');
  const auctions = [
    {
      title: 'Departamento en Palermo',
      description:
        'Hermoso departamento de 2 ambientes en el corazón de Palermo. Excelente ubicación, cerca de transporte público y centros comerciales.',
      type: 'inmuebles',
      location: 'Palermo, CABA',
      startingPrice: 150000,
      currentPrice: 150000,
      endDate: new Date('2024-12-31'),
      isFeatured: true,
      status: AuctionStatus.PUBLISHED,
      order: 1,
      mainImageUrl:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/departamento-palermo.pdf',
    },
    {
      title: 'Casa en San Isidro',
      description:
        'Casa familiar de 4 ambientes con jardín. Ideal para familias, ubicada en zona residencial tranquila.',
      type: 'inmuebles',
      location: 'San Isidro, Buenos Aires',
      startingPrice: 280000,
      currentPrice: 280000,
      endDate: new Date('2024-12-25'),
      isFeatured: true,
      status: AuctionStatus.PUBLISHED,
      order: 2,
      mainImageUrl:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/casa-san-isidro.pdf',
    },
    {
      title: 'Oficina Comercial Microcentro',
      description:
        'Oficina comercial en edificio corporativo. Excelente para inversión o uso propio.',
      type: 'inmuebles',
      location: 'Microcentro, CABA',
      startingPrice: 95000,
      currentPrice: 95000,
      endDate: new Date('2024-12-20'),
      isFeatured: true,
      status: AuctionStatus.PUBLISHED,
      order: 3,
      mainImageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/oficina-microcentro.pdf',
    },
  ];

  for (const auction of auctions) {
    await prisma.auction.create({
      data: auction,
    });
  }
  console.log('✅ Subastas de ejemplo creadas');

  // 5. Crear información
  console.log('📚 Creando contenido informativo...');
  const informationData = [
    {
      title: 'Guía Completa de Subastas Judiciales',
      description:
        'Todo lo que necesitas saber sobre el proceso de subastas judiciales en Argentina, desde la presentación hasta la adjudicación.',
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
        'Tutorial paso a paso sobre cómo participar correctamente en una subasta judicial.',
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
        'Imágenes de propiedades subastadas exitosamente y testimonios de clientes satisfechos.',
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
  ];

  for (const info of informationData) {
    await prisma.information.create({
      data: info,
    });
  }
  console.log('✅ Contenido informativo creado');

  console.log('🎉 ¡Seed completo finalizado exitosamente!');
}

seedComplete()
  .catch((e) => {
    console.error('❌ Error en seed completo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
