import { PlanEstudio } from './plan-estudio/entities/plan-estudio.entity';
import { Carrera } from './carrera/entities/carrera.entity';
// microservice.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueConsumer } from './workers/queue.consumer';
import { UniversalWorker } from './workers/universal.worker';
import { StatusService } from './queues/status.service';
import { CarreraModule } from './carrera/carrera.module';
import { ServiceRegistryService } from './queues/service-registry.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'dpg-d2jonlur433s7381srq0-a.oregon-postgres.render.com',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'topico_user',
      password: process.env.DATABASE_PASSWORD || 'Wu7LtwbqSbQy75NJDEhJOMoZ2smzZW3b',
      database: process.env.DATABASE_NAME || 'topico',
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      logging: false, // Desactivar logs en microservicio
    }),
    CarreraModule, // Incluir los módulos necesarios
  ],
  providers: [
    QueueConsumer,
    UniversalWorker,
    StatusService,
    ServiceRegistryService,
  ],
})
export class MicroserviceModule {
  constructor() {
    console.log('🔧 MicroserviceModule constructor called');
  }
}