import { Injectable, OnModuleInit } from '@nestjs/common';
import { UniversalWorker } from '../workers/universal.worker';

@Injectable()
export class ServiceRegistryService implements OnModuleInit {
  constructor(private universalWorker: UniversalWorker) {}

  async onModuleInit() {
    console.log('📋 ServiceRegistry initialized - Services will register themselves');
  }

  // Método para registrar servicios manualmente
  registerService(name: string, service: any) {
    this.universalWorker.registerService(name, service);
    console.log(`✅ Manual registration: ${name}`);
  }

  // Obtener servicios registrados
  getRegisteredServices(): string[] {
    return this.universalWorker.getRegisteredServices();
  }

  // Método para que otros servicios se auto-registren
  autoRegister(serviceName: string, serviceInstance: any) {
    this.universalWorker.registerService(serviceName, serviceInstance);
    console.log(`🔄 Auto-registered: ${serviceName}`);
  }
}
/* import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { UniversalWorker } from '../workers/universal.worker';

@Injectable()
export class ServiceRegistryService implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
    private universalWorker: UniversalWorker,
  ) {}

  async onModuleInit() {
    // Esperar un poco para que todos los módulos se inicialicen
    setTimeout(async () => {
      await this.registerServices();
    }, 2000);
  }

  private async registerServices() {
    console.log('🔧 Registering services in UniversalWorker...');

    // Lista de servicios a registrar con sus clases reales
    const servicesToRegister = [
      { name: 'carrera', serviceClass: 'CarreraService' },
      { name: 'estudiante', serviceClass: 'EstudianteService' },
      { name: 'materia', serviceClass: 'MateriaService' },
      { name: 'plan-estudio', serviceClass: 'PlanEstudioService' },
      { name: 'grupo-materia', serviceClass: 'GrupoMateriaService' },
      { name: 'docente', serviceClass: 'DocenteService' },
      { name: 'inscripcion', serviceClass: 'InscripcionService' },
      { name: 'nota', serviceClass: 'NotaService' },
      { name: 'nivel', serviceClass: 'NivelService' },
      { name: 'grupo', serviceClass: 'GrupoService' },
      { name: 'periodo', serviceClass: 'PeriodoService' },
      { name: 'gestion', serviceClass: 'GestionService' },
    ];

    for (const { name, serviceClass } of servicesToRegister) {
      try {
        // Intentar obtener el servicio usando diferentes métodos
        let service = null;
        
        try {
          // Primer intento: por nombre de clase
          service = this.moduleRef.get(serviceClass, { strict: false });
        } catch (error) {
          // Segundo intento: buscar en todos los módulos
          try {
            service = await this.moduleRef.resolve(serviceClass);
          } catch (resolveError) {
            console.log(`⚠️ ${serviceClass} not found or not available yet`);
            continue;
          }
        }

        if (service && typeof service === 'object') {
          // Verificar que el servicio tiene los métodos necesarios
          const hasRequiredMethods = ['create', 'findAll', 'findOne', 'update', 'remove'].some(
            method => typeof service[method] === 'function'
          );

          if (hasRequiredMethods) {
            this.universalWorker.registerService(name, service);
            console.log(`✅ ${serviceClass} registered as '${name}'`);
          } else {
            console.log(`⚠️ ${serviceClass} found but missing required methods`);
          }
        }
      } catch (error) {
        console.log(`❌ Failed to register ${serviceClass}: ${error.message}`);
      }
    }

    console.log('🎯 Service registration completed');
    
    // Mostrar servicios registrados
    const registeredServices = this.universalWorker.getRegisteredServices();
    console.log(`📋 Registered services: ${registeredServices.join(', ')}`);
  }

  // Método para registrar servicios manualmente
  registerService(name: string, service: any) {
    this.universalWorker.registerService(name, service);
    console.log(`✅ Manual registration: ${name}`);
  }

  // Obtener servicios registrados
  getRegisteredServices(): string[] {
    return this.universalWorker.getRegisteredServices();
  }
} */