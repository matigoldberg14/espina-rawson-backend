import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from '../config/env';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash(config.adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: config.adminEmail },
    update: {},
    create: {
      email: config.adminEmail,
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Usuario administrador creado:', admin.email);

  // Crear contenido inicial de la página
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
  console.log('✅ Contenido de página creado');

  // Crear áreas de práctica
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

  for (const area of practiceAreas) {
    const existing = await prisma.practiceArea.findFirst({
      where: { title: area.title }
    });
    
    if (existing) {
      await prisma.practiceArea.update({
        where: { id: existing.id },
        data: area,
      });
    } else {
      await prisma.practiceArea.create({
        data: area,
      });
    }
  }
  console.log('✅ Áreas de práctica creadas');

  // Crear configuraciones iniciales
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

  // Crear subastas de ejemplo
  const auctions = [
    {
      title: 'Inmueble Industrial en Parque Patricios',
      description:
        'Amplio galpón industrial de 2.500m² con oficinas, ubicado en zona estratégica con fácil acceso a autopistas. Ideal para operaciones logísticas o manufactureras.',
      location: 'Parque Patricios, CABA',
      startingPrice: 850000,
      currentPrice: 850000,
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 días
      status: 'PUBLISHED' as const,
      isFeatured: true,
      order: 0,
    },
    {
      title: 'Flota de Vehículos Comerciales',
      description:
        'Lote de 15 vehículos utilitarios en excelente estado, incluye camionetas y furgones. Mantenimiento al día con documentación completa.',
      location: 'Avellaneda, Buenos Aires',
      startingPrice: 320000,
      currentPrice: 320000,
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 días
      status: 'PUBLISHED' as const,
      isFeatured: true,
      order: 1,
    },
    {
      title: 'Maquinaria Agrícola de Alto Rendimiento',
      description:
        'Cosechadora John Deere modelo 2022, con menos de 500 horas de uso. Incluye cabezal maicero y plataforma sojera.',
      location: 'Pergamino, Buenos Aires',
      startingPrice: 180000,
      currentPrice: 180000,
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
      status: 'PUBLISHED' as const,
      isFeatured: true,
      order: 2,
    },
  ];

  for (const auction of auctions) {
    const existing = await prisma.auction.findFirst({
      where: { title: auction.title }
    });
    
    if (existing) {
      await prisma.auction.update({
        where: { id: existing.id },
        data: auction,
      });
    } else {
      await prisma.auction.create({
        data: auction,
      });
    }
  }
  console.log('✅ Subastas de ejemplo creadas');

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
