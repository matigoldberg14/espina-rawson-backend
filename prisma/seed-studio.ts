import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed del estudio...');

  // Crear áreas de práctica
  console.log('📋 Creando áreas de práctica...');
  const practiceAreas = await Promise.all([
    prisma.practiceArea.create({
      data: {
        title: 'Derecho Concursal y Quiebras',
        description:
          'Asesoramiento integral en procesos de crisis, reestructuraciones de deuda, concursos preventivos y quiebras.',
        icon: 'Shield',
        order: 1,
        isActive: true,
      },
    }),
    prisma.practiceArea.create({
      data: {
        title: 'Litigios Complejos y Arbitrajes',
        description:
          'Representación en disputas judiciales y extrajudiciales de alta complejidad a nivel nacional e internacional.',
        icon: 'Scale',
        order: 2,
        isActive: true,
      },
    }),
    prisma.practiceArea.create({
      data: {
        title: 'Subastas Judiciales y Extrajudiciales',
        description:
          'Gestión completa del proceso de subasta, desde la tasación hasta la liquidación final de activos.',
        icon: 'Gavel',
        order: 3,
        isActive: true,
      },
    }),
    prisma.practiceArea.create({
      data: {
        title: 'Derecho Corporativo y M&A',
        description:
          'Asesoramiento en fusiones, adquisiciones, gobierno corporativo y estructuración de negocios.',
        icon: 'Briefcase',
        order: 4,
        isActive: true,
      },
    }),
    prisma.practiceArea.create({
      data: {
        title: 'Real Estate',
        description:
          'Consultoría en desarrollos inmobiliarios, fideicomisos y estructuración de inversiones en bienes raíces.',
        icon: 'Building',
        order: 5,
        isActive: true,
      },
    }),
    prisma.practiceArea.create({
      data: {
        title: 'Activos Industriales',
        description:
          'Especialización en la valoración y liquidación de plantas industriales, maquinaria y líneas de producción.',
        icon: 'Factory',
        order: 6,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${practiceAreas.length} áreas de práctica creadas`);

  // Crear miembros del equipo
  console.log('👥 Creando miembros del equipo...');
  const teamMembers = await Promise.all([
    prisma.teamMember.create({
      data: {
        name: 'Juan Carlos Espina',
        role: 'Socio Fundador',
        bio: 'Con más de 50 años de experiencia, el Dr. Espina es una eminencia en derecho concursal y quiebras, liderando algunos de los casos más significativos del país.',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        linkedin: 'https://linkedin.com/in/juan-carlos-espina',
        order: 1,
        isActive: true,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: 'María Rawson',
        role: 'Socia Directora',
        bio: 'Especialista en litigios complejos y arbitraje internacional. La Dra. Rawson es reconocida por su enfoque estratégico y su capacidad para resolver disputas de alto perfil.',
        image:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop',
        linkedin: 'https://linkedin.com/in/maria-rawson',
        order: 2,
        isActive: true,
      },
    }),
    prisma.teamMember.create({
      data: {
        name: 'Pedro González',
        role: 'Abogado Senior - Corporativo',
        bio: 'Lidera el departamento de derecho corporativo, asesorando a empresas nacionales e internacionales en fusiones, adquisiciones y gobierno corporativo.',
        image:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
        linkedin: 'https://linkedin.com/in/pedro-gonzalez',
        order: 3,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${teamMembers.length} miembros del equipo creados`);

  // Crear contenido del estudio
  console.log('📝 Creando contenido del estudio...');
  const studioContent = await Promise.all([
    prisma.studioContent.create({
      data: {
        section: 'hero',
        title: 'El Estudio',
        subtitle:
          'Tradición, innovación y un compromiso inquebrantable con la excelencia.',
        content:
          'Fundado en 1968, nuestro estudio nació con la vocación de ofrecer un servicio legal de máxima calidad, especializado en los desafíos más complejos del derecho comercial.',
        image:
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        order: 1,
        isActive: true,
      },
    }),
    prisma.studioContent.create({
      data: {
        section: 'history',
        title: 'Nuestra Historia',
        subtitle: 'Más de 50 años de excelencia',
        content:
          'Fundado en 1968 por el Dr. Juan Carlos Espina, nuestro estudio nació con la vocación de ofrecer un servicio legal de máxima calidad, especializado en los desafíos más complejos del derecho comercial. A lo largo de cinco décadas, hemos evolucionado, incorporando nuevas tecnologías y áreas de práctica, pero manteniendo siempre el rigor y la ética que nos definen. Hoy, bajo la dirección de la Dra. María Rawson, continuamos ese legado, fusionando la experiencia que nos dio origen con una visión de futuro para ofrecer soluciones jurídicas integrales y eficaces.',
        image:
          'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
        order: 2,
        isActive: true,
      },
    }),
    prisma.studioContent.create({
      data: {
        section: 'clients_intro',
        title: 'Confían en Nosotros',
        subtitle: 'Hemos tenido el privilegio de asesorar a empresas líderes',
        content:
          'Hemos tenido el privilegio de asesorar a empresas líderes en diversos sectores de la industria. Nuestra trayectoria y resultados hablan por sí mismos, estableciendo relaciones de confianza duraderas con nuestros clientes.',
        order: 3,
        isActive: true,
      },
    }),
    prisma.studioContent.create({
      data: {
        section: 'about_intro',
        title: 'Sobre Nosotros',
        subtitle:
          'El mayor activo de nuestra firma es el talento y la dedicación',
        content:
          'El mayor activo de nuestra firma es el talento y la dedicación de nuestros profesionales. Cada miembro del equipo aporta experiencia única y compromiso con la excelencia.',
        order: 4,
        isActive: true,
      },
    }),
    prisma.studioContent.create({
      data: {
        section: 'practice_intro',
        title: 'Áreas de Práctica',
        subtitle: 'Un enfoque multidisciplinario para soluciones integrales',
        content:
          'Un enfoque multidisciplinario para ofrecer soluciones integrales y estratégicas a los desafíos legales más exigentes. Nuestra experiencia abarca desde derecho concursal hasta fusiones y adquisiciones.',
        order: 5,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ ${studioContent.length} contenidos del estudio creados`);

  console.log('🎉 Seed del estudio completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
