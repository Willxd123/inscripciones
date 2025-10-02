import { QueueModule } from './queue/queue.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ⚠️ YA NO USAR BullModule.forRoot() AQUÍ - Lo maneja QueueModule
    // Configuración TypeORM optimizada
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || '12345',
      database: process.env.DATABASE_NAME || 'inscripciones',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? {
              rejectUnauthorized: false,
            }
          : false,
      extra: {
        // POOL DE CONEXIONES OPTIMIZADO
        max: parseInt(process.env.DATABASE_POOL_MAX || '100', 10),
        min: parseInt(process.env.DATABASE_POOL_MIN || '20', 10),

        // TIMEOUTS OPTIMIZADOS
        acquireTimeoutMillis: parseInt(
          process.env.DB_ACQUIRE_TIMEOUT || '60000',
          10,
        ),
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
        idleTimeoutMillis: parseInt(
          process.env.DB_IDLE_TIMEOUT || '300000',
          10,
        ),
        reapIntervalMillis: 1000,
        createRetryIntervalMillis: 100,

        // CONFIGURACIONES DE RENDIMIENTO
        application_name: 'academic-service-high-load',
        statement_timeout: parseInt(
          process.env.DB_QUERY_TIMEOUT || '60000',
          10,
        ),
        query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '60000', 10),
        connectionTimeoutMillis: 30000,

        // OPTIMIZACIONES ADICIONALES
        keepConnectionAlive: true,
        maxRetriesPerRequest: 3,
      },
      // CONFIGURACIONES ADICIONALES PARA ALTA CARGA
      maxQueryExecutionTime: 30000,
      installExtensions: false,
      retryAttempts: 3,
      retryDelay: 1000,
    }),
    // Módulos de servicios
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
    DetalleInscripcionModule,
    // 🔥 NUEVO: QueueModule dinámico (debe ir después de los módulos de servicios)
    QueueModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}