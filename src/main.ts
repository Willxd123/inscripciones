import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeedService } from './seeders/seed.service';

// Imports para Bull Dashboard
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';

// CRÍTICO: Rate limiting para 100k peticiones
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
const compression = require('compression');
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['error', 'warn', 'log'], 
  });
  
  // SEGURIDAD: Helmet para headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  
  // COMPRESIÓN: Para reducir tamaño de respuestas
  app.use(compression());
  
  // ⚠️ RATE LIMITING DESHABILITADO PARA PRUEBAS MASIVAS
  const isTestMode = process.env.DISABLE_RATE_LIMIT === 'true';
  
  if (!isTestMode) {
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100000'),
      message: {
        error: 'Demasiadas peticiones desde esta IP',
        retryAfter: 'Espera 1 minuto',
        limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100000'),
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (request) => {
        return request.url.includes('/admin/queues') || request.url.includes('/docs');
      },
    });
    
    app.use(limiter);
    console.log(`⚠️ Rate limiting ACTIVO: ${process.env.RATE_LIMIT_MAX_REQUESTS || '100000'} req/min`);
  } else {
    console.log('🚫 Rate limiting DESHABILITADO para pruebas');
  }
  
  // Establecer un prefijo global para las rutas
  app.setGlobalPrefix('api');
  
  // CORS optimizado para alta carga
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    maxAge: 86400,
  });
  
  // Pipes globales OPTIMIZADOS
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      validateCustomDecorators: true,
    }),
  );
  
  // CONFIGURACIÓN DE BULL DASHBOARD CON COLAS DINÁMICAS
  try {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    
    // Leer worker queues desde JSON
    const configPath = path.join(process.cwd(), 'src', 'queue', 'queue-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Obtener todas las colas Bull registradas
    const queueAdapters: any[] = [];
    
    for (const [name, _] of Object.entries(config.workerQueues)) {
      try {
        const queue = app.get<Queue>(`BullQueue_${name}`);
        queueAdapters.push(new BullMQAdapter(queue));
        console.log(`   ✅ Dashboard: ${name}`);
      } catch (error) {
        console.warn(`   ⚠️ Cola ${name} no disponible en dashboard`);
      }
    }
    
    if (queueAdapters.length > 0) {
      createBullBoard({
        queues: queueAdapters,
        serverAdapter: serverAdapter,
      });
      
      const expressApp = app.getHttpAdapter().getInstance();
      expressApp.use('/admin/queues', serverAdapter.getRouter());
      
      console.log(`📊 Bull Dashboard configurado con ${queueAdapters.length} colas`);
    } else {
      console.warn('⚠️ Bull Dashboard: No hay colas disponibles');
    }
  } catch (error) {
    console.warn('⚠️ Bull Dashboard no se pudo configurar:', error.message);
  }
  
  // Configuración de Swagger (deshabilitado para pruebas)
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Academic Service API')
      .setDescription('API para gestión de contexto académico - Colas Dinámicas con Aislamiento')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }
  
  // SEEDERS DESHABILITADOS PARA PRUEBAS DE CARGA
  if (process.env.RUN_SEEDS === 'true') {
    try {
      const seedService = app.get(SeedService);
      await seedService.runAllSeeds();
      console.log('✅ Seeders ejecutados exitosamente');
    } catch (error) {
      console.error('❌ Error en seeders:', error.message);
    }
  }
  
  // Configuraciones del servidor para alta carga
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  
  await app.listen(port, '0.0.0.0', () => {
    console.log(`\n🚀 Academic Service v2.0 (DYNAMIC WORKER QUEUES)`);
    console.log(`📡 Port: ${port}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
    console.log(`📊 Bull Dashboard: http://localhost:${port}/admin/queues`);
    
    // Leer y mostrar configuración de worker queues
    try {
      const configPath = path.join(process.cwd(), 'src', 'queue', 'queue-config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      console.log(`\n⚡ Worker Queues Activas:`);
      Object.entries(config.workerQueues).forEach(([name, cfg]: any) => {
        const status = cfg.concurrency === 0 ? '⏸️ PAUSADA' : `▶️ ${cfg.concurrency} workers`;
        console.log(`   - ${name}: ${status} (${cfg.assignedServices.join(', ')})`);
      });
      
      console.log(`\n💾 DB Pool size: ${process.env.DATABASE_POOL_MAX || '100'}`);
      console.log(`🚫 Rate limiting: ${isTestMode ? 'DISABLED' : 'ENABLED'}`);
      console.log(`\n📚 Documentación: http://localhost:${port}/docs`);
      console.log(`\n✨ Características:`);
      console.log(`   ✅ Colas Bull físicamente separadas`);
      console.log(`   ✅ Verdadero aislamiento por worker queue`);
      console.log(`   ✅ Concurrencia 0 = Cola pausada (no procesa)`);
      console.log(`   ✅ Load balancer inteligente`);
      console.log(`   ⚠️ Cambios estructurales requieren reinicio\n`);
    } catch (error) {
      console.warn('⚠️ No se pudo leer configuración de worker queues');
    }
  });
}

bootstrap().catch((error) => {
  console.error('💥 Error starting application:', error);
  process.exit(1);
});