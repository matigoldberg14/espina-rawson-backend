import { PrismaClient, InformationType, AuctionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedRealOriginal() {
  console.log('🌱 Restaurando datos ORIGINALES exactos...');

  // 1. Crear usuario administrador
  console.log('🔐 Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123456', 12);
  await prisma.user.upsert({
    where: { email: 'admin@espinarawson.com' },
    update: {},
    create: {
      email: 'admin@espinarawson.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Usuario administrador creado');

  // 2. Crear contenido ORIGINAL de páginas
  console.log('📝 Creando contenido ORIGINAL de páginas...');
  const pageContents = [
    // Hero Section
    {
      key: 'hero_title',
      value: 'Legado. Futuro.',
      section: 'hero',
      description: 'Título principal del hero',
    },
    {
      key: 'hero_subtitle',
      value: 'Estrategia.',
      section: 'hero',
      description: 'Subtítulo del hero',
    },
    {
      key: 'hero_description',
      value:
        'Desde 1968, redefiniendo la excelencia en el derecho comercial y las subastas de alto valor.',
      section: 'hero',
      description: 'Descripción del hero',
    },
    // About Section
    {
      key: 'about_title',
      value: 'El Estudio.',
      section: 'about',
      description: 'Título de la sección sobre nosotros',
    },
    {
      key: 'about_description',
      value:
        'Somos arquitectos de soluciones. Nuestra firma se cimienta sobre décadas de experiencia, pero nuestra mirada está puesta en el futuro. Integramos tecnología y un enfoque multidisciplinario para ofrecer una claridad y eficacia sin precedentes.',
      section: 'about',
      description: 'Descripción principal del estudio',
    },
    {
      key: 'about_history_title',
      value: 'Más de 50 Años Definiendo el Futuro Legal.',
      section: 'about',
      description: 'Título de la historia',
    },
    {
      key: 'about_history_description',
      value:
        'Nuestra trayectoria es la base de nuestra innovación. Desde 1968, hemos sido pioneros en la resolución de casos complejos y en la gestión de activos de alto valor, estableciendo un estándar de excelencia y confianza en el ámbito de las subastas judiciales y el derecho concursal.',
      section: 'about',
      description: 'Descripción de la historia',
    },
    // Expertise Section
    {
      key: 'expertise_title',
      value: 'Nuestra Expertise.',
      section: 'expertise',
      description: 'Título de la sección de expertise',
    },
    {
      key: 'expertise_subtitle',
      value:
        'Dominio integral en las áreas críticas del derecho para el éxito de su negocio.',
      section: 'expertise',
      description: 'Subtítulo de expertise',
    },
    // Auctions Section
    {
      key: 'auctions_title',
      value: 'Oportunidades Únicas.',
      section: 'auctions',
      description: 'Título de la sección de subastas',
    },
    {
      key: 'auctions_subtitle',
      value:
        'Acceda a subastas gestionadas con la máxima transparencia y profesionalismo.',
      section: 'auctions',
      description: 'Subtítulo de subastas',
    },
  ];

  for (const content of pageContents) {
    await prisma.pageContent.upsert({
      where: { key: content.key },
      update: {
        value: content.value,
        description: content.description,
        section: content.section,
      },
      create: content,
    });
  }
  console.log('✅ Contenido ORIGINAL de páginas creado');

  // 3. Crear áreas de práctica ORIGINALES
  console.log('⚖️ Creando áreas de práctica ORIGINALES...');
  const practiceAreas = [
    {
      title: 'Derecho Corporativo',
      description:
        'Asesoramiento integral en constitución de sociedades, fusiones, adquisiciones y reestructuraciones corporativas.',
      icon: 'briefcase',
      order: 0,
    },
    {
      title: 'Litigios y Arbitrajes',
      description:
        'Representación en disputas comerciales complejas, con un enfoque en la resolución eficiente de conflictos.',
      icon: 'scale',
      order: 1,
    },
    {
      title: 'Derecho Concursal',
      description:
        'Especialistas en procesos de insolvencia, reestructuración de deudas y recuperación de activos.',
      icon: 'shield',
      order: 2,
    },
    {
      title: 'Subastas y Ejecuciones',
      description:
        'Gestión profesional de subastas judiciales y extrajudiciales, maximizando el valor de los activos.',
      icon: 'gavel',
      order: 3,
    },
  ];

  // Limpiar áreas de práctica existentes y crear las originales
  await prisma.practiceArea.deleteMany({});
  for (const area of practiceAreas) {
    await prisma.practiceArea.create({
      data: area,
    });
  }
  console.log('✅ Áreas de práctica ORIGINALES creadas');

  // 4. Crear configuraciones iniciales
  console.log('⚙️ Creando configuraciones...');
  const settings = [
    {
      key: 'contact_email',
      value: 'info@espinarawson.com',
      description: 'Email de contacto principal',
    },
    {
      key: 'contact_phone',
      value: '(011) 1234-5678',
      description: 'Teléfono de contacto',
    },
    {
      key: 'contact_address',
      value: 'Av. Corrientes 1234, CABA',
      description: 'Dirección de la oficina',
    },
    {
      key: 'social_links',
      value: {
        linkedin: 'https://linkedin.com/company/espina-rawson',
        twitter: 'https://twitter.com/espinarawson',
      },
      description: 'Enlaces a redes sociales',
    },
  ];

  for (const setting of settings) {
    await prisma.settings.upsert({
      where: { key: setting.key },
      update: {
        value: setting.value,
        description: setting.description,
      },
      create: setting,
    });
  }
  console.log('✅ Configuraciones creadas');

  // 5. Crear subastas ORIGINALES con fechas futuras
  console.log('🏠 Creando subastas ORIGINALES...');
  const auctions = [
    {
      title: 'Inmueble Industrial en Parque Patricios',
      description:
        'Amplio galpón industrial de 2.500m² con oficinas, ubicado en zona estratégica con fácil acceso a autopistas. Ideal para operaciones logísticas o manufactureras.',
      location: 'Parque Patricios, CABA',
      startingPrice: 850000,
      currentPrice: 850000,
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días
      status: AuctionStatus.PUBLISHED,
      isFeatured: true,
      order: 0,
      mainImageUrl:
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
      secondaryImage1:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/inmueble-parque-patricios.pdf',
    },
    {
      title: 'Flota de Vehículos Comerciales',
      description:
        'Lote de 15 vehículos utilitarios en excelente estado, incluye camionetas y furgones. Mantenimiento al día con documentación completa.',
      location: 'Avellaneda, Buenos Aires',
      startingPrice: 320000,
      currentPrice: 320000,
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 días
      status: AuctionStatus.PUBLISHED,
      isFeatured: true,
      order: 1,
      mainImageUrl:
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop',
      secondaryImage1:
        'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/flota-vehiculos.pdf',
    },
    {
      title: 'Maquinaria Agrícola de Alto Rendimiento',
      description:
        'Cosechadora John Deere modelo 2022, con menos de 500 horas de uso. Incluye cabezal maicero y plataforma sojera.',
      location: 'Pergamino, Buenos Aires',
      startingPrice: 180000,
      currentPrice: 180000,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
      status: AuctionStatus.PUBLISHED,
      isFeatured: true,
      order: 2,
      mainImageUrl:
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=600&fit=crop',
      secondaryImage1:
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/maquinaria-agricola.pdf',
    },
  ];

  // Limpiar subastas existentes y crear las originales
  await prisma.auction.deleteMany({});
  for (const auction of auctions) {
    await prisma.auction.create({
      data: auction,
    });
  }
  console.log('✅ Subastas ORIGINALES creadas');

  // 6. Crear información (nueva sección)
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

  // Limpiar información existente y crear nueva
  await prisma.information.deleteMany({});
  for (const info of informationData) {
    await prisma.information.create({
      data: info,
    });
  }
  console.log('✅ Contenido informativo creado');

  console.log('🎉 ¡Datos ORIGINALES exactos restaurados exitosamente!');
}

seedRealOriginal()
  .catch((e) => {
    console.error('❌ Error restaurando datos ORIGINALES:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
