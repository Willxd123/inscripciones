import { QueueModule } from './queue/queue.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { CarreraModule } from './carrera/carrera.module';
import { PlanEstudioModule } from './plan-estudio/plan-estudio.module';
import { NivelModule } from './nivel/nivel.module';
import { MateriaModule } from './materia/materia.module';
import { PrerequisitoModule } from './prerequisito/prerequisito.module';
import { GrupoModule } from './grupo/grupo.module';
import { GrupoMateriaModule } from './grupo-materia/grupo-materia.module';
import { DocenteModule } from './docente/docente.module';
import { HorarioModule } from './horario/horario.module';
import { AulaModule } from './aula/aula.module';
import { ModuloModule } from './modulo/modulo.module';
import { EstudianteModule } from './estudiante/estudiante.module';
import { InscripcionModule } from './inscripcion/inscripcion.module';
import { NotaModule } from './nota/nota.module';
import { PeriodoModule } from './periodo/periodo.module';
import { GestionModule } from './gestion/gestion.module';
import { BoletaHorarioModule } from './boleta-horario/boleta-horario.module';
import { SeedModule } from './seeders/seed.module';
import { AuthModule } from './auth/auth.module';
import { DetalleInscripcionModule } from './detalle-inscripcion/detalle-inscripcion.module';

// Función helper para manejar retención configurable
function parseRetentionValue(envValue: string | undefined, defaultValue: number): number | false {
  if (!envValue) return defaultValue;
  if (envValue.toLowerCase() === 'false') return false;
  const parsed = parseInt(envValue, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración Bull SIMPLIFICADA que funciona correctamente
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
      },
      defaultJobOptions: {
        attempts: parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS || '2', 10),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.QUEUE_DEFAULT_DELAY || '1000', 10),
        },
        removeOnComplete: parseRetentionValue(process.env.QUEUE_COMPLETED_RETENTION, 100),
        removeOnFail: parseRetentionValue(process.env.QUEUE_FAILED_RETENTION, 50),
      },
    }),
    // Configuración TypeORM optimizada
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '12345',
      database: process.env.DATABASE_NAME || 'inscripciones',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
      ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      extra: {
        max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
        min: parseInt(process.env.DATABASE_POOL_MIN || '5', 10),
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 200,
        application_name: 'academic-service-high-load',
        statement_timeout: 30000,
        query_timeout: 30000,
        connectionTimeoutMillis: 10000,
      },
    }),
    CarreraModule,
    PlanEstudioModule,
    NivelModule,
    MateriaModule,
    PrerequisitoModule,
    GrupoModule,
    GrupoMateriaModule,
    DocenteModule,
    HorarioModule,
    AulaModule,
    ModuloModule,
    EstudianteModule,
    InscripcionModule,
    NotaModule,
    PeriodoModule,
    GestionModule,
    BoletaHorarioModule,
    SeedModule,
    AuthModule,
    QueueModule,
    DetalleInscripcionModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}