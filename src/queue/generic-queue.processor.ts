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
import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Queue, Job, Worker } from 'bullmq';
import { CarreraService } from '../carrera/carrera.service';
import { PlanEstudioService } from '../plan-estudio/plan-estudio.service';
import { QueueConfigService } from './queue-config.service';
import * as fs from 'fs';
import * as path from 'path';

export const GENERIC_QUEUE = 'generic-queue'; // Ya no se usa, pero mantenemos por compatibilidad

interface GenericJobData {
  serviceName: string;
  operation: 'create' | 'update' | 'delete' | 'find-all' | 'find-one';
  data?: any;
  id?: number;
  workerQueueName?: string; // Metadata para tracking
}

@Injectable()
export class GenericQueueProcessor implements OnModuleInit {
  private readonly logger = new Logger(GenericQueueProcessor.name);
  private serviceRegistry: Map<string, any> = new Map();
  private queueRegistry: Map<string, Queue> = new Map();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly queueConfigService: QueueConfigService,
    @Inject(CarreraService) private readonly carreraService: CarreraService,
    @Inject(PlanEstudioService) private readonly planEstudioService: PlanEstudioService,
    @Inject(EstudianteService) private readonly estudianteService: EstudianteService,
    @Inject(InscripcionService) private readonly inscripcionService: InscripcionService,
    @Inject(AulaService) private readonly aulaService: AulaService,
    @Inject(BoletaHorarioService) private readonly boletaHorarioService: BoletaHorarioService,
    @Inject(DocenteService) private readonly docenteService: DocenteService,
    @Inject(GestionService) private readonly gestionService: GestionService,
    @Inject(GrupoService) private readonly grupoService: GrupoService,
    @Inject(GrupoMateriaService) private readonly grupoMateriaService: GrupoMateriaService,
    @Inject(HorarioService) private readonly horarioService: HorarioService,
    @Inject(MateriaService) private readonly materiaService: MateriaService,
    @Inject(ModuloService) private readonly moduloService: ModuloService,
    @Inject(NivelService) private readonly nivelService: NivelService,
    @Inject(NotaService) private readonly notaService: NotaService,
    @Inject(PeriodoService) private readonly periodoService: PeriodoService,
    @Inject(PrerequisitoService) private readonly prerequisitoService: PrerequisitoService,
    @Inject(DetalleInscripcionService) private readonly detalleInscripcionService: DetalleInscripcionService,
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
    this.serviceRegistry.set('detalle-inscripcion', this.detalleInscripcionService);

    this.logger.log(`📋 Servicios registrados: ${Array.from(this.serviceRegistry.keys()).join(', ')}`);
  }

  async onModuleInit() {
    this.logger.log('🚀 Iniciando procesadores dinámicos...');
    
    // Cargar configuración de worker queues
    const config = await this.loadWorkerQueuesConfig();
    
    // Registrar procesador para cada worker queue
    for (const wq of config.workerQueues) {
      await this.registerWorkerQueueProcessor(wq);
    }

    this.logger.log(`✅ ${this.queueRegistry.size} procesadores dinámicos activos`);
  }

  private async loadWorkerQueuesConfig() {
    const configPath = path.join(process.cwd(), 'src', 'queue', 'queue-config.json');
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
  }

  private workerRegistry: Map<string, Worker> = new Map(); // Agregar esta línea arriba

private async registerWorkerQueueProcessor(workerQueue: any) {
  try {
    const { name, concurrency, enabled } = workerQueue;

    const queue = this.moduleRef.get<Queue>(`BullQueue_${name}`, { strict: false });
    this.queueRegistry.set(name, queue);

    if (concurrency === 0 || !enabled) {
      this.logger.warn(`⏸️ ${name}: concurrency=${concurrency} - NO procesará`);
      return;
    }

    // Crear Worker de BullMQ
    const worker = new Worker(
      name,
      async (job: Job) => await this.handleJob(name, job),
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
        concurrency,
      }
    );

    this.workerRegistry.set(name, worker);
    this.logger.log(`✅ Worker registrado: ${name} (${concurrency} workers)`);

  } catch (error) {
    this.logger.error(`❌ Error: ${error.message}`);
  }
}

  private async handleJob(workerQueueName: string, job: Job<GenericJobData>) {
    const { operation, serviceName } = job.data;
    
    this.logger.log(`🔥 [${workerQueueName}] Procesando ${operation} para ${serviceName} - Job: ${job.id}`);

    try {
      const service = this.getService(serviceName);
      let result;

      switch (operation) {
        case 'create':
          result = await service.create(job.data.data);
          break;
        case 'update':
          result = await service.update(job.data.id, job.data.data);
          break;
        case 'delete':
          result = await service.remove(job.data.id);
          break;
        case 'find-all':
          result = await service.findAll();
          break;
        case 'find-one':
          result = await service.findOne(job.data.id);
          break;
        default:
          throw new Error(`Operación no soportada: ${operation}`);
      }

      this.logger.log(`✅ [${workerQueueName}] ${operation} ${serviceName} completado - Job: ${job.id}`);
      return result;

    } catch (error) {
      this.logger.error(`❌ [${workerQueueName}] Error en ${operation} ${serviceName}:`, error.stack);
      throw error;
    }
  }

  private getService(serviceName: string): any {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) {
      this.logger.error(`❌ Service ${serviceName} not found. Available: ${Array.from(this.serviceRegistry.keys()).join(', ')}`);
      throw new Error(`Service ${serviceName} not registered`);
    }
    return service;
  }

  // Método para obtener cola específica (usado por wrapper)
  getQueue(workerQueueName: string): Queue | undefined {
    return this.queueRegistry.get(workerQueueName);
  }

  // Método para actualizar concurrencia en runtime (requiere reinicio de procesador)
  async updateWorkerQueueConcurrency(workerQueueName: string, newConcurrency: number) {
    const oldWorker = this.workerRegistry.get(workerQueueName);
    
    // Si no existe worker (concurrency era 0), crear nuevo
    if (!oldWorker) {
      if (newConcurrency === 0) {
        this.logger.log(`${workerQueueName} sigue pausado`);
        return;
      }
  
      // Crear worker desde 0
      const queue = this.queueRegistry.get(workerQueueName);
      const newWorker = new Worker(
        workerQueueName,
        async (job: Job) => await this.handleJob(workerQueueName, job),
        {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          concurrency: newConcurrency,
        }
      );
  
      this.workerRegistry.set(workerQueueName, newWorker);
      this.logger.log(`✅ ${workerQueueName} activado con ${newConcurrency} workers`);
      return;
    }
  
    // Worker existe, actualizar
    this.logger.log(`🔄 Cambiando concurrencia de ${workerQueueName} a ${newConcurrency}`);
    
    await Promise.race([
      oldWorker.close(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]).catch(() => {
      this.logger.warn('Worker no cerró a tiempo');
    });
    
    this.logger.log(`⏸️ Worker cerrado`);
  
    if (newConcurrency === 0) {
      this.workerRegistry.delete(workerQueueName);
      this.logger.log(`✅ ${workerQueueName} pausado`);
      return;
    }
  
    const newWorker = new Worker(
      workerQueueName,
      async (job: Job) => await this.handleJob(workerQueueName, job),
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
        concurrency: newConcurrency,
      }
    );
  
    this.workerRegistry.set(workerQueueName, newWorker);
    this.logger.log(`✅ ${workerQueueName} ahora tiene ${newConcurrency} workers`);
  }
}