import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed roles
  const roles = [
    { roleName: RoleName.ADMIN, idPrefix: 'SBA', description: 'System Administrator' },
    { roleName: RoleName.MANAGER, idPrefix: 'SBM', description: 'Factory / Sales Manager' },
    { roleName: RoleName.USER, idPrefix: 'SBL', description: 'Labour / Normal User' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { roleName: role.roleName },
      update: {},
      create: role,
    });
  }

  console.log('✅ Roles seeded');

  // Get admin role
  const adminRole = await prisma.role.findUnique({
    where: { roleName: RoleName.ADMIN },
  });

  if (!adminRole) {
    throw new Error('Admin role not found');
  }

  // Create admin user
  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await prisma.user.upsert({
    where: { userCode: 'SBA001' },
    update: {},
    create: {
      userCode: 'SBA001',
      roleId: adminRole.roleId,
      fullName: 'System Administrator',
      username: 'admin',
      email: 'admin@supremeblue.lk',
      passwordHash,
      isActive: true,
    },
  });

  console.log('✅ Admin user seeded (SBA001 / Admin@123)');

  // Seed some units
  const units = [
    { unitName: 'Pieces', symbol: 'pcs' },
    { unitName: 'Liters', symbol: 'L' },
    { unitName: 'Bottles', symbol: 'btl' },
    { unitName: 'Cartons', symbol: 'ctn' },
    { unitName: 'Kilograms', symbol: 'kg' },
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { unitName: unit.unitName },
      update: {},
      create: unit,
    });
  }

  console.log('✅ Units seeded');

  // Seed some item categories
  const categories = [
    { categoryName: 'Raw Materials' },
    { categoryName: 'Finished Products' },
    { categoryName: 'Packaging' },
    { categoryName: 'Chemicals' },
  ];

  for (const category of categories) {
    await prisma.itemCategory.upsert({
      where: { categoryName: category.categoryName },
      update: {},
      create: category,
    });
  }

  console.log('✅ Item categories seeded');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
