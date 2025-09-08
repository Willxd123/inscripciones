// main.ts - Versión para desarrollo que ejecuta HTTP + Microservicio
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceModule } from './microservice.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeedService } from './seeders/seed.service';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  try {
    // CREAR APLICACIÓN HTTP
    const app = await NestFactory.create(AppModule);
    console.log('✅ HTTP Application created');

    // CREAR MICROSERVICIO EN EL MISMO PROCESO (para desarrollo local)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Creating microservice for local development...');
      
      const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(
        MicroserviceModule,
        {
          transport: Transport.RMQ,
          options: {
            urls: [
              process.env.RABBITMQ_URL ||
                'amqp://admin:admin123@localhost:5672/academic',
            ],
            queue: 'academic_queue',
            queueOptions: {
              durable: true,
            },
          },
        },
      );

      console.log('✅ Microservice created for local development');
      
      // INICIAR MICROSERVICIO
      await microservice.listen();
      console.log('🔄 Microservice started - RabbitMQ consumer active');
    }

    // Configurar aplicación HTTP
    app.setGlobalPrefix('api');
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger
    const config = new DocumentBuilder()
      .setTitle('Academic Service API')
      .setDescription('API para gestión de contexto académico')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Seeders
    const seedService = app.get(SeedService);
    await seedService.runAllSeeds();

    // INICIAR APLICACIÓN HTTP
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Academic Service running on port ${port}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Development mode: HTTP + Microservice running in same process');
    }
    
  } catch (error) {
    console.error('❌ Bootstrap error:', error);
    process.exit(1);
  }
}

bootstrap();