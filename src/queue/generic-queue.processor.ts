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
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CarreraService } from '../carrera/carrera.service';
import { PlanEstudioService } from '../plan-estudio/plan-estudio.service'; // ← AGREGAR IMPORT

export const GENERIC_QUEUE = 'generic-queue';

export const GENERIC_JOB_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  FIND_ALL: 'find-all',
  FIND_ONE: 'find-one',
} as const;

interface GenericJobData {
  serviceName: string;
  operation: 'create' | 'update' | 'delete' | 'find-all' | 'find-one';
  data?: any;
  id?: number;
}

@Processor(GENERIC_QUEUE)
@Injectable()
export class GenericQueueProcessor {
  private readonly logger = new Logger(GenericQueueProcessor.name);
  private serviceRegistry: Map<string, any> = new Map();

  constructor(
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

  @Process(GENERIC_JOB_TYPES.CREATE)
  async handleCreate(job: Job<GenericJobData>) {
    const { serviceName, data } = job.data;
    this.logger.log(
      `Procesando trabajo CREATE ${serviceName} - Job ID: ${job.id}`,
    );

    try {
      const service = await this.getService(serviceName);
      const result = await service.create(data);

      this.logger.log(`${serviceName} creado exitosamente - Job ID: ${job.id}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error creando ${serviceName} - Job ID: ${job.id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.UPDATE)
  async handleUpdate(job: Job<GenericJobData>) {
    const { serviceName, data, id } = job.data;
    this.logger.log(
      `Procesando trabajo UPDATE ${serviceName} - Job ID: ${job.id}`,
    );

    try {
      const service = await this.getService(serviceName);
      const result = await service.update(id, data);

      this.logger.log(
        `${serviceName} actualizado exitosamente - Job ID: ${job.id}, ID: ${id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error actualizando ${serviceName} - Job ID: ${job.id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.DELETE)
  async handleDelete(job: Job<GenericJobData>) {
    const { serviceName, id } = job.data;
    this.logger.log(
      `Procesando trabajo DELETE ${serviceName} - Job ID: ${job.id}`,
    );

    try {
      const service = await this.getService(serviceName);
      const result = await service.remove(id);

      this.logger.log(
        `${serviceName} eliminado exitosamente - Job ID: ${job.id}, ID: ${id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error eliminando ${serviceName} - Job ID: ${job.id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.FIND_ALL)
  async handleFindAll(job: Job<GenericJobData>) {
    const { serviceName } = job.data;
    this.logger.log(
      `Procesando trabajo FIND_ALL ${serviceName} - Job ID: ${job.id}`,
    );

    try {
      const service = await this.getService(serviceName);
      const result = await service.findAll();

      this.logger.log(
        `${serviceName} findAll ejecutado exitosamente - Job ID: ${job.id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error en findAll ${serviceName} - Job ID: ${job.id}`,
        error.stack,
      );
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.FIND_ONE)
  async handleFindOne(job: Job<GenericJobData>) {
    const { serviceName, id } = job.data;
    this.logger.log(
      `Procesando trabajo FIND_ONE ${serviceName} - Job ID: ${job.id}`,
    );

    try {
      const service = await this.getService(serviceName);
      const result = await service.findOne(id);

      this.logger.log(
        `${serviceName} findOne ejecutado exitosamente - Job ID: ${job.id}, ID: ${id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error en findOne ${serviceName} - Job ID: ${job.id}`,
        error.stack,
      );
      throw error;
    }
  }

  private async getService(serviceName: string): Promise<any> {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not registered in processor`);
    }
    return service;
  }

  // Método para registrar nuevos servicios dinámicamente
  registerService(serviceName: string, service: any): void {
    this.serviceRegistry.set(serviceName, service);
    this.logger.log(`Servicio ${serviceName} registrado en el procesador`);
  }
}
