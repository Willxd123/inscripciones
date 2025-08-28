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
import { DetalleModule } from './detalle/detalle.module';
import { SeedModule } from './seeders/seed.module';
import { AuthModule } from './auth/auth.module';

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
      autoLoadEntities: true,
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
    DetalleModule,
    SeedModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}