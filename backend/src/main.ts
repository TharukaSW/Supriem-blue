import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

// Fix BigInt serialization for JSON responses
// @ts-ignore
BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : '*',
    credentials: true,
  });

  // Serve static frontend files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(join(__dirname, '..', 'public')));
  }

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
  // const config = new DocumentBuilder()
  //   .setTitle('Supreme Blue ERP API')
  //   .setDescription('API documentation for Supreme Blue Water Bottling Factory ERP System')
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .addTag('Auth', 'Authentication endpoints')
  //   .addTag('Users', 'User management')
  //   .addTag('Masters', 'Master data (items, suppliers, customers)')
  //   .addTag('Purchasing', 'Purchase orders')
  //   .addTag('Sales', 'Sales orders and dispatch')
  //   .addTag('Production', 'Production management')
  //   .addTag('Finance', 'Expenses, payments, transactions')
  //   .addTag('Attendance & HR', 'Attendance and HR management')
  //   .addTag('Invoices', 'Invoice management and PDF generation')
  //   .addTag('Reports', 'Business reports and analytics')
  //   .build();

  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Supreme Blue ERP API running on port ${port}`);
  console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
  // console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}

bootstrap();
