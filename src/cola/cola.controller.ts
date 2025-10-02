import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete } from '@nestjs/common';
import { ColaConfigService } from './cola-config.service';
import { BalanceadorCargaService } from './balanceador-carga.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { EstablecerModoColaDto } from './dto/establecer-modo-cola.dto';
import { ProcesadorColaGenerica } from './procesador-cola-generica.processor';

interface CrearColaHilosDto {
  nombreColaHilos: string;
  hilos: number;
  servicios: string[];
}

@ApiTags('Gestión de Colas')
@Controller('cola')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class ColaController {
  constructor(
    private readonly colaConfigService: ColaConfigService,
    private readonly balanceadorCargaService: BalanceadorCargaService,
    private readonly procesadorColaGenerica: ProcesadorColaGenerica,
  ) {}

  // ============ ENDPOINTS DE SERVICIOS ============

  @Post('config')
  @ApiOperation({ summary: 'Cambiar modo de un servicio (síncrono ↔ asíncrono)' })
  async establecerModoCola(@Body() dto: EstablecerModoColaDto) {
    await this.colaConfigService.establecerModoColaServicio(dto.nombreServicio, dto.usarCola);
    return {
      mensaje: `Servicio ${dto.nombreServicio} configurado para usar ${dto.usarCola ? 'colas' : 'modo síncrono'}`,
      nombreServicio: dto.nombreServicio,
      usarCola: dto.usarCola,
    };
  }

  @Get('estado')
  @ApiOperation({ summary: 'Ver estado de todas las colas' })
  async obtenerEstadoCola() {
    const configs = await this.colaConfigService.obtenerTodosLosServiciosConfig();
    return {
      mensaje: 'Estado actual de las colas',
      servicios: configs,
      totalServicios: configs.length,
    };
  }

  @Get('estado/:servicio')
  @ApiOperation({ summary: 'Ver configuración específica de un servicio' })
  async obtenerEstadoServicio(@Param('servicio') nombreServicio: string) {
    const config = await this.colaConfigService.obtenerConfigServicio(nombreServicio);
    return {
      nombreServicio,
      usarCola: config.usarCola,
      estaPausado: config.estaPausado,
      modoEfectivo: config.usarCola && !config.estaPausado ? 'cola activa' : config.usarCola && config.estaPausado ? 'cola pausada' : 'síncrono',
    };
  }

  @Post('config/todos/cola')
  @ApiOperation({ summary: 'Cambiar TODOS los servicios a modo cola' })
  async establecerTodosACola() {
    const servicios = [
      'carrera', 'plan-estudio', 'estudiante', 'inscripcion', 'aula',
      'boleta-horario', 'docente', 'gestion', 'grupo', 'grupo-materia',
      'horario', 'materia', 'modulo', 'nivel', 'nota', 'periodo',
      'prerequisito', 'detalle-inscripcion',
    ];

    for (const servicio of servicios) {
      await this.colaConfigService.establecerModoColaServicio(servicio, true);
    }

    return {
      mensaje: 'Todos los servicios configurados para usar COLAS',
      servicios: servicios,
      modo: 'asíncrono',
    };
  }

  @Post('config/todos/sincrono')
  @ApiOperation({ summary: 'Cambiar TODOS los servicios a modo síncrono' })
  async establecerTodosASincrono() {
    const servicios = [
      'carrera', 'plan-estudio', 'estudiante', 'inscripcion', 'aula',
      'boleta-horario', 'docente', 'gestion', 'grupo', 'grupo-materia',
      'horario', 'materia', 'modulo', 'nivel', 'nota', 'periodo',
      'prerequisito', 'detalle-inscripcion',
    ];

    for (const servicio of servicios) {
      await this.colaConfigService.establecerModoColaServicio(servicio, false);
    }

    return {
      mensaje: 'Todos los servicios configurados para modo SÍNCRONO',
      servicios: servicios,
      modo: 'síncrono',
    };
  }

  // ============ ENDPOINTS DE COLAS HIJO ============

  @Post('colas-hilos')
  @ApiOperation({ summary: 'Crear nueva cola hilos (REQUIERE REINICIO)' })
  @ApiResponse({ status: 201, description: 'Cola hilos creada - reiniciar app para activar' })
  async crearColaHilos(@Body() body: { nombreColaHilos: string; hilos: number; servicios: string[] }) {
    await this.colaConfigService.crearColaHilos(
      body.nombreColaHilos,
      body.hilos,
      body.servicios
    );

    return {
      mensaje: `Cola hilos ${body.nombreColaHilos} creada`,
      nombreColaHilos: body.nombreColaHilos,
      hilos: body.hilos,
      servicios: body.servicios,
      advertencia: '⚠️ REINICIAR LA APLICACIÓN para que la cola se registre en Bull',
    };
  }

  @Get('colas-hilos')
  @ApiOperation({ summary: 'Listar todas las colas hilos' })
  async obtenerTodasLasColasHilos() {
    const colasHilos = await this.colaConfigService.obtenerTodasLasColasHilos();
    const stats = await this.balanceadorCargaService.obtenerEstadisticasTodasLasColasHilos();

    return {
      mensaje: 'Colas hilos activas',
      totalColasHilos: colasHilos.length,
      colasHilos: stats,
    };
  }

  @Get('colas-hilos/:nombre')
  @ApiOperation({ summary: 'Obtener cola hilos específica' })
  async obtenerColaHilos(@Param('nombre') nombreColaHilos: string) {
    const config = await this.colaConfigService.obtenerConfigColaHilos(nombreColaHilos);
    
    if (!config) {
      return {
        error: `Cola hilos ${nombreColaHilos} no encontrada`,
        nombreColaHilos,
      };
    }

    const todasLasStats = await this.balanceadorCargaService.obtenerEstadisticasTodasLasColasHilos();
    const stats = todasLasStats.find(stat => stat.nombreColaHilos === nombreColaHilos);

    const cola = this.procesadorColaGenerica.obtenerCola(nombreColaHilos);
    const estaRegistradaFisicamente = !!cola;

    return {
      nombreColaHilos: config.nombreColaHilos,
      hilos: config.hilosColaHilos,
      serviciosAsignados: config.serviciosAsignados,
      habilitada: config.habilitada,
      registradaFisicamente: estaRegistradaFisicamente,
      estadisticas: stats || null,
      advertencia: !estaRegistradaFisicamente ? 'Cola definida en JSON pero no registrada en Bull (reiniciar app)' : undefined,
    };
  }

  @Put('colas-hilos/:nombre/servicios')
  @ApiOperation({ summary: 'Actualizar servicios asignados' })
  async actualizarServiciosColaHilos(
    @Param('nombre') nombreColaHilos: string,
    @Body() body: { servicios: string[] }
  ) {
    await this.colaConfigService.actualizarServiciosColaHilos(nombreColaHilos, body.servicios);

    return {
      mensaje: `Servicios de ${nombreColaHilos} actualizados`,
      nombreColaHilos,
      nuevosServicios: body.servicios,
      nota: 'Cambios aplicados inmediatamente (no requiere reinicio)',
    };
  }

  @Put('colas-hilos/:nombre/hilos')
  @ApiOperation({ summary: 'Actualizar hilos (pausa/reanuda pero requiere reinicio para cambiar workers)' })
  async actualizarHilosColaHilos(
    @Param('nombre') nombreColaHilos: string,
    @Body() body: { hilos: number }
  ) {
    await this.colaConfigService.actualizarHilosColaHilos(nombreColaHilos, body.hilos);
    
    this.procesadorColaGenerica.actualizarHilosColaHilos(nombreColaHilos, body.hilos)
      .catch(error => console.error('Error cambiando worker:', error));
  
    return {
      mensaje: `Hilos de ${nombreColaHilos} actualizados`,
      nombreColaHilos,
      nuevosHilos: body.hilos,
      nota: '✅ Cambio aplicándose en background (~1-2 segundos)',
    };
  }

  @Delete('colas-hilos/:nombre')
  @ApiOperation({ summary: 'Eliminar cola hilos (REQUIERE REINICIO)' })
  async eliminarColaHilos(@Param('nombre') nombreColaHilos: string) {
    await this.colaConfigService.eliminarColaHilos(nombreColaHilos);

    return {
      mensaje: `Cola hilos ${nombreColaHilos} eliminada del JSON`,
      nombreColaHilos,
      advertencia: '⚠️ REINICIAR LA APLICACIÓN para desregistrar la cola de Bull',
    };
  }

  @Get('colas-hilos/:nombre/trabajos')
  @ApiOperation({ summary: 'Ver trabajos de una cola hilos específica' })
  async obtenerTrabajosColaHilos(@Param('nombre') nombreColaHilos: string) {
    try {
      const cola = this.procesadorColaGenerica.obtenerCola(nombreColaHilos);
      
      if (!cola) {
        return {
          error: `Cola hilos ${nombreColaHilos} no está registrada físicamente`,
          nombreColaHilos,
          sugerencia: 'Reiniciar la aplicación si fue creada recientemente',
        };
      }

      const esperando = await cola.getWaiting();
      const activos = await cola.getActive();
      const completados = await cola.getCompleted();
      const fallidos = await cola.getFailed();

      return {
        nombreColaHilos,
        esperando: esperando.length,
        activos: activos.length,
        completados: completados.length,
        fallidos: fallidos.length,
        trabajos: {
          esperando: esperando.slice(0, 10).map(trabajo => ({
            id: trabajo.id,
            nombreServicio: trabajo.data.nombreServicio,
            operacion: trabajo.data.operacion,
          })),
          activos: activos.map(trabajo => ({
            id: trabajo.id,
            nombreServicio: trabajo.data.nombreServicio,
            operacion: trabajo.data.operacion,
          })),
        },
      };
    } catch (error) {
      return {
        nombreColaHilos,
        error: 'Error obteniendo trabajos',
        detalles: error.message,
      };
    }
  }

  @Get('trabajo/:idTrabajo')
  @ApiOperation({ summary: 'Consultar estado de un trabajo específico' })
  async obtenerEstadoTrabajo(@Param('idTrabajo') idTrabajo: string) {
    const colasHilos = await this.colaConfigService.obtenerTodasLasColasHilos();

    for (const ch of colasHilos) {
      const cola = this.procesadorColaGenerica.obtenerCola(ch.nombreColaHilos);
      if (!cola) continue;

      try {
        const trabajo = await cola.getJob(idTrabajo);

        if (trabajo) {
          let estado: string;
          let resultado: any = null;

          if (trabajo.finishedOn) {
            estado = 'completado';
            resultado = trabajo.returnvalue;
          } else if (trabajo.failedReason) {
            estado = 'fallido';
            resultado = { error: trabajo.failedReason };
          } else if (trabajo.processedOn) {
            estado = 'procesando';
          } else {
            estado = 'pendiente';
          }

          return {
            idTrabajo,
            colaHilos: ch.nombreColaHilos,
            nombreServicio: trabajo.data.nombreServicio,
            operacion: trabajo.data.operacion,
            estado,
            resultado,
          };
        }
      } catch (error) {
        continue;
      }
    }

    return {
      idTrabajo,
      estado: 'no_encontrado',
      mensaje: 'Trabajo no encontrado en ninguna cola hilos',
    };
  }

  // ============ BALANCEADOR DE CARGA ============

  @Get('balanceador/estado')
  @ApiOperation({ summary: 'Ver estado del balanceador de carga' })
  async obtenerEstadoBalanceador() {
    return await this.balanceadorCargaService.obtenerEstadoBalanceador();
  }

  @Get('balanceador/servicio/:nombreServicio')
  @ApiOperation({ summary: 'Ver a qué cola hilos se asignaría un servicio' })
  async obtenerAsignacionServicio(@Param('nombreServicio') nombreServicio: string) {
    const asignacion = await this.balanceadorCargaService.seleccionarColaHilos(nombreServicio);

    if (!asignacion) {
      return {
        nombreServicio,
        asignacion: 'SÍNCRONO',
        mensaje: 'El servicio está configurado para procesamiento síncrono',
      };
    }

    return {
      nombreServicio,
      asignacion: asignacion.nombreColaHilos,
      razon: asignacion.razon,
      estadisticas: {
        trabajosEsperando: asignacion.trabajosEsperando,
        trabajosActivos: asignacion.trabajosActivos,
        trabajosTotales: asignacion.trabajosTotales,
      },
    };
  }

  // ============ CONFIGURACIÓN RÁPIDA ============

  @Post('colas-hilos/configurar/defecto')
  @ApiOperation({ summary: 'Configuración inicial: 2 colas hilos (REQUIERE REINICIO)' })
  async configurarColasHilosPorDefecto() {
    await this.colaConfigService.crearColaHilos(
      'cola-hilos-1',
      1,
      ['carrera', 'estudiante', 'inscripcion', 'detalle-inscripcion']
    );

    await this.colaConfigService.crearColaHilos(
      'cola-hilos-2',
      1,
      ['*']
    );

    return {
      mensaje: 'Configuración inicial completada',
      colasHilos: [
        {
          nombre: 'cola-hilos-1',
          hilos: 1,
          servicios: ['carrera', 'estudiante', 'inscripcion', 'detalle-inscripcion'],
        },
        {
          nombre: 'cola-hilos-2',
          hilos: 1,
          servicios: ['*'],
        },
      ],
      advertencia: '⚠️ REINICIAR LA APLICACIÓN para activar las colas',
      proximosPasos: [
        '1. Reiniciar aplicación',
        '2. Configurar servicios en modo cola: POST /api/cola/config/todos/cola',
        '3. Monitorear: GET /api/cola/balanceador/estado',
      ],
    };
  }

  // ============ ESTADÍSTICAS ============

  @Get('estadisticas/todas')
  @ApiOperation({ summary: 'Estadísticas globales de todas las colas hilos' })
  async obtenerTodasLasEstadisticas() {
    const colasHilos = await this.colaConfigService.obtenerTodasLasColasHilos();
    const todasLasStats = await this.balanceadorCargaService.obtenerEstadisticasTodasLasColasHilos();

    const totales = {
      totalEsperando: 0,
      totalActivos: 0,
      totalCompletados: 0,
      totalFallidos: 0,
    };

    todasLasStats.forEach(stat => {
      totales.totalEsperando += stat.trabajosEsperando;
      totales.totalActivos += stat.trabajosActivos;
      totales.totalCompletados += stat.trabajosCompletados;
      totales.totalFallidos += stat.trabajosFallidos;
    });

    return {
      totalColasHilos: colasHilos.length,
      ...totales,
      colasHilos: todasLasStats,
    };
  }
}