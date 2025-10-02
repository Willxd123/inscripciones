import { Injectable, Logger } from '@nestjs/common';
import { ColaConfigService } from './cola-config.service';
import { ProcesadorColaGenerica } from './procesador-cola-generica.processor';

export interface ResultadoBalanceador {
  nombreColaHilos: string;
  trabajosEsperando: number;
  trabajosActivos: number;
  trabajosTotales: number;
  razon: string;
}

@Injectable()
export class BalanceadorCargaService {
  private readonly logger = new Logger(BalanceadorCargaService.name);

  constructor(
    private readonly colaConfigService: ColaConfigService,
    private readonly procesadorColaGenerica: ProcesadorColaGenerica,
  ) {}

  async seleccionarColaHilos(nombreServicio: string): Promise<ResultadoBalanceador | null> {
    const deberiaUsarCola = await this.colaConfigService.deberiaUsarCola(nombreServicio);
    
    if (!deberiaUsarCola) {
      this.logger.debug(`Servicio ${nombreServicio} configurado como SÍNCRONO`);
      return null;
    }

    const colasElegibles = await this.colaConfigService.obtenerColasHilosParaServicio(nombreServicio);

    if (colasElegibles.length === 0) {
      this.logger.warn(`No hay colas hilos disponibles para ${nombreServicio}`);
      return null;
    }

    const estadisticasColas = await Promise.all(
      colasElegibles.map(async (configCola) => {
        const stats = await this.obtenerEstadisticasColaHilos(configCola.nombreColaHilos);
        return { configCola, ...stats };
      })
    );

    const colaSeleccionada = estadisticasColas.reduce((menosCargada, actual) => {
      if (actual.trabajosEsperando < menosCargada.trabajosEsperando) {
        return actual;
      } else if (actual.trabajosEsperando === menosCargada.trabajosEsperando && actual.trabajosActivos < menosCargada.trabajosActivos) {
        return actual;
      }
      return menosCargada;
    });

    const resultado: ResultadoBalanceador = {
      nombreColaHilos: colaSeleccionada.configCola.nombreColaHilos,
      trabajosEsperando: colaSeleccionada.trabajosEsperando,
      trabajosActivos: colaSeleccionada.trabajosActivos,
      trabajosTotales: colaSeleccionada.trabajosTotales,
      razon: `Menos cargada entre ${estadisticasColas.length} colas hilos`,
    };

    this.logger.debug(
      `${nombreServicio} → ${resultado.nombreColaHilos} (esperando: ${resultado.trabajosEsperando}, activos: ${resultado.trabajosActivos})`
    );

    return resultado;
  }

  private async obtenerEstadisticasColaHilos(nombreColaHilos: string) {
    try {
      const cola = this.procesadorColaGenerica.obtenerCola(nombreColaHilos);
      
      if (!cola) {
        this.logger.warn(`Cola ${nombreColaHilos} no registrada físicamente`);
        return {
          trabajosEsperando: 0,
          trabajosActivos: 0,
          trabajosCompletados: 0,
          trabajosFallidos: 0,
          trabajosTotales: 0,
        };
      }

      const esperando = await cola.getWaiting();
      const activos = await cola.getActive();
      const completados = await cola.getCompleted();
      const fallidos = await cola.getFailed();

      return {
        trabajosEsperando: esperando.length,
        trabajosActivos: activos.length,
        trabajosCompletados: completados.length,
        trabajosFallidos: fallidos.length,
        trabajosTotales: esperando.length + activos.length + completados.length + fallidos.length,
      };
    } catch (error) {
      this.logger.error(`Error stats ${nombreColaHilos}:`, error.message);
      return {
        trabajosEsperando: 0,
        trabajosActivos: 0,
        trabajosCompletados: 0,
        trabajosFallidos: 0,
        trabajosTotales: 0,
      };
    }
  }

  async obtenerEstadisticasTodasLasColasHilos() {
    const todasLasColasHilos = await this.colaConfigService.obtenerTodasLasColasHilos();

    const stats = await Promise.all(
      todasLasColasHilos.map(async (configCola) => {
        const estadisticasCola = await this.obtenerEstadisticasColaHilos(configCola.nombreColaHilos);
        const cola = this.procesadorColaGenerica.obtenerCola(configCola.nombreColaHilos);
        const estaRegistradaFisicamente = !!cola;
        
        return {
          nombreColaHilos: configCola.nombreColaHilos,
          hilos: configCola.hilosColaHilos,
          serviciosAsignados: configCola.serviciosAsignados,
          habilitada: configCola.habilitada,
          registradaFisicamente: estaRegistradaFisicamente,
          ...estadisticasCola,
          porcentajeCarga: configCola.hilosColaHilos > 0 
            ? Math.round((estadisticasCola.trabajosActivos / configCola.hilosColaHilos) * 100)
            : 0,
          workersDisponibles: Math.max(0, configCola.hilosColaHilos - estadisticasCola.trabajosActivos),
          estado: configCola.hilosColaHilos === 0 
            ? '⏸️ PAUSADA' 
            : estaRegistradaFisicamente 
              ? '✅ ACTIVA' 
              : '⚠️ NO REGISTRADA',
        };
      })
    );

    return stats;
  }

  async obtenerEstadoBalanceador() {
    const todasLasStats = await this.obtenerEstadisticasTodasLasColasHilos();
    const totalEsperando = todasLasStats.reduce((sum, stat) => sum + stat.trabajosEsperando, 0);
    const totalActivos = todasLasStats.reduce((sum, stat) => sum + stat.trabajosActivos, 0);
    const totalHilos = todasLasStats.reduce((sum, stat) => sum + stat.hilos, 0);
    const totalWorkersDisponibles = todasLasStats.reduce((sum, stat) => sum + stat.workersDisponibles, 0);

    const colasActivas = todasLasStats.filter(s => s.estado === '✅ ACTIVA');
    const colasPausadas = todasLasStats.filter(s => s.estado === '⏸️ PAUSADA');
    const colasNoRegistradas = todasLasStats.filter(s => s.estado === '⚠️ NO REGISTRADA');

    return {
      totalColasHilos: todasLasStats.length,
      colasHilosActivas: colasActivas.length,
      colasHilosPausadas: colasPausadas.length,
      colasHilosNoRegistradas: colasNoRegistradas.length,
      totalTrabajosEsperando: totalEsperando,
      totalTrabajosActivos: totalActivos,
      totalHilos,
      totalWorkersDisponibles,
      cargaGeneral: totalHilos > 0 ? Math.round((totalActivos / totalHilos) * 100) : 0,
      colasHilos: todasLasStats,
      recomendaciones: this.generarRecomendaciones(todasLasStats),
      advertencias: this.generarAdvertencias(todasLasStats),
    };
  }

  private generarRecomendaciones(stats: any[]): string[] {
    const recomendaciones: string[] = [];

    const sobrecargadas = stats.filter(stat => stat.porcentajeCarga >= 90 && stat.estado === '✅ ACTIVA');
    if (sobrecargadas.length > 0) {
      recomendaciones.push(
        `Sobrecargadas (>90%): ${sobrecargadas.map(q => q.nombreColaHilos).join(', ')}`
      );
    }

    const subutilizadas = stats.filter(stat => stat.porcentajeCarga <= 10 && stat.hilos > 1 && stat.estado === '✅ ACTIVA');
    if (subutilizadas.length > 0) {
      recomendaciones.push(
        `Subutilizadas (<10%): ${subutilizadas.map(q => q.nombreColaHilos).join(', ')}`
      );
    }

    const conAcumulacion = stats.filter(stat => stat.trabajosEsperando > 10 && stat.estado === '✅ ACTIVA');
    if (conAcumulacion.length > 0) {
      recomendaciones.push(
        `Acumulación: ${conAcumulacion.map(q => `${q.nombreColaHilos} (${q.trabajosEsperando})`).join(', ')}`
      );
    }

    const inactivas = stats.filter(stat => stat.trabajosTotales === 0 && stat.hilos > 0 && stat.estado === '✅ ACTIVA');
    if (inactivas.length > 0) {
      recomendaciones.push(
        `Inactivas: ${inactivas.map(q => q.nombreColaHilos).join(', ')}`
      );
    }

    if (recomendaciones.length === 0) {
      recomendaciones.push('✅ Sistema balanceado');
    }

    return recomendaciones;
  }

  private generarAdvertencias(stats: any[]): string[] {
    const advertencias: string[] = [];

    const noRegistradas = stats.filter(s => s.estado === '⚠️ NO REGISTRADA');
    if (noRegistradas.length > 0) {
      advertencias.push(
        `⚠️ No registradas: ${noRegistradas.map(q => q.nombreColaHilos).join(', ')} - REINICIAR app`
      );
    }

    const pausadasConTrabajos = stats.filter(s => s.estado === '⏸️ PAUSADA' && (s.trabajosEsperando > 0 || s.trabajosActivos > 0));
    if (pausadasConTrabajos.length > 0) {
      advertencias.push(
        `⏸️ Pausadas con trabajos: ${pausadasConTrabajos.map(q => `${q.nombreColaHilos} (${q.trabajosEsperando + q.trabajosActivos})`).join(', ')}`
      );
    }

    const alMaximo = stats.filter(s => s.porcentajeCarga >= 100 && s.estado === '✅ ACTIVA');
    if (alMaximo.length > 0) {
      advertencias.push(
        `🔴 Al 100%: ${alMaximo.map(q => q.nombreColaHilos).join(', ')}`
      );
    }

    const colasActivas = stats.filter(s => s.estado === '✅ ACTIVA' && s.hilos > 0);
    if (colasActivas.length === 0) {
      advertencias.push('🔴 CRÍTICO: Sin colas hilos activas');
    }

    return advertencias;
  }
}