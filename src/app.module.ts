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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración de Bull para colas
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0', 10),
      },
      defaultJobOptions: {
        attempts: parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS || '3', 10),
        backoff: {
          type: 'exponential',
          delay: parseInt(process.env.QUEUE_DEFAULT_DELAY || '1000', 10),
        },
        removeOnComplete: 50, // Mantener últimos 50 trabajos completados
        removeOnFail: 100,    // Mantener últimos 100 trabajos fallidos
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'dpg-d2jonlur433s7381srq0-a.oregon-postgres.render.com',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'topico_user',
      password: process.env.DATABASE_PASSWORD || 'Wu7LtwbqSbQy75NJDEhJOMoZ2smzZW3b',
      database: process.env.DATABASE_NAME || 'topico',
      entities: ['dist/**/*.entity{.ts,.js}'], // Buscar todas las entidades
      synchronize: process.env.NODE_ENV !== 'production',
      // Configuración SSL específica para Render
      ssl: process.env.DATABASE_SSL === 'true' ? {
        rejectUnauthorized: false
      } : false,
      logging: process.env.NODE_ENV === 'development',
      // Configuración adicional para conexiones externas
      extra: {
        connectionLimit: 10,
        acquireTimeoutMillis: 60000,
        timeout: 60000,
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
    QueueModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}