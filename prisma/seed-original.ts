import { PrismaClient, AuctionStatus, InformationType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedOriginal() {
  console.log('🌱 Restaurando datos originales...');

  // 1. Crear usuario administrador
  console.log('🔐 Creando usuario administrador...');
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

  // 2. Crear contenido de páginas (datos originales)
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
      value: 'Excelencia Legal y Subastas Judiciales',
      description: 'Subtítulo del hero',
      section: 'hero',
    },
    {
      key: 'hero_description',
      value:
        'Con más de 25 años de trayectoria, somos líderes en subastas judiciales y asesoramiento legal integral. Ofrecemos servicios profesionales con la máxima transparencia y eficiencia.',
      description: 'Descripción del hero',
      section: 'hero',
    },
    {
      key: 'about_title',
      value: 'Nuestra Experiencia',
      description: 'Título de la sección sobre nosotros',
      section: 'about',
    },
    {
      key: 'about_description',
      value:
        'Somos un estudio jurídico de primer nivel especializado en subastas judiciales, con presencia en todo el país. Nuestro equipo de profesionales garantiza procesos transparentes y resultados exitosos.',
      description: 'Descripción sobre nosotros',
      section: 'about',
    },
    {
      key: 'about_history_title',
      value: '25 Años de Excelencia',
      description: 'Título de historia',
      section: 'about',
    },
    {
      key: 'about_history_description',
      value:
        'Desde 1999, hemos conducido más de 10,000 subastas exitosas, consolidándonos como referentes del sector judicial argentino.',
      description: 'Descripción de historia',
      section: 'about',
    },
    {
      key: 'expertise_title',
      value: 'Nuestras Especialidades',
      description: 'Título de especialidades',
      section: 'expertise',
    },
    {
      key: 'auctions_title',
      value: 'Subastas Destacadas',
      description: 'Título de subastas',
      section: 'auctions',
    },
  ];

  for (const content of pageContents) {
    await prisma.pageContent.create({
      data: content,
    });
  }
  console.log('✅ Contenido de páginas creado');

  // 3. Crear áreas de práctica (datos originales)
  console.log('⚖️ Creando áreas de práctica...');
  const practiceAreas = [
    {
      title: 'Subastas Judiciales',
      description:
        'Conducción profesional de subastas de inmuebles, vehículos, maquinaria y bienes muebles en general.',
      icon: 'gavel',
      order: 1,
    },
    {
      title: 'Asesoramiento Jurídico',
      description:
        'Consultoría legal especializada en procesos ejecutivos, concursales y de liquidación judicial.',
      icon: 'scale',
      order: 2,
    },
    {
      title: 'Tasaciones Judiciales',
      description:
        'Valuaciones técnicas y comerciales de bienes para procesos judiciales y extrajudiciales.',
      icon: 'calculator',
      order: 3,
    },
    {
      title: 'Gestión de Activos',
      description:
        'Administración y liquidación de patrimonios en procesos judiciales complejos.',
      icon: 'briefcase',
      order: 4,
    },
  ];

  for (const area of practiceAreas) {
    await prisma.practiceArea.create({
      data: area,
    });
  }
  console.log('✅ Áreas de práctica creadas');

  // 4. Crear subastas originales (las que estaban antes)
  console.log('🏠 Creando subastas originales...');
  const auctions = [
    {
      title: 'Departamento 3 Ambientes - Palermo',
      description:
        'Excelente departamento de 3 ambientes en Palermo Hollywood. Living-comedor, 2 dormitorios, cocina integrada, balcón. Edificio con amenities: sum, parrilla, solarium. Muy luminoso.',
      type: 'inmuebles',
      location: 'Palermo, CABA',
      startingPrice: 180000,
      currentPrice: 185000,
      endDate: new Date('2024-12-30T21:00:00Z'),
      isFeatured: true,
      status: AuctionStatus.PUBLISHED,
      order: 1,
      mainImageUrl:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center',
      secondaryImage1:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
      secondaryImage2:
        'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/departamento-palermo.pdf',
    },
    {
      title: 'Casa Quinta - San Isidro',
      description:
        'Hermosa casa quinta en lote de 1200m2. 4 dormitorios, 3 baños, living, comedor, cocina, quincho con parrilla, pileta, parque con árboles frutales. Ideal familia.',
      type: 'inmuebles',
      location: 'San Isidro, Buenos Aires',
      startingPrice: 320000,
      currentPrice: 325000,
      endDate: new Date('2024-12-28T21:00:00Z'),
      isFeatured: true,
      status: AuctionStatus.PUBLISHED,
      order: 2,
      mainImageUrl:
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop&crop=center',
      secondaryImage1:
        'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
      secondaryImage2:
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/casa-san-isidro.pdf',
    },
    {
      title: 'Oficina Premium - Microcentro',
      description:
        'Oficina de 120m2 en edificio corporativo AAA. Planta libre, 2 privados, sala de reuniones, kitchenette. Aire acondicionado central, seguridad 24hs.',
      type: 'inmuebles',
      location: 'Microcentro, CABA',
      startingPrice: 95000,
      currentPrice: 98000,
      endDate: new Date('2024-12-25T21:00:00Z'),
      isFeatured: true,
      status: AuctionStatus.PUBLISHED,
      order: 3,
      mainImageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop&crop=center',
      secondaryImage1:
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop',
      secondaryImage2:
        'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/oficina-microcentro.pdf',
    },
    {
      title: 'Local Comercial - Villa Crespo',
      description:
        'Local comercial de 80m2 sobre avenida principal. Vidrieras, depósito, baño. Excelente ubicación comercial con alto tránsito peatonal.',
      type: 'inmuebles',
      location: 'Villa Crespo, CABA',
      startingPrice: 75000,
      currentPrice: 75000,
      endDate: new Date('2024-12-27T21:00:00Z'),
      isFeatured: false,
      status: AuctionStatus.PUBLISHED,
      order: 4,
      mainImageUrl:
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center',
      secondaryImage1:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      pdfUrl: 'https://example.com/local-villa-crespo.pdf',
    },
  ];

  for (const auction of auctions) {
    await prisma.auction.create({
      data: auction,
    });
  }
  console.log('✅ Subastas originales creadas');

  // 5. Crear información original
  console.log('📚 Creando contenido informativo...');
  const informationData = [
    {
      title: 'Guía Completa de Subastas Judiciales 2024',
      description:
        'Manual completo sobre el proceso de subastas judiciales en Argentina. Incluye requisitos, documentación necesaria, formas de pago y aspectos legales relevantes.',
      type: InformationType.ARTICLE,
      url: 'https://example.com/guia-subastas-2024.pdf',
      thumbnail:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      author: 'Dr. Carlos Espina',
      publishDate: new Date('2024-01-15'),
      tags: ['Subastas', 'Judicial', 'Guía', 'Legal', '2024'],
      category: 'Subastas',
      order: 1,
    },
    {
      title: 'Webinar: Cómo Participar Exitosamente en Subastas',
      description:
        'Seminario web donde explicamos paso a paso el proceso de participación en subastas judiciales, desde el registro hasta la adjudicación.',
      type: InformationType.VIDEO,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail:
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      author: 'Equipo Legal Espina Rawson',
      publishDate: new Date('2024-01-10'),
      tags: ['Webinar', 'Tutorial', 'Subastas', 'Educativo'],
      category: 'Educativo',
      order: 2,
    },
    {
      title: 'Portfolio de Propiedades Adjudicadas',
      description:
        'Galería fotográfica de las principales propiedades subastadas en el último año, con testimonios de compradores satisfechos.',
      type: InformationType.IMAGE,
      url: 'https://example.com/portfolio-2024',
      thumbnail:
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
      author: 'Marketing Espina Rawson',
      publishDate: new Date('2024-01-05'),
      tags: ['Portfolio', 'Propiedades', 'Testimonios', 'Galería'],
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

  console.log('🎉 ¡Datos originales restaurados exitosamente!');
}

seedOriginal()
  .catch((e) => {
    console.error('❌ Error restaurando datos originales:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
