import { BalanceadorCargaService } from './balanceador-carga.service';
import { DetalleInscripcionModule } from './../detalle-inscripcion/detalle-inscripcion.module';
import { BoletaHorarioModule } from './../boleta-horario/boleta-horario.module';
import { GestionModule } from './../gestion/gestion.module';
import { PeriodoModule } from './../periodo/periodo.module';
import { NotaModule } from './../nota/nota.module';
import { InscripcionModule } from './../inscripcion/inscripcion.module';
import { ModuloModule } from './../modulo/modulo.module';
import { AulaModule } from './../aula/aula.module';
import { HorarioModule } from './../horario/horario.module';
import { DocenteModule } from './../docente/docente.module';
import { GrupoMateriaModule } from './../grupo-materia/grupo-materia.module';
import { GrupoModule } from './../grupo/grupo.module';
import { PrerequisitoModule } from './../prerequisito/prerequisito.module';
import { MateriaModule } from './../materia/materia.module';
import { NivelModule } from './../nivel/nivel.module';
import { EstudianteModule } from './../estudiante/estudiante.module';
import { PlanEstudioModule } from '../plan-estudio/plan-estudio.module';
import { Module, forwardRef, DynamicModule, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ColaConfigService } from './cola-config.service';
import { ColaController } from './cola.controller';
import { AuthModule } from '../auth/auth.module';
import { ProcesadorColaGenerica } from './procesador-cola-generica.processor';
import { EnvolventeGenericaService } from './envolvente-generica.service';
import { CarreraModule } from '../carrera/carrera.module';
import * as fs from 'fs';
import * as path from 'path';

@Global()
@Module({})
export class ColaModule {
  static async forRoot(): Promise<DynamicModule> {
    const config = await ColaModule.cargarConfigColasHilos();

    const modulosColas = config.colasHilos.map((ch) => {
      return BullModule.registerQueue({
        name: ch.nombre,
        defaultJobOptions: {
          removeOnComplete: false,
          removeOnFail: false,
          attempts: parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS || '2'),
          backoff: {
            type: 'exponential',
            delay: parseInt(process.env.QUEUE_DEFAULT_DELAY || '1000'),
          },
        },
      });
    });

    console.log(`📋 Registrando ${config.colasHilos.length} colas hilos:`);
    config.colasHilos.forEach((ch) => {
      console.log(`   - ${ch.nombre} (${ch.hilos} workers)`);
    });

    return {
      global: true,
      module: ColaModule,
      imports: [
        BullModule.forRoot({
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
            password: process.env.REDIS_PASSWORD || undefined,
            db: parseInt(process.env.REDIS_DB || '0', 10),
          },
          defaultJobOptions: {
            attempts: parseInt(process.env.QUEUE_DEFAULT_ATTEMPTS || '2'),
            backoff: {
              type: 'exponential',
              delay: parseInt(process.env.QUEUE_DEFAULT_DELAY || '1000'),
            },
            removeOnComplete: false,
            removeOnFail: false,
          },
        }),
        ...modulosColas,
        forwardRef(() => AuthModule),
        forwardRef(() => CarreraModule),
        forwardRef(() => PlanEstudioModule),
        forwardRef(() => EstudianteModule),
        forwardRef(() => NivelModule),
        forwardRef(() => MateriaModule),
        forwardRef(() => PrerequisitoModule),
        forwardRef(() => GrupoModule),
        forwardRef(() => GrupoMateriaModule),
        forwardRef(() => DocenteModule),
        forwardRef(() => HorarioModule),
        forwardRef(() => AulaModule),
        forwardRef(() => ModuloModule),
        forwardRef(() => InscripcionModule),
        forwardRef(() => NotaModule),
        forwardRef(() => PeriodoModule),
        forwardRef(() => GestionModule),
        forwardRef(() => BoletaHorarioModule),
        forwardRef(() => DetalleInscripcionModule),
      ],
      controllers: [ColaController],
      providers: [
        ColaConfigService,
        ProcesadorColaGenerica,
        EnvolventeGenericaService,
        BalanceadorCargaService,
      ],
      exports: [
        ColaConfigService,
        EnvolventeGenericaService,
        BalanceadorCargaService,
        ProcesadorColaGenerica,
      ],
    };
  }

  private static async cargarConfigColasHilos() {
    const rutaConfig = path.join(process.cwd(), 'src', 'cola', 'cola-config.json');

    try {
      const contenidoConfig = fs.readFileSync(rutaConfig, 'utf8');
      const config = JSON.parse(contenidoConfig);

      return {
        colasHilos: Object.entries(config.colasHilos).map(([nombre, cfg]: any) => ({
          nombre,
          hilos: cfg.hilos,
          serviciosAsignados: cfg.serviciosAsignados,
          habilitada: cfg.habilitada,
        })),
      };
    } catch (error) {
      console.warn('⚠️ No se pudo cargar cola-config.json, usando configuración por defecto');
      return {
        colasHilos: [
          {
            nombre: 'cola-hilos-1',
            hilos: 1,
            serviciosAsignados: ['carrera', 'estudiante', 'inscripcion'],
            habilitada: true,
          },
          {
            nombre: 'cola-hilos-2',
            hilos: 1,
            serviciosAsignados: ['*'],
            habilitada: true,
          },
        ],
      };
    }
  }
}