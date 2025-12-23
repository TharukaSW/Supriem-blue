"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: ['http://localhost:4200', 'http://localhost:3000'],
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Supreme Blue ERP API')
        .setDescription('API documentation for Supreme Blue Water Bottling Factory ERP System')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Users', 'User management')
        .addTag('Masters', 'Master data (items, suppliers, customers)')
        .addTag('Purchasing', 'Purchase orders')
        .addTag('Sales', 'Sales orders and dispatch')
        .addTag('Production', 'Production management')
        .addTag('Finance', 'Expenses, payments, transactions')
        .addTag('Attendance & HR', 'Attendance and HR management')
        .addTag('Invoices', 'Invoice management and PDF generation')
        .addTag('Reports', 'Business reports and analytics')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Supreme Blue ERP API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map