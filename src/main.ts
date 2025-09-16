import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeedService } from './seeders/seed.service';

// Imports para Bull Dashboard
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';

// CRÍTICO: Rate limiting para 100k peticiones
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Configuraciones para alto rendimiento
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'debug', 'error', 'verbose', 'warn'],
  });
  
  // SEGURIDAD: Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: false, // Deshabilitar CSP para desarrollo
  }));
  
  // COMPRESIÓN: Para reducir tamaño de respuestas
  app.use(compression());
  
  // RATE LIMITING CRÍTICO para 100k peticiones
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minuto
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),    // 1000 req/min por IP
    message: {
      error: 'Demasiadas peticiones desde esta IP',
      retryAfter: 'Espera 1 minuto',
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'),
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Excluir ciertos endpoints del rate limiting
    skip: (request) => {
      return request.url.includes('/admin/queues') || request.url.includes('/docs');
    },
  });
  
  app.use(limiter);
  
  // Establecer un prefijo global para las rutas
  app.setGlobalPrefix('api');
  
  // CORS optimizado para alta carga
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    maxAge: 86400, // 24 horas de cache para preflight
  });
  
  // Pipes globales OPTIMIZADOS
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // Optimizaciones para alto rendimiento:
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
    }),
  );
  
  // CONFIGURACIÓN DE BULL DASHBOARD
  try {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    
    const genericQueue = app.get<Queue>('BullQueue_generic-queue');
    
    createBullBoard({
      queues: [new BullAdapter(genericQueue)],
      serverAdapter: serverAdapter,
    });
    
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use('/admin/queues', serverAdapter.getRouter());
    
    console.log(`📊 Bull Dashboard configurado correctamente`);
  } catch (error) {
    console.warn('⚠️ Bull Dashboard no se pudo configurar:', error.message);
  }
  
  // Configuración de Swagger (solo en desarrollo)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Academic Service API')
      .setDescription('API para gestión de contexto académico - Optimizado para 100k peticiones')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
  
  // EJECUTAR SEEDERS (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    try {
      const seedService = app.get(SeedService);
      await seedService.runAllSeeds();
    } catch (error) {
      console.warn('⚠️ Seeders no ejecutados:', error.message);
    }
  }
  
  // Configuraciones del servidor para alta carga
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  await app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Academic Service (High Performance Mode)`);
    console.log(`📡 Port: ${port}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Bull Dashboard: http://localhost:${port}/admin/queues`);
    console.log(`📝 Max requests per minute: ${process.env.RATE_LIMIT_MAX_REQUESTS || '1000'}`);
    console.log(`⚡ Queue concurrency: ${process.env.QUEUE_CONCURRENCY || '5'}`);
    console.log(`💾 DB Pool size: ${process.env.DATABASE_POOL_MAX || '20'}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
    }
  });
}

bootstrap().catch((error) => {
  console.error('💥 Error starting application:', error);
  process.exit(1);
});