import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SeedService } from './seeders/seed.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Establecer un prefijo global para las rutas
  app.setGlobalPrefix('api');
  
  // Habilitar CORS
  app.enableCors({
    origin: '*',  // Permitir solicitudes desde tu frontend en Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // Métodos permitidos
    credentials: true,  // Permitir envío de credenciales como cookies
  });
  
  // Usar pipes globales para la validación de datos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,  // Remover propiedades no deseadas
      forbidNonWhitelisted: true,  // Lanzar errores si se envían propiedades no permitidas
      transform: true,  // Transformar los datos de entrada a los tipos esperados
    }),
  );
  
  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Academic Service API')
    .setDescription('API para gestión de contexto académico - Materias, Planes de Estudio, Carreras')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  //  EJECUTAR SEEDERS
  const seedService = app.get(SeedService);
  await seedService.runAllSeeds();
 
  // Iniciar la aplicación en el puerto especificado o 3001 por defecto
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Academic Service running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/docs`);
}
bootstrap();