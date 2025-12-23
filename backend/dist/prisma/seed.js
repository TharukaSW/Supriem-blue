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