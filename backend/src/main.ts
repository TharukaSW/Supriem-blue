import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
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

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Supreme Blue ERP API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}

bootstrap();
