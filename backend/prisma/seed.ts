import { PrismaClient, RoleName, ItemType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

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

  // Seed sample suppliers
  const suppliers = [
    {
      supplierCode: 'SUP001',
      supplierName: 'Lanka Plastics (Pvt) Ltd',
      contactName: 'Rajitha Fernando',
      phone: '0112345678',
      email: 'info@lankaplastics.lk',
      address: 'No. 123, Galle Road, Colombo 03',
      isActive: true,
    },
    {
      supplierCode: 'SUP002',
      supplierName: 'Ceylon Cap Manufacturing',
      contactName: 'Nimal Perera',
      phone: '0114567890',
      email: 'sales@ceyloncaps.lk',
      address: 'Industrial Zone, Ja-Ela',
      isActive: true,
    },
    {
      supplierCode: 'SUP003',
      supplierName: 'Pure Water Chemicals Ltd',
      contactName: 'Sunil Wijeratne',
      phone: '0117654321',
      email: 'contact@purewater.lk',
      address: 'No. 45, Baseline Road, Colombo 09',
      isActive: true,
    },
  ];

  for (const supplier of suppliers) {
    await prisma.supplier.upsert({
      where: { supplierCode: supplier.supplierCode },
      update: {},
      create: supplier,
    });
  }

  console.log('✅ Suppliers seeded');

  // Seed sample items (RAW materials for bottling)
  const rawMaterialCategory = await prisma.itemCategory.findUnique({
    where: { categoryName: 'Raw Materials' },
  });

  const pcsUnit = await prisma.unit.findUnique({
    where: { unitName: 'Pieces' },
  });

  const kgUnit = await prisma.unit.findUnique({
    where: { unitName: 'Kilograms' },
  });

  if (rawMaterialCategory && pcsUnit && kgUnit) {
    const items = [
      {
        itemCode: 'RAW001',
        itemName: 'PET Bottle 500ml (Clear)',
        itemType: ItemType.RAW,
        categoryId: rawMaterialCategory.categoryId,
        unitId: pcsUnit.unitId,
        isActive: true,
      },
      {
        itemCode: 'RAW002',
        itemName: 'Bottle Cap (Blue)',
        itemType: ItemType.RAW,
        categoryId: rawMaterialCategory.categoryId,
        unitId: pcsUnit.unitId,
        isActive: true,
      },
      {
        itemCode: 'RAW003',
        itemName: 'Label Sticker (Supreme Blue)',
        itemType: ItemType.RAW,
        categoryId: rawMaterialCategory.categoryId,
        unitId: pcsUnit.unitId,
        isActive: true,
      },
      {
        itemCode: 'RAW004',
        itemName: 'Shrink Film Roll',
        itemType: ItemType.RAW,
        categoryId: rawMaterialCategory.categoryId,
        unitId: kgUnit.unitId,
        isActive: true,
      },
      {
        itemCode: 'RAW005',
        itemName: 'Water Treatment Chemical',
        itemType: ItemType.RAW,
        categoryId: rawMaterialCategory.categoryId,
        unitId: kgUnit.unitId,
        isActive: true,
      },
    ];

    for (const item of items) {
      await prisma.item.upsert({
        where: { itemCode: item.itemCode },
        update: {},
        create: item,
      });
    }

    console.log('✅ Sample RAW items seeded');

    // Seed supplier prices
    const supplier1 = await prisma.supplier.findUnique({
      where: { supplierCode: 'SUP001' },
    });

    const supplier2 = await prisma.supplier.findUnique({
      where: { supplierCode: 'SUP002' },
    });

    const supplier3 = await prisma.supplier.findUnique({
      where: { supplierCode: 'SUP003' },
    });

    const item1 = await prisma.item.findUnique({
      where: { itemCode: 'RAW001' },
    });

    const item2 = await prisma.item.findUnique({
      where: { itemCode: 'RAW002' },
    });

    const item3 = await prisma.item.findUnique({
      where: { itemCode: 'RAW003' },
    });

    const item4 = await prisma.item.findUnique({
      where: { itemCode: 'RAW004' },
    });

    const item5 = await prisma.item.findUnique({
      where: { itemCode: 'RAW005' },
    });

    if (supplier1 && supplier2 && supplier3 && item1 && item2 && item3 && item4 && item5) {
      const prices = [
        // Supplier 1 prices
        {
          supplierId: supplier1.supplierId,
          itemId: item1.itemId,
          unitPrice: 12.50,
          effectiveFrom: new Date('2025-01-01'),
          isActive: true,
        },
        {
          supplierId: supplier1.supplierId,
          itemId: item4.itemId,
          unitPrice: 450.00,
          effectiveFrom: new Date('2025-01-01'),
          isActive: true,
        },
        // Supplier 2 prices
        {
          supplierId: supplier2.supplierId,
          itemId: item2.itemId,
          unitPrice: 2.50,
          effectiveFrom: new Date('2025-01-01'),
          isActive: true,
        },
        {
          supplierId: supplier2.supplierId,
          itemId: item3.itemId,
          unitPrice: 5.00,
          effectiveFrom: new Date('2025-01-01'),
          isActive: true,
        },
        // Supplier 3 prices
        {
          supplierId: supplier3.supplierId,
          itemId: item5.itemId,
          unitPrice: 850.00,
          effectiveFrom: new Date('2025-01-01'),
          isActive: true,
        },
        // Different price for same item from different supplier
        {
          supplierId: supplier1.supplierId,
          itemId: item1.itemId,
          unitPrice: 11.75,
          effectiveFrom: new Date('2025-12-01'),
          isActive: true,
        },
      ];

      for (const price of prices) {
        const existing = await prisma.supplierItemPrice.findUnique({
          where: {
            supplierId_itemId_effectiveFrom: {
              supplierId: price.supplierId,
              itemId: price.itemId,
              effectiveFrom: price.effectiveFrom,
            },
          },
        });

        if (!existing) {
          await prisma.supplierItemPrice.create({
            data: price,
          });
        }
      }

      console.log('✅ Supplier prices seeded');
    }
  }

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
