import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { watch } from 'fs';

export interface ConfiguracionServicio {
  usarCola: boolean;
  estaPausado: boolean;
}

export interface ConfiguracionColaHilos {
  habilitada: boolean;
  hilos: number;
  serviciosAsignados: string[];
  descripcion: string;
  creadoEn: string;
}

export interface DatosConfiguracionCola {
  version: string;
  ultimaActualizacion: string;
  metadatos: {
    totalServicios: number;
    totalColasHilos: number;
    hilosPorDefecto: number;
  };
  servicios: Record<string, ConfiguracionServicio>;
  colasHilos: Record<string, ConfiguracionColaHilos>;
}

@Injectable()
export class ColaConfigService implements OnModuleInit {
  private readonly logger = new Logger(ColaConfigService.name);
  private readonly rutaConfig = path.join(process.cwd(), 'src', 'cola', 'cola-config.json');
  private config: DatosConfiguracionCola;
  private estaEscribiendo = false;

  constructor() {}

  async onModuleInit() {
    this.logger.log('🚀 Iniciando ColaConfigService...');
    await this.cargarConfigDesdeJson();
    this.configurarObservadorArchivo();
    this.logger.log(`✅ ${Object.keys(this.config.servicios).length} servicios, ${Object.keys(this.config.colasHilos).length} colas hilos`);
  }

  private async cargarConfigDesdeJson(): Promise<void> {
    try {
      if (!fs.existsSync(this.rutaConfig)) {
        await this.crearConfigJsonPorDefecto();
      }
      this.config = JSON.parse(fs.readFileSync(this.rutaConfig, 'utf8'));
      this.validarConfigJson();
    } catch (error) {
      this.logger.error('❌ Error cargando config:', error.message);
      await this.crearConfigEmergencia();
    }
  }

  private async crearConfigJsonPorDefecto(): Promise<void> {
    const dirConfig = path.dirname(this.rutaConfig);
    if (!fs.existsSync(dirConfig)) {
      fs.mkdirSync(dirConfig, { recursive: true });
    }

    const configPorDefecto: DatosConfiguracionCola = {
      version: "1.0.0",
      ultimaActualizacion: new Date().toISOString(),
      metadatos: { totalServicios: 18, totalColasHilos: 2, hilosPorDefecto: 1 },
      servicios: {
        "carrera": { usarCola: true, estaPausado: false },
        "plan-estudio": { usarCola: true, estaPausado: false },
        "estudiante": { usarCola: true, estaPausado: false },
        "inscripcion": { usarCola: true, estaPausado: false },
        "detalle-inscripcion": { usarCola: true, estaPausado: false },
        "aula": { usarCola: true, estaPausado: false },
        "boleta-horario": { usarCola: true, estaPausado: false },
        "docente": { usarCola: true, estaPausado: false },
        "gestion": { usarCola: true, estaPausado: false },
        "grupo": { usarCola: true, estaPausado: false },
        "grupo-materia": { usarCola: true, estaPausado: false },
        "horario": { usarCola: true, estaPausado: false },
        "materia": { usarCola: true, estaPausado: false },
        "modulo": { usarCola: true, estaPausado: false },
        "nivel": { usarCola: true, estaPausado: false },
        "nota": { usarCola: true, estaPausado: false },
        "periodo": { usarCola: true, estaPausado: false },
        "prerequisito": { usarCola: true, estaPausado: false }
      },
      colasHilos: {
        "cola-hilos-1": {
          habilitada: true,
          hilos: 1,
          serviciosAsignados: ["carrera", "estudiante", "inscripcion", "detalle-inscripcion"],
          descripcion: "Cola prioritaria",
          creadoEn: new Date().toISOString()
        },
        "cola-hilos-2": {
          habilitada: true,
          hilos: 1,
          serviciosAsignados: ["*"],
          descripcion: "Cola general",
          creadoEn: new Date().toISOString()
        }
      }
    };

    await this.escribirConfigEnJson(configPorDefecto);
    this.config = configPorDefecto;
  }

  private async crearConfigEmergencia(): Promise<void> {
    this.config = {
      version: "emergency",
      ultimaActualizacion: new Date().toISOString(),
      metadatos: { totalServicios: 0, totalColasHilos: 0, hilosPorDefecto: 1 },
      servicios: {},
      colasHilos: {}
    };
  }

  private validarConfigJson(): void {
    if (!this.config.version || !this.config.servicios || !this.config.colasHilos) {
      throw new Error('Estructura inválida');
    }
  }

  private async escribirConfigEnJson(config: DatosConfiguracionCola): Promise<void> {
    if (this.estaEscribiendo) {
      await new Promise(resolve => setTimeout(resolve, 50));
      return this.escribirConfigEnJson(config);
    }

    this.estaEscribiendo = true;
    try {
      config.ultimaActualizacion = new Date().toISOString();
      config.metadatos.totalServicios = Object.keys(config.servicios).length;
      config.metadatos.totalColasHilos = Object.keys(config.colasHilos).length;

      const rutaTemporal = this.rutaConfig + '.tmp';
      fs.writeFileSync(rutaTemporal, JSON.stringify(config, null, 2));
      fs.renameSync(rutaTemporal, this.rutaConfig);
    } finally {
      this.estaEscribiendo = false;
    }
  }

  private configurarObservadorArchivo(): void {
    try {
      watch(this.rutaConfig, { persistent: false }, (tipoEvento) => {
        if (tipoEvento === 'change' && !this.estaEscribiendo) {
          setTimeout(() => this.cargarConfigDesdeJson(), 100);
        }
      });
    } catch (error) {
      this.logger.warn('⚠️ File watcher no disponible');
    }
  }

  // ============ SERVICIOS ============
  
  async obtenerConfigServicio(nombreServicio: string): Promise<{ usarCola: boolean; estaPausado: boolean }> {
    return this.config.servicios[nombreServicio] || { usarCola: false, estaPausado: false };
  }

  async establecerModoColaServicio(nombreServicio: string, usarCola: boolean): Promise<void> {
    if (!this.config.servicios[nombreServicio]) {
      this.config.servicios[nombreServicio] = { usarCola, estaPausado: false };
    } else {
      this.config.servicios[nombreServicio].usarCola = usarCola;
    }
    await this.escribirConfigEnJson(this.config);
  }

  async pausarCola(nombreServicio: string): Promise<void> {
    if (this.config.servicios[nombreServicio]) {
      this.config.servicios[nombreServicio].estaPausado = true;
      await this.escribirConfigEnJson(this.config);
    }
  }

  async reanudarCola(nombreServicio: string): Promise<void> {
    if (this.config.servicios[nombreServicio]) {
      this.config.servicios[nombreServicio].estaPausado = false;
      await this.escribirConfigEnJson(this.config);
    }
  }

  async estaColaPausada(nombreServicio: string): Promise<boolean> {
    return this.config.servicios[nombreServicio]?.estaPausado || false;
  }

  async obtenerTodosLosServiciosConfig(): Promise<Array<{ nombreServicio: string; usarCola: boolean; estaPausado: boolean }>> {
    return Object.entries(this.config.servicios).map(([nombreServicio, config]) => ({
      nombreServicio,
      usarCola: config.usarCola,
      estaPausado: config.estaPausado,
    }));
  }

  async deberiaUsarCola(nombreServicio: string): Promise<boolean> {
    return this.config.servicios[nombreServicio]?.usarCola || false;
  }

  // ============ COLAS HIJO ============

  async crearColaHilos(nombreColaHilos: string, hilos: number, servicios: string[]): Promise<void> {
    this.config.colasHilos[nombreColaHilos] = {
      habilitada: hilos > 0,
      hilos,
      serviciosAsignados: servicios,
      descripcion: `Cola hilos con ${hilos} workers`,
      creadoEn: new Date().toISOString()
    };
    await this.escribirConfigEnJson(this.config);
  }

  async eliminarColaHilos(nombreColaHilos: string): Promise<void> {
    delete this.config.colasHilos[nombreColaHilos];
    await this.escribirConfigEnJson(this.config);
  }

  async actualizarServiciosColaHilos(nombreColaHilos: string, servicios: string[]): Promise<void> {
    if (this.config.colasHilos[nombreColaHilos]) {
      this.config.colasHilos[nombreColaHilos].serviciosAsignados = servicios;
      await this.escribirConfigEnJson(this.config);
    }
  }

  async actualizarHilosColaHilos(nombreColaHilos: string, hilos: number): Promise<void> {
    if (this.config.colasHilos[nombreColaHilos]) {
      this.config.colasHilos[nombreColaHilos].hilos = hilos;
      await this.escribirConfigEnJson(this.config);
    }
  }

  async obtenerTodasLasColasHilos(): Promise<any[]> {
    return Object.entries(this.config.colasHilos).map(([nombreColaHilos, config]) => ({
      nombreColaHilos,
      hilosColaHilos: config.hilos,
      serviciosAsignados: config.serviciosAsignados,
      habilitada: config.habilitada,
      descripcion: config.descripcion,
      creadoEn: config.creadoEn
    }));
  }

  async obtenerConfigColaHilos(nombreColaHilos: string): Promise<any | null> {
    const config = this.config.colasHilos[nombreColaHilos];
    return config ? {
      nombreColaHilos,
      hilosColaHilos: config.hilos,
      serviciosAsignados: config.serviciosAsignados,
      habilitada: config.habilitada,
      descripcion: config.descripcion,
      creadoEn: config.creadoEn
    } : null;
  }

  async obtenerColasHilosParaServicio(nombreServicio: string): Promise<any[]> {
    return Object.entries(this.config.colasHilos)
      .filter(([_, config]) => 
        config.habilitada && 
        (config.serviciosAsignados.includes(nombreServicio) || config.serviciosAsignados.includes('*'))
      )
      .map(([nombreColaHilos, config]) => ({
        nombreColaHilos,
        hilosColaHilos: config.hilos,
        serviciosAsignados: config.serviciosAsignados
      }));
  }

  async tieneColasHilos(): Promise<boolean> {
    return Object.keys(this.config.colasHilos).length > 0;
  }

  obtenerConfigCompleta(): DatosConfiguracionCola {
    return { ...this.config };
  }
}