import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

// ✅ SOLO AGREGAR "export" a las interfaces existentes
export interface ServiceConfig {
  enabled: boolean;
  operations: string[];
  workers: number;
  description?: string;
}

export interface QueueConfig {
  services: Record<string, ServiceConfig>;
  global: {
    defaultWorkers: number;
    maxRetries: number;
    retryDelay: number;
  };
}

@Injectable()
export class QueueConfigService {
  private config: QueueConfig;
  private configPath = path.join(process.cwd(), 'config', 'queue-config.json');
  private availableServices = new Set<string>();
  private availableOperations = new Set<string>(['create', 'update', 'delete', 'findAll', 'findOne']);

  constructor() {
    this.ensureConfigDirectory();
    this.loadConfig();
  }

  private ensureConfigDirectory() {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
  }

  private loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      } else {
        this.config = this.getDefaultConfig();
        this.saveConfig();
      }
    } catch (error) {
      console.error('Error loading queue config:', error);
      this.config = this.getDefaultConfig();
    }
  }

  private getDefaultConfig(): QueueConfig {
    return {
      services: {
        carrera: {
          enabled: false,
          operations: ['create', 'update', 'delete', 'findAll', 'findOne'],
          workers: 2,
          description: 'Gestión de carreras académicas'
        }
      },
      global: {
        defaultWorkers: 1,
        maxRetries: 3,
        retryDelay: 5000
      }
    };
  }

  private saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving queue config:', error);
    }
  }

  registerService(serviceName: string): void {
    this.availableServices.add(serviceName);
    
    if (!this.config.services[serviceName]) {
      this.config.services[serviceName] = {
        enabled: false,
        operations: Array.from(this.availableOperations),
        workers: this.config.global.defaultWorkers,
        description: `Gestión de ${serviceName}`
      };
      this.saveConfig();
      console.log(`📋 Service '${serviceName}' auto-registered`);
    }
  }

  isQueueEnabled(resource: string, operation: string): boolean {
    const serviceConfig = this.config.services[resource];
    return serviceConfig?.enabled && serviceConfig.operations.includes(operation);
  }

  getWorkerCount(resource: string): number {
    return this.config.services[resource]?.workers || this.config.global.defaultWorkers;
  }

  getServiceConfig(serviceName: string): ServiceConfig | null {
    return this.config.services[serviceName] || null;
  }

  updateServiceConfig(
    serviceName: string,
    enabled: boolean,
    operations: string[],
    workers: number,
  ) {
    if (!this.config.services[serviceName]) {
      this.config.services[serviceName] = {
        enabled,
        operations,
        workers,
        description: `Gestión de ${serviceName}`
      };
    } else {
      this.config.services[serviceName].enabled = enabled;
      this.config.services[serviceName].operations = operations;
      this.config.services[serviceName].workers = workers;
    }

    this.saveConfig();
    return {
      message: `Configuración de ${serviceName} actualizada`,
      config: this.config.services[serviceName]
    };
  }

  toggleService(serviceName: string) {
    if (this.config.services[serviceName]) {
      this.config.services[serviceName].enabled = !this.config.services[serviceName].enabled;
      this.saveConfig();
      
      return {
        message: `Servicio ${serviceName} ${this.config.services[serviceName].enabled ? 'habilitado' : 'deshabilitado'}`,
        enabled: this.config.services[serviceName].enabled
      };
    }
    
    throw new Error(`Servicio ${serviceName} no encontrado`);
  }

  toggleOperation(serviceName: string, operation: string) {
    const serviceConfig = this.config.services[serviceName];
    if (!serviceConfig) {
      throw new Error(`Servicio ${serviceName} no encontrado`);
    }

    const operationIndex = serviceConfig.operations.indexOf(operation);
    if (operationIndex > -1) {
      serviceConfig.operations.splice(operationIndex, 1);
    } else {
      serviceConfig.operations.push(operation);
    }

    this.saveConfig();
    
    return {
      message: `Operación ${operation} ${operationIndex > -1 ? 'deshabilitada' : 'habilitada'} para ${serviceName}`,
      operations: serviceConfig.operations
    };
  }

  getAvailableServices() {
    return {
      registered: Array.from(this.availableServices),
      configured: Object.keys(this.config.services),
      operations: Array.from(this.availableOperations)
    };
  }

  reloadConfig() {
    this.loadConfig();
    return {
      message: 'Configuración recargada',
      config: this.config
    };
  }

  getConfig() {
    return this.config;
  }

  getStats() {
    const stats = {
      totalServices: Object.keys(this.config.services).length,
      enabledServices: 0,
      totalWorkers: 0,
      serviceDetails: {} as Record<string, any>
    };

    Object.entries(this.config.services).forEach(([name, config]) => {
      if (config.enabled) {
        stats.enabledServices++;
        stats.totalWorkers += config.workers;
      }
      
      stats.serviceDetails[name] = {
        enabled: config.enabled,
        operationsCount: config.operations.length,
        workers: config.workers
      };
    });

    return stats;
  }
}