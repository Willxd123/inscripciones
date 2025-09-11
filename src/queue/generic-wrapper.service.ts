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
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QueueConfigService } from './queue-config.service';
import { GENERIC_QUEUE, GENERIC_JOB_TYPES } from './generic-queue.processor';
import { randomUUID } from 'crypto';

@Injectable()
export class GenericWrapperService {
  private readonly logger = new Logger(GenericWrapperService.name);
  private readonly serviceRegistry: Map<string, any> = new Map();

  constructor(
    @InjectQueue(GENERIC_QUEUE) private genericQueue: Queue,
    private readonly queueConfigService: QueueConfigService,
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
    // Registrar servicios disponibles
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

  // Factory method para crear wrapper de cualquier servicio
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

    if (shouldUseQueue) {
      const jobId = randomUUID();

      await this.genericQueue.add(
        GENERIC_JOB_TYPES.CREATE,
        {
          serviceName,
          operation: 'create',
          data: createDto,
        },
        { jobId },
      );

      const isPaused = await this.queueConfigService.isQueuePaused(serviceName);

      return {
        message: `${serviceName} en proceso`,
        jobId,
        status: isPaused ? 'queued' : 'processing',
        statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      };
    } else {
      const service = await this.getService(serviceName);
      return await service.create(createDto);
    }
  }

  private async handleFindAll(serviceName: string) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      const jobId = randomUUID();

      await this.genericQueue.add(
        GENERIC_JOB_TYPES.FIND_ALL,
        {
          serviceName,
          operation: 'find-all',
        },
        { jobId },
      );

      const isPaused = await this.queueConfigService.isQueuePaused(serviceName);

      return {
        message: `${serviceName} en proceso`,
        jobId,
        status: isPaused ? 'queued' : 'processing',
        statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      };
    } else {
      const service = await this.getService(serviceName);
      return await service.findAll();
    }
  }

  private async handleFindOne(serviceName: string, id: number) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      const jobId = randomUUID();

      await this.genericQueue.add(
        GENERIC_JOB_TYPES.FIND_ONE,
        {
          serviceName,
          operation: 'find-one',
          id,
        },
        { jobId },
      );

      const isPaused = await this.queueConfigService.isQueuePaused(serviceName);

      return {
        message: `${serviceName} en proceso`,
        jobId,
        status: isPaused ? 'queued' : 'processing',
        statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      };
    } else {
      const service = await this.getService(serviceName);
      return await service.findOne(id);
    }
  }

  private async handleUpdate(serviceName: string, id: number, updateDto: any) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      const jobId = randomUUID();

      await this.genericQueue.add(
        GENERIC_JOB_TYPES.UPDATE,
        {
          serviceName,
          operation: 'update',
          id,
          data: updateDto,
        },
        { jobId },
      );

      const isPaused = await this.queueConfigService.isQueuePaused(serviceName);

      return {
        message: `${serviceName} en proceso`,
        jobId,
        status: isPaused ? 'queued' : 'processing',
        statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      };
    } else {
      const service = await this.getService(serviceName);
      return await service.update(id, updateDto);
    }
  }

  private async handleRemove(serviceName: string, id: number) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      const jobId = randomUUID();

      await this.genericQueue.add(
        GENERIC_JOB_TYPES.DELETE,
        {
          serviceName,
          operation: 'delete',
          id,
        },
        { jobId },
      );

      const isPaused = await this.queueConfigService.isQueuePaused(serviceName);

      return {
        message: `${serviceName} en proceso`,
        jobId,
        status: isPaused ? 'queued' : 'processing',
        statusUrl: `http://localhost:3000/api/queue/job/${jobId}`,
      };
    } else {
      const service = await this.getService(serviceName);
      return await service.remove(id);
    }
  }

  /**
   * Determina el estado real de un trabajo recién encolado
   */
  private async determineJobStatus(job: any): Promise<'queued' | 'processing'> {
    try {
      // Verificar si ya comenzó a procesarse inmediatamente
      if (job.processedOn) {
        return 'processing';
      }

      // Verificar si la cola está pausada
      const isPaused = await this.genericQueue.isPaused();
      if (isPaused) {
        return 'queued';
      }

      // Verificar si hay trabajos activos (procesándose actualmente)
      const activeJobs = await this.genericQueue.getActive();

      // Si hay trabajos activos, este trabajo está en cola esperando
      if (activeJobs.length > 0) {
        return 'queued';
      }

      // Si no hay trabajos activos y la cola no está pausada,
      // probablemente comenzará a procesarse inmediatamente
      return 'processing';
    } catch (error) {
      this.logger.warn(`Error determinando estado del job ${job.id}:`, error);
      // En caso de error, asumir que está en cola
      return 'queued';
    }
  }

  private async getService(serviceName: string): Promise<any> {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not registered in wrapper`);
    }
    return service;
  }

  registerService(serviceName: string, service: any): void {
    this.serviceRegistry.set(serviceName, service);
    this.logger.log(`Servicio ${serviceName} registrado en el wrapper`);
  }
}
