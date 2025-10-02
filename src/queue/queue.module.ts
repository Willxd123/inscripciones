import { ServiceLoadBalancerService } from './service-load-balancer.service';
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
import { QueueConfigService } from './queue-config.service';
import { QueueController } from './queue.controller';
import { AuthModule } from '../auth/auth.module';
import { GenericQueueProcessor } from './generic-queue.processor';
import { GenericWrapperService } from './generic-wrapper.service';
import { CarreraModule } from '../carrera/carrera.module';
import * as fs from 'fs';
import * as path from 'path';

@Global() // 🔥 NUEVO: Hacer el módulo global
@Module({})
export class QueueModule {
  static async forRoot(): Promise<DynamicModule> {
    const config = await QueueModule.loadWorkerQueuesConfig();

    const bullQueueModules = config.workerQueues.map((wq) => {
      return BullModule.registerQueue({
        name: wq.name,
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

    console.log(`📋 Registrando ${config.workerQueues.length} worker queues:`);
    config.workerQueues.forEach((wq) => {
      console.log(`   - ${wq.name} (${wq.concurrency} workers)`);
    });

    return {
      global: true, // 🔥 NUEVO: Módulo global
      module: QueueModule,
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
        ...bullQueueModules,
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
      controllers: [QueueController],
      providers: [
        QueueConfigService,
        GenericQueueProcessor,
        GenericWrapperService,
        ServiceLoadBalancerService,
      ],
      exports: [
        QueueConfigService,
        GenericWrapperService,
        ServiceLoadBalancerService,
        GenericQueueProcessor, // 🔥 NUEVO: Exportar también el processor
      ],
    };
  }

  private static async loadWorkerQueuesConfig() {
    const configPath = path.join(process.cwd(), 'src', 'queue', 'queue-config.json');

    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configContent);

      return {
        workerQueues: Object.entries(config.workerQueues).map(([name, cfg]: any) => ({
          name,
          concurrency: cfg.concurrency,
          assignedServices: cfg.assignedServices,
          enabled: cfg.enabled,
        })),
      };
    } catch (error) {
      console.warn('⚠️ No se pudo cargar queue-config.json, usando configuración por defecto');
      return {
        workerQueues: [
          {
            name: 'worker-queue-1',
            concurrency: 1,
            assignedServices: ['carrera', 'estudiante', 'inscripcion'],
            enabled: true,
          },
          {
            name: 'worker-queue-2',
            concurrency: 1,
            assignedServices: ['*'],
            enabled: true,
          },
        ],
      };
    }
  }
}