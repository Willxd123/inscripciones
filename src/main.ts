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
  const esModoTest = process.env.DISABLE_RATE_LIMIT === 'true';
  
  if (!esModoTest) {
    const limitador = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100000'),
      message: {
        error: 'Demasiadas peticiones desde esta IP',
        reintentar: 'Espera 1 minuto',
        limite: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100000'),
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (request) => {
        return request.url.includes('/admin/colas') || request.url.includes('/docs');
      },
    });
    
    app.use(limitador);
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
    const adaptadorServidor = new ExpressAdapter();
    adaptadorServidor.setBasePath('/admin/colas');
    
    // Leer colas hilos desde JSON
    const rutaConfig = path.join(process.cwd(), 'src', 'cola', 'cola-config.json');
    const config = JSON.parse(fs.readFileSync(rutaConfig, 'utf8'));
    
    // Obtener todas las colas Bull registradas
    const adaptadoresCola: any[] = [];
    
    for (const [nombre, _] of Object.entries(config.colasHilos)) {
      try {
        const cola = app.get<Queue>(`BullQueue_${nombre}`);
        adaptadoresCola.push(new BullMQAdapter(cola));
        console.log(`   ✅ Dashboard: ${nombre}`);
      } catch (error) {
        console.warn(`   ⚠️ Cola ${nombre} no disponible en dashboard`);
      }
    }
    
    if (adaptadoresCola.length > 0) {
      createBullBoard({
        queues: adaptadoresCola,
        serverAdapter: adaptadorServidor,
      });
      
      const expressApp = app.getHttpAdapter().getInstance();
      expressApp.use('/admin/colas', adaptadorServidor.getRouter());
      
      console.log(`📊 Bull Dashboard configurado con ${adaptadoresCola.length} colas`);
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
    console.log(`\n🚀 Academic Service v2.0 (COLAS HIJO DINÁMICAS)`);
    console.log(`📡 Puerto: ${port}`);
    console.log(`🔧 Entorno: ${process.env.NODE_ENV}`);
    console.log(`📊 Bull Dashboard: http://localhost:${port}/admin/colas`);
    
    // Leer y mostrar configuración de colas hilos
    try {
      const rutaConfig = path.join(process.cwd(), 'src', 'cola', 'cola-config.json');
      const config = JSON.parse(fs.readFileSync(rutaConfig, 'utf8'));
      
      console.log(`\n⚡ Colas Hilos Activas:`);
      Object.entries(config.colasHilos).forEach(([nombre, cfg]: any) => {
        const estado = cfg.hilos === 0 ? '⏸️ PAUSADA' : `▶️ ${cfg.hilos} workers`;
        console.log(`   - ${nombre}: ${estado} (${cfg.serviciosAsignados.join(', ')})`);
      });
      
      console.log(`\n💾 DB Pool size: ${process.env.DATABASE_POOL_MAX || '100'}`);
      console.log(`🚫 Rate limiting: ${esModoTest ? 'DISABLED' : 'ENABLED'}`);
      console.log(`\n📚 Documentación: http://localhost:${port}/docs`);
      console.log(`\n✨ Características:`);
      console.log(`   ✅ Colas Bull físicamente separadas`);
      console.log(`   ✅ Verdadero aislamiento por cola hilos`);
      console.log(`   ✅ Hilos 0 = Cola pausada (no procesa)`);
      console.log(`   ✅ Balanceador de carga inteligente`);
      console.log(`   ⚠️ Cambios estructurales requieren reinicio\n`);
    } catch (error) {
      console.warn('⚠️ No se pudo leer configuración de colas hilos');
    }
  });
}

bootstrap().catch((error) => {
  console.error('💥 Error starting application:', error);
  process.exit(1);
});