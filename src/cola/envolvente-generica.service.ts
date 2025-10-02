import { BalanceadorCargaService } from './balanceador-carga.service';
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
import { ColaConfigService } from './cola-config.service';
import { ProcesadorColaGenerica } from './procesador-cola-generica.processor';
import { randomUUID } from 'crypto';

@Injectable()
export class EnvolventeGenericaService {
  private readonly logger = new Logger(EnvolventeGenericaService.name);
  private readonly registroServicios: Map<string, any> = new Map();

  constructor(
    private readonly colaConfigService: ColaConfigService,
    private readonly balanceadorCargaService: BalanceadorCargaService,
    private readonly procesadorColaGenerica: ProcesadorColaGenerica,
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
    this.registroServicios.set(
      'detalle-inscripcion',
      this.detalleInscripcionService,
    );
  }

  crearEnvolventeServicio(nombreServicio: string) {
    return {
      create: (createDto: any) => this.manejarCrear(nombreServicio, createDto),
      findAll: () => this.manejarBuscarTodos(nombreServicio),
      findOne: (id: number) => this.manejarBuscarUno(nombreServicio, id),
      update: (id: number, updateDto: any) =>
        this.manejarActualizar(nombreServicio, id, updateDto),
      remove: (id: number) => this.manejarEliminar(nombreServicio, id),
    };
  }

  private async manejarCrear(nombreServicio: string, createDto: any) {
    const deberiaUsarCola =
      await this.colaConfigService.deberiaUsarCola(nombreServicio);

    if (!deberiaUsarCola) {
      return await this.obtenerServicio(nombreServicio).create(createDto);
    }

    const asignacion =
      await this.balanceadorCargaService.seleccionarColaHilos(nombreServicio);

    if (!asignacion) {
      return {
        error: 'No hay colas hilos disponibles',
        mensaje: `El servicio ${nombreServicio} está configurado para usar colas pero no hay colas hilos activas que puedan atenderlo`,
        nombreServicio,
        sugerencia: 'Crear cola hilos con ese servicio asignado o cambiar servicio a modo síncrono: POST /api/cola/config',
      };
    }

    const cola = this.procesadorColaGenerica.obtenerCola(
      asignacion.nombreColaHilos,
    );
    if (!cola) {
      return {
        error: 'Cola no registrada',
        colaHilos: asignacion.nombreColaHilos,
        sugerencia: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const idTrabajo = randomUUID();
    await cola.add(
      'nombre-trabajo',
      {
        nombreServicio,
        operacion: 'create',
        data: createDto,
        nombreColaHilos: asignacion.nombreColaHilos,
      },
      { jobId: idTrabajo },
    );

    const configColaHilos =
      await this.colaConfigService.obtenerConfigColaHilos(
        asignacion.nombreColaHilos,
      );
    const estado =
      configColaHilos.hilosColaHilos === 0
        ? 'encolado (pausado)'
        : 'procesando';

    this.logger.log(
      `CREATE encolado: ${nombreServicio} → [${asignacion.nombreColaHilos}] - Job: ${idTrabajo} - Estado: ${estado}`,
    );

    return {
      mensaje: `${nombreServicio} encolado`,
      idTrabajo,
      colaHilos: asignacion.nombreColaHilos,
      hilos: configColaHilos.hilosColaHilos,
      estado,
      urlEstado: `http://localhost:3000/api/cola/trabajo/${idTrabajo}`,
      nota:
        configColaHilos.hilosColaHilos === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente los hilos'
          : undefined,
    };
  }

  private async manejarBuscarTodos(nombreServicio: string) {
    const deberiaUsarCola =
      await this.colaConfigService.deberiaUsarCola(nombreServicio);
    if (!deberiaUsarCola) {
      return await this.obtenerServicio(nombreServicio).findAll();
    }

    const asignacion =
      await this.balanceadorCargaService.seleccionarColaHilos(nombreServicio);
    if (!asignacion) {
      this.logger.warn(
        `No hay colas hilos para ${nombreServicio}, ejecutando síncronamente`,
      );
      return await this.obtenerServicio(nombreServicio).findAll();
    }

    const cola = this.procesadorColaGenerica.obtenerCola(
      asignacion.nombreColaHilos,
    );
    if (!cola) {
      return {
        error: 'Cola no registrada',
        colaHilos: asignacion.nombreColaHilos,
        sugerencia: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const idTrabajo = randomUUID();
    await cola.add(
      'nombre-trabajo',
      {
        nombreServicio,
        operacion: 'find-all',
        nombreColaHilos: asignacion.nombreColaHilos,
      },
      { jobId: idTrabajo },
    );

    const configColaHilos =
      await this.colaConfigService.obtenerConfigColaHilos(
        asignacion.nombreColaHilos,
      );
    const estado =
      configColaHilos.hilosColaHilos === 0
        ? 'encolado (pausado)'
        : 'procesando';

    this.logger.log(
      `FIND_ALL encolado: ${nombreServicio} → [${asignacion.nombreColaHilos}] - Job: ${idTrabajo} - Estado: ${estado}`,
    );

    return {
      mensaje: `${nombreServicio} encolado`,
      idTrabajo,
      colaHilos: asignacion.nombreColaHilos,
      hilos: configColaHilos.hilosColaHilos,
      estado,
      urlEstado: `http://localhost:3000/api/cola/trabajo/${idTrabajo}`,
      nota:
        configColaHilos.hilosColaHilos === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la hilos'
          : undefined,
    };
  }

  private async manejarBuscarUno(nombreServicio: string, id: number) {
    const deberiaUsarCola =
      await this.colaConfigService.deberiaUsarCola(nombreServicio);
    if (!deberiaUsarCola) {
      return await this.obtenerServicio(nombreServicio).findOne(id);
    }

    const asignacion =
      await this.balanceadorCargaService.seleccionarColaHilos(nombreServicio);
    if (!asignacion) {
      return {
        error: 'No hay colas hilos disponibles',
        mensaje: `El servicio ${nombreServicio} está configurado para usar colas pero no hay colas hilos activas que puedan atenderlo`,
        nombreServicio,
        sugerencia: 'Crear cola hilos con ese servicio asignado o cambiar servicio a modo síncrono: POST /api/cola/config',
      };
    }

    const cola = this.procesadorColaGenerica.obtenerCola(
      asignacion.nombreColaHilos,
    );
    if (!cola) {
      return {
        error: 'Cola no registrada',
        colaHilos: asignacion.nombreColaHilos,
        sugerencia: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const idTrabajo = randomUUID();
    await cola.add(
      'nombre-trabajo',
      {
        nombreServicio,
        operacion: 'find-one',
        id,
        nombreColaHilos: asignacion.nombreColaHilos,
      },
      { jobId: idTrabajo },
    );

    const configColaHilos =
      await this.colaConfigService.obtenerConfigColaHilos(
        asignacion.nombreColaHilos,
      );
    const estado =
      configColaHilos.hilosColaHilos === 0
        ? 'encolado (pausado)'
        : 'procesando';

    this.logger.log(
      `FIND_ONE encolado: ${nombreServicio} → [${asignacion.nombreColaHilos}] - Job: ${idTrabajo} - Estado: ${estado}`,
    );

    return {
      mensaje: `${nombreServicio} encolado`,
      idTrabajo,
      colaHilos: asignacion.nombreColaHilos,
      hilos: configColaHilos.hilosColaHilos,
      estado,
      urlEstado: `http://localhost:3000/api/cola/trabajo/${idTrabajo}`,
      nota:
        configColaHilos.hilosColaHilos === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la hilos'
          : undefined,
    };
  }

  private async manejarActualizar(nombreServicio: string, id: number, updateDto: any) {
    const deberiaUsarCola =
      await this.colaConfigService.deberiaUsarCola(nombreServicio);
    if (!deberiaUsarCola) {
      return await this.obtenerServicio(nombreServicio).update(id, updateDto);
    }

    const asignacion =
      await this.balanceadorCargaService.seleccionarColaHilos(nombreServicio);
    if (!asignacion) {
      this.logger.warn(
        `No hay colas hilos para ${nombreServicio}, ejecutando síncronamente`,
      );
      return await this.obtenerServicio(nombreServicio).update(id, updateDto);
    }

    const cola = this.procesadorColaGenerica.obtenerCola(
      asignacion.nombreColaHilos,
    );
    if (!cola) {
      return {
        error: 'Cola no registrada',
        colaHilos: asignacion.nombreColaHilos,
        sugerencia: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const idTrabajo = randomUUID();
    await cola.add(
      'nombre-trabajo',
      {
        nombreServicio,
        operacion: 'update',
        id,
        data: updateDto,
        nombreColaHilos: asignacion.nombreColaHilos,
      },
      { jobId: idTrabajo },
    );

    const configColaHilos =
      await this.colaConfigService.obtenerConfigColaHilos(
        asignacion.nombreColaHilos,
      );
    const estado =
      configColaHilos.hilosColaHilos === 0
        ? 'encolado (pausado)'
        : 'procesando';

    this.logger.log(
      `UPDATE encolado: ${nombreServicio} → [${asignacion.nombreColaHilos}] - Job: ${idTrabajo} - Estado: ${estado}`,
    );

    return {
      mensaje: `${nombreServicio} encolado`,
      idTrabajo,
      colaHilos: asignacion.nombreColaHilos,
      hilos: configColaHilos.hilosColaHilos,
      estado,
      urlEstado: `http://localhost:3000/api/cola/trabajo/${idTrabajo}`,
      nota:
        configColaHilos.hilosColaHilos === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la hilos'
          : undefined,
    };
  }

  private async manejarEliminar(nombreServicio: string, id: number) {
    const deberiaUsarCola =
      await this.colaConfigService.deberiaUsarCola(nombreServicio);
    if (!deberiaUsarCola) {
      return await this.obtenerServicio(nombreServicio).remove(id);
    }

    const asignacion =
      await this.balanceadorCargaService.seleccionarColaHilos(nombreServicio);
    if (!asignacion) {
      this.logger.warn(
        `No hay colas hilos para ${nombreServicio}, ejecutando síncronamente`,
      );
      return await this.obtenerServicio(nombreServicio).remove(id);
    }

    const cola = this.procesadorColaGenerica.obtenerCola(
      asignacion.nombreColaHilos,
    );
    if (!cola) {
      return {
        error: 'Cola no registrada',
        colaHilos: asignacion.nombreColaHilos,
        sugerencia: 'Reiniciar aplicación para registrar la cola',
      };
    }

    const idTrabajo = randomUUID();
    await cola.add(
      'nombre-trabajo',
      {
        nombreServicio,
        operacion: 'delete',
        id,
        nombreColaHilos: asignacion.nombreColaHilos,
      },
      { jobId: idTrabajo },
    );

    const configColaHilos =
      await this.colaConfigService.obtenerConfigColaHilos(
        asignacion.nombreColaHilos,
      );
    const estado =
      configColaHilos.hilosColaHilos === 0
        ? 'encolado (pausado)'
        : 'procesando';

    this.logger.log(
      `DELETE encolado: ${nombreServicio} → [${asignacion.nombreColaHilos}] - Job: ${idTrabajo} - Estado: ${estado}`,
    );

    return {
      mensaje: `${nombreServicio} encolado`,
      idTrabajo,
      colaHilos: asignacion.nombreColaHilos,
      hilos: configColaHilos.hilosColaHilos,
      estado,
      urlEstado: `http://localhost:3000/api/cola/trabajo/${idTrabajo}`,
      nota:
        configColaHilos.hilosColaHilos === 0
          ? 'Trabajo encolado pero no se procesará hasta que se aumente la hilos'
          : undefined,
    };
  }

  private obtenerServicio(nombreServicio: string): any {
    const servicio = this.registroServicios.get(nombreServicio);
    if (!servicio) {
      throw new Error(`Service ${nombreServicio} not registered in wrapper`);
    }
    return servicio;
  }
}