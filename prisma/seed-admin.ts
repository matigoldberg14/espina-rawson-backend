import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('🔐 Creando usuario administrador...');

  // Verificar si ya existe un admin
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@espinarawson.com' }
  });

  if (existingAdmin) {
    console.log('✅ Usuario administrador ya existe');
    console.log('📧 Email:', existingAdmin.email);
    return;
  }

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash('admin123456', 12);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@espinarawson.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN',
      isActive: true,
    }
  });

  console.log('✅ Usuario administrador creado exitosamente!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Password: admin123456');
  console.log('👤 Role:', admin.role);
}

createAdminUser()
  .catch((e) => {
    console.error('❌ Error creando usuario administrador:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
