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
import { ColaConfigService } from './cola-config.service';
import * as fs from 'fs';
import * as path from 'path';

export const COLA_GENERICA = 'cola-generica'; // Ya no se usa, pero mantenemos por compatibilidad

interface DatosTrabajoGenerico {
  nombreServicio: string;
  operacion: 'create' | 'update' | 'delete' | 'find-all' | 'find-one';
  data?: any;
  id?: number;
  nombreColaHilos?: string; // Metadata para tracking
}

@Injectable()
export class ProcesadorColaGenerica implements OnModuleInit {
  private readonly logger = new Logger(ProcesadorColaGenerica.name);
  private registroServicios: Map<string, any> = new Map();
  private registroColas: Map<string, Queue> = new Map();
  private registroWorkers: Map<string, Worker> = new Map();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly colaConfigService: ColaConfigService,
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
    this.registroServicios.set('carrera', this.carreraService);
    this.registroServicios.set('plan-estudio', this.planEstudioService);
    this.registroServicios.set('estudiante', this.estudianteService);
    this.registroServicios.set('inscripcion', this.inscripcionService);
    this.registroServicios.set('aula', this.aulaService);
    this.registroServicios.set('boleta-horario', this.boletaHorarioService);
    this.registroServicios.set('docente', this.docenteService);
    this.registroServicios.set('gestion', this.gestionService);
    this.registroServicios.set('grupo', this.grupoService);
    this.registroServicios.set('grupo-materia', this.grupoMateriaService);
    this.registroServicios.set('horario', this.horarioService);
    this.registroServicios.set('materia', this.materiaService);
    this.registroServicios.set('modulo', this.moduloService);
    this.registroServicios.set('nivel', this.nivelService);
    this.registroServicios.set('nota', this.notaService);
    this.registroServicios.set('periodo', this.periodoService);
    this.registroServicios.set('prerequisito', this.prerequisitoService);
    this.registroServicios.set('detalle-inscripcion', this.detalleInscripcionService);

    this.logger.log(`📋 Servicios registrados: ${Array.from(this.registroServicios.keys()).join(', ')}`);
  }

  async onModuleInit() {
    this.logger.log('🚀 Iniciando procesadores dinámicos...');
    
    // Cargar configuración de colas hilos
    const config = await this.cargarConfigColasHilos();
    
    // Registrar procesador para cada cola hilos
    for (const ch of config.colasHilos) {
      await this.registrarProcesadorColaHilos(ch);
    }

    this.logger.log(`✅ ${this.registroColas.size} procesadores dinámicos activos`);
  }

  private async cargarConfigColasHilos() {
    const rutaConfig = path.join(process.cwd(), 'src', 'cola', 'cola-config.json');
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
  }

  private async registrarProcesadorColaHilos(colaHilos: any) {
    try {
      const { nombre, hilos, habilitada } = colaHilos;

      const cola = this.moduleRef.get<Queue>(`BullQueue_${nombre}`, { strict: false });
      this.registroColas.set(nombre, cola);

      if (hilos === 0 || !habilitada) {
        this.logger.warn(`⏸️ ${nombre}: hilos=${hilos} - NO procesará`);
        return;
      }

      // Crear Worker de BullMQ
      const worker = new Worker(
        nombre,
        async (trabajo: Job) => await this.manejarTrabajo(nombre, trabajo),
        {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          concurrency: hilos,
        }
      );

      this.registroWorkers.set(nombre, worker);
      this.logger.log(`✅ Worker registrado: ${nombre} (${hilos} workers)`);

    } catch (error) {
      this.logger.error(`❌ Error: ${error.message}`);
    }
  }

  private async manejarTrabajo(nombreColaHilos: string, trabajo: Job<DatosTrabajoGenerico>) {
    const { operacion, nombreServicio } = trabajo.data;
    
    this.logger.log(`🔥 [${nombreColaHilos}] Procesando ${operacion} para ${nombreServicio} - Job: ${trabajo.id}`);

    try {
      const servicio = this.obtenerServicio(nombreServicio);
      let resultado;

      switch (operacion) {
        case 'create':
          resultado = await servicio.create(trabajo.data.data);
          break;
        case 'update':
          resultado = await servicio.update(trabajo.data.id, trabajo.data.data);
          break;
        case 'delete':
          resultado = await servicio.remove(trabajo.data.id);
          break;
        case 'find-all':
          resultado = await servicio.findAll();
          break;
        case 'find-one':
          resultado = await servicio.findOne(trabajo.data.id);
          break;
        default:
          throw new Error(`Operación no soportada: ${operacion}`);
      }

      this.logger.log(`✅ [${nombreColaHilos}] ${operacion} ${nombreServicio} completado - Job: ${trabajo.id}`);
      return resultado;

    } catch (error) {
      this.logger.error(`❌ [${nombreColaHilos}] Error en ${operacion} ${nombreServicio}:`, error.stack);
      throw error;
    }
  }

  private obtenerServicio(nombreServicio: string): any {
    const servicio = this.registroServicios.get(nombreServicio);
    if (!servicio) {
      this.logger.error(`❌ Service ${nombreServicio} not found. Available: ${Array.from(this.registroServicios.keys()).join(', ')}`);
      throw new Error(`Service ${nombreServicio} not registered`);
    }
    return servicio;
  }

  // Método para obtener cola específica (usado por wrapper)
  obtenerCola(nombreColaHilos: string): Queue | undefined {
    return this.registroColas.get(nombreColaHilos);
  }

  // Método para actualizar hilos en runtime (requiere reinicio de procesador)
  async actualizarHilosColaHilos(nombreColaHilos: string, nuevosHilos: number) {
    const workerAntiguo = this.registroWorkers.get(nombreColaHilos);
    
    // Si no existe worker (concurrency era 0), crear nuevo
    if (!workerAntiguo) {
      if (nuevosHilos === 0) {
        this.logger.log(`${nombreColaHilos} sigue pausado`);
        return;
      }
  
      // Crear worker desde 0
      const cola = this.registroColas.get(nombreColaHilos);
      const nuevoWorker = new Worker(
        nombreColaHilos,
        async (trabajo: Job) => await this.manejarTrabajo(nombreColaHilos, trabajo),
        {
          connection: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          concurrency: nuevosHilos,
        }
      );
  
      this.registroWorkers.set(nombreColaHilos, nuevoWorker);
      this.logger.log(`✅ ${nombreColaHilos} activado con ${nuevosHilos} workers`);
      return;
    }
  
    // Worker existe, actualizar
    this.logger.log(`🔄 Cambiando hilos de ${nombreColaHilos} a ${nuevosHilos}`);
    
    await Promise.race([
      workerAntiguo.close(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]).catch(() => {
      this.logger.warn('Worker no cerró a tiempo');
    });
    
    this.logger.log(`⏸️ Worker cerrado`);
  
    if (nuevosHilos === 0) {
      this.registroWorkers.delete(nombreColaHilos);
      this.logger.log(`✅ ${nombreColaHilos} pausado`);
      return;
    }
  
    const nuevoWorker = new Worker(
      nombreColaHilos,
      async (trabajo: Job) => await this.manejarTrabajo(nombreColaHilos, trabajo),
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
        concurrency: nuevosHilos,
      }
    );
  
    this.registroWorkers.set(nombreColaHilos, nuevoWorker);
    this.logger.log(`✅ ${nombreColaHilos} ahora tiene ${nuevosHilos} workers`);
  }
}