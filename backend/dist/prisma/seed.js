"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const roles = [
        { roleName: client_1.RoleName.ADMIN, idPrefix: 'SBA', description: 'System Administrator' },
        { roleName: client_1.RoleName.MANAGER, idPrefix: 'SBM', description: 'Factory / Sales Manager' },
        { roleName: client_1.RoleName.USER, idPrefix: 'SBL', description: 'Labour / Normal User' },
    ];
    for (const role of roles) {
        await prisma.role.upsert({
            where: { roleName: role.roleName },
            update: {},
            create: role,
        });
    }
    console.log('✅ Roles seeded');
    const adminRole = await prisma.role.findUnique({
        where: { roleName: client_1.RoleName.ADMIN },
    });
    if (!adminRole) {
        throw new Error('Admin role not found');
    }
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
                itemType: client_1.ItemType.RAW,
                categoryId: rawMaterialCategory.categoryId,
                unitId: pcsUnit.unitId,
                isActive: true,
            },
            {
                itemCode: 'RAW002',
                itemName: 'Bottle Cap (Blue)',
                itemType: client_1.ItemType.RAW,
                categoryId: rawMaterialCategory.categoryId,
                unitId: pcsUnit.unitId,
                isActive: true,
            },
            {
                itemCode: 'RAW003',
                itemName: 'Label Sticker (Supreme Blue)',
                itemType: client_1.ItemType.RAW,
                categoryId: rawMaterialCategory.categoryId,
                unitId: pcsUnit.unitId,
                isActive: true,
            },
            {
                itemCode: 'RAW004',
                itemName: 'Shrink Film Roll',
                itemType: client_1.ItemType.RAW,
                categoryId: rawMaterialCategory.categoryId,
                unitId: kgUnit.unitId,
                isActive: true,
            },
            {
                itemCode: 'RAW005',
                itemName: 'Water Treatment Chemical',
                itemType: client_1.ItemType.RAW,
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
                {
                    supplierId: supplier3.supplierId,
                    itemId: item5.itemId,
                    unitPrice: 850.00,
                    effectiveFrom: new Date('2025-01-01'),
                    isActive: true,
                },
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
//# sourceMappingURL=seed.js.map