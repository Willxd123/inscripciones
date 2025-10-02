import { ServiceLoadBalancerService } from './service-load-balancer.service';
import { DetalleInscripcionService } from './../detalle-inscripcion/detalle-inscripcion.service';
import { PrerequisitoService } from './../prerequisito/prerequisito.service';
import { PeriodoService } from './../periodo/periodo.service';
import { NotaService } from './../nota/nota.service';
import { NivelService } from './../nivel/nivel.service';
import { ModuloService } from './../modulo/modulo.service';
import { MateriaService } from './../materia/materia.service';
import { HorarioService } from './../horario/horario.service';
import { GrupoMateriaService } from './../grupo-materia/grupo-materia.service';
import { GrupoService } from './../grupo/grupo.service';
import { GestionService } from './../gestion/gestion.service';
import { DocenteService } from './../docente/docente.service';
import { BoletaHorarioService } from './../boleta-horario/boleta-horario.service';
import { AulaService } from './../aula/aula.service';
import { InscripcionService } from './../inscripcion/inscripcion.service';
import { EstudianteService } from './../estudiante/estudiante.service';
import { PlanEstudioService } from './../plan-estudio/plan-estudio.service';
import { CarreraService } from './../carrera/carrera.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { QueueConfigService } from './queue-config.service';
import { GenericQueueProcessor } from './generic-queue.processor';
import { randomUUID } from 'crypto';

@Injectable()
export class GenericWrapperService {
  private readonly logger = new Logger(GenericWrapperService.name);
  private readonly serviceRegistry: Map<string, any> = new Map();

  constructor(
    private readonly queueConfigService: QueueConfigService,
    private readonly serviceLoadBalancerService: ServiceLoadBalancerService,
    private readonly genericQueueProcessor: GenericQueueProcessor,
    @Inject(CarreraService) private readonly carreraService: CarreraService,
    @Inject(PlanEstudioService)
    private readonly planEstudioService: PlanEstudioService,
    @Inject(EstudianteService)
    private readonly estudianteService: EstudianteService,
    @Inject(InscripcionService)
    private readonly inscripcionService: InscripcionService,
    @Inject(AulaService) private readonly aulaService: AulaService,
    @Inject(BoletaHorarioService)
    private readonly boletaHorarioService: BoletaHorarioService,
    @Inject(DocenteService) private readonly docenteService: DocenteService,
    @Inject(GestionService) private readonly gestionService: GestionService,
    @Inject(GrupoService) private readonly grupoService: GrupoService,
    @Inject(GrupoMateriaService)
    private readonly grupoMateriaService: GrupoMateriaService,
    @Inject(HorarioService) private readonly horarioService: HorarioService,
    @Inject(MateriaService) private readonly materiaService: MateriaService,
    @Inject(ModuloService) private readonly moduloService: ModuloService,
    @Inject(NivelService) private readonly nivelService: NivelService,
    @Inject(NotaService) private readonly notaService: NotaService,
    @Inject(PeriodoService) private readonly periodoService: PeriodoService,
    @Inject(PrerequisitoService)
    private readonly prerequisitoService: PrerequisitoService,
    @Inject(DetalleInscripcionService)
    private readonly detalleInscripcionService: DetalleInscripcionService,
  ) {
    this.serviceRegistry.set('carrera', this.carreraService);
    this.serviceRegistry.set('plan-estudio', this.planEstudioService);
    this.serviceRegistry.set('estudiante', this.estudianteService);
    this.serviceRegistry.set('inscripcion', this.inscripcionService);
    this.serviceRegistry.set('aula', this.aulaService);
    this.serviceRegistry.set('boleta-horario', this.boletaHorarioService);
    this.serviceRegistry.set('docente', this.docenteService);
    this.serviceRegistry.set('gestion', this.gestionService);
    this.serviceRegistry.set('grupo', this.grupoService);
    this.serviceRegistry.set('grupo-materia', this.grupoMateriaService);
    this.serviceRegistry.set('horario', this.horarioService);
    this.serviceRegistry.set('materia', this.materiaService);
    this.serviceRegistry.set('modulo', this.moduloService);
    this.serviceRegistry.set('nivel', this.nivelService);
    this.serviceRegistry.set('nota', this.notaService);
    this.serviceRegistry.set('periodo', this.periodoService);
    this.serviceRegistry.set('prerequisito', this.prerequisitoService);
    this.serviceRegistry.set(
      'detalle-inscripcion',
      this.detalleInscripcionService,
    );
  }

  createServiceWrapper(serviceName: string) {
    return {
      create: (createDto: any) => this.handleCreate(serviceName, createDto),
      findAll: () => this.handleFindAll(serviceName),
      findOne: (id: number) => this.handleFindOne(serviceName, id),
      update: (id: number, updateDto: any) =>
        this.handleUpdate(serviceName, id, updateDto),
      remove: (id: number) => this.handleRemove(serviceName, id),
    };
  }

  private async handleCreate(serviceName: string, createDto: any) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (!shouldUseQueue) {
      return await this.getService(serviceName).create(createDto);
    }

    const assignment =
      await this.serviceLoadBalancerService.selectWorkerQueue(serviceName);

      if (!assignment) {
        return {
          error: 'No hay worker queues disponibles',
          message: `El servicio ${serviceName} está configurado para usar colas pero no hay worker queues activas que puedan atenderlo`,
          serviceName,
          suggestion: 'Crear worker queue con ese servicio asignado o cambiar servicio a modo síncrono: POST /api/queue/config',
        };
      }

    const queue = this.genericQueueProcessor.getQueue(
      assignment.workerQueueName,
    );
    if (!queue) {
      return {
        error: 'Cola no registrada',
        workerQueue: assignment.workerQueueName,
        suggestion: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const jobId = randomUUID();
    await queue.add(
      'job-name', // BullMQ requiere nombre del job como primer parámetro
      {
        serviceName,
        operation: 'create',
        data: createDto,
        workerQueueName: assignment.workerQueueName,
      },
      { jobId },
    );

    // Obtener info de concurrencia DESPUÉS de encolar
    const workerQueueConfig =
      await this.queueConfigService.getWorkerQueueConfig(
        assignment.workerQueueName,
      );
    const status =
      workerQueueConfig.workerQueueConcurrency === 0
        ? 'queued (paused)'
        : 'processing';

    this.logger.log(
      `CREATE encolado: ${serviceName} → [${assignment.workerQueueName}] - Job: ${jobId} - Status: ${status}`,
    );

    return {
      message: `${serviceName} encolado`,
      jobId,
      workerQueue: assignment.workerQueueName,
      concurrency: workerQueueConfig.workerQueueConcurrency,
      status,
      statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      note:
        workerQueueConfig.workerQueueConcurrency === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la concurrencia'
          : undefined,
    };
  }
  private async handleFindAll(serviceName: string) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);
    if (!shouldUseQueue) {
      return await this.getService(serviceName).findAll();
    }

    const assignment =
      await this.serviceLoadBalancerService.selectWorkerQueue(serviceName);
    if (!assignment) {
      this.logger.warn(
        `No worker queues para ${serviceName}, ejecutando síncronamente`,
      );
      return await this.getService(serviceName).findAll();
    }

    const queue = this.genericQueueProcessor.getQueue(
      assignment.workerQueueName,
    );
    if (!queue) {
      return {
        error: 'Cola no registrada',
        workerQueue: assignment.workerQueueName,
        suggestion: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const jobId = randomUUID();
    await queue.add(
      'job-name',
      {
        serviceName,
        operation: 'find-all',
        workerQueueName: assignment.workerQueueName,
      },
      { jobId },
    );

    const workerQueueConfig =
      await this.queueConfigService.getWorkerQueueConfig(
        assignment.workerQueueName,
      );
    const status =
      workerQueueConfig.workerQueueConcurrency === 0
        ? 'queued (paused)'
        : 'processing';

    this.logger.log(
      `FIND_ALL encolado: ${serviceName} → [${assignment.workerQueueName}] - Job: ${jobId} - Status: ${status}`,
    );

    return {
      message: `${serviceName} encolado`,
      jobId,
      workerQueue: assignment.workerQueueName,
      concurrency: workerQueueConfig.workerQueueConcurrency,
      status,
      statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      note:
        workerQueueConfig.workerQueueConcurrency === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la concurrencia'
          : undefined,
    };
  }

  private async handleFindOne(serviceName: string, id: number) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);
    if (!shouldUseQueue) {
      return await this.getService(serviceName).findOne(id);
    }

    const assignment =
      await this.serviceLoadBalancerService.selectWorkerQueue(serviceName);
      if (!assignment) {
        return {
          error: 'No hay worker queues disponibles',
          message: `El servicio ${serviceName} está configurado para usar colas pero no hay worker queues activas que puedan atenderlo`,
          serviceName,
          suggestion: 'Crear worker queue con ese servicio asignado o cambiar servicio a modo síncrono: POST /api/queue/config',
        };
      }

    const queue = this.genericQueueProcessor.getQueue(
      assignment.workerQueueName,
    );
    if (!queue) {
      return {
        error: 'Cola no registrada',
        workerQueue: assignment.workerQueueName,
        suggestion: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const jobId = randomUUID();
    await queue.add(
      'job-name',
      {
        serviceName,
        operation: 'find-one',
        id,
        workerQueueName: assignment.workerQueueName,
      },
      { jobId },
    );

    const workerQueueConfig =
      await this.queueConfigService.getWorkerQueueConfig(
        assignment.workerQueueName,
      );
    const status =
      workerQueueConfig.workerQueueConcurrency === 0
        ? 'queued (paused)'
        : 'processing';

    this.logger.log(
      `FIND_ONE encolado: ${serviceName} → [${assignment.workerQueueName}] - Job: ${jobId} - Status: ${status}`,
    );

    return {
      message: `${serviceName} encolado`,
      jobId,
      workerQueue: assignment.workerQueueName,
      concurrency: workerQueueConfig.workerQueueConcurrency,
      status,
      statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      note:
        workerQueueConfig.workerQueueConcurrency === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la concurrencia'
          : undefined,
    };
  }

  private async handleUpdate(serviceName: string, id: number, updateDto: any) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);
    if (!shouldUseQueue) {
      return await this.getService(serviceName).update(id, updateDto);
    }

    const assignment =
      await this.serviceLoadBalancerService.selectWorkerQueue(serviceName);
    if (!assignment) {
      this.logger.warn(
        `No worker queues para ${serviceName}, ejecutando síncronamente`,
      );
      return await this.getService(serviceName).update(id, updateDto);
    }

    const queue = this.genericQueueProcessor.getQueue(
      assignment.workerQueueName,
    );
    if (!queue) {
      return {
        error: 'Cola no registrada',
        workerQueue: assignment.workerQueueName,
        suggestion: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const jobId = randomUUID();
    await queue.add(
      'job-name',
      {
        serviceName,
        operation: 'update',
        id,
        data: updateDto,
        workerQueueName: assignment.workerQueueName,
      },
      { jobId },
    );

    const workerQueueConfig =
      await this.queueConfigService.getWorkerQueueConfig(
        assignment.workerQueueName,
      );
    const status =
      workerQueueConfig.workerQueueConcurrency === 0
        ? 'queued (paused)'
        : 'processing';

    this.logger.log(
      `UPDATE encolado: ${serviceName} → [${assignment.workerQueueName}] - Job: ${jobId} - Status: ${status}`,
    );

    return {
      message: `${serviceName} encolado`,
      jobId,
      workerQueue: assignment.workerQueueName,
      concurrency: workerQueueConfig.workerQueueConcurrency,
      status,
      statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      note:
        workerQueueConfig.workerQueueConcurrency === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la concurrencia'
          : undefined,
    };
  }

  private async handleRemove(serviceName: string, id: number) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);
    if (!shouldUseQueue) {
      return await this.getService(serviceName).remove(id);
    }

    const assignment =
      await this.serviceLoadBalancerService.selectWorkerQueue(serviceName);
    if (!assignment) {
      this.logger.warn(
        `No worker queues para ${serviceName}, ejecutando síncronamente`,
      );
      return await this.getService(serviceName).remove(id);
    }

    const queue = this.genericQueueProcessor.getQueue(
      assignment.workerQueueName,
    );
    if (!queue) {
      return {
        error: 'Cola no registrada',
        workerQueue: assignment.workerQueueName,
        suggestion: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const jobId = randomUUID();
    await queue.add(
      'job-name',
      {
        serviceName,
        operation: 'delete',
        id,
        workerQueueName: assignment.workerQueueName,
      },
      { jobId },
    );

    const workerQueueConfig =
      await this.queueConfigService.getWorkerQueueConfig(
        assignment.workerQueueName,
      );
    const status =
      workerQueueConfig.workerQueueConcurrency === 0
        ? 'queued (paused)'
        : 'processing';

    this.logger.log(
      `DELETE encolado: ${serviceName} → [${assignment.workerQueueName}] - Job: ${jobId} - Status: ${status}`,
    );

    return {
      message: `${serviceName} encolado`,
      jobId,
      workerQueue: assignment.workerQueueName,
      concurrency: workerQueueConfig.workerQueueConcurrency,
      status,
      statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      note:
        workerQueueConfig.workerQueueConcurrency === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la concurrencia'
          : undefined,
    };
  }

  private getService(serviceName: string): any {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not registered in wrapper`);
    }
    return service;
  }
}
