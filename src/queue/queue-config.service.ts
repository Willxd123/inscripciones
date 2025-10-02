import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { watch } from 'fs';

export interface ServiceConfig {
  useQueue: boolean;
  isPaused: boolean;
}

export interface WorkerQueueConfig {
  enabled: boolean;
  concurrency: number;
  assignedServices: string[];
  description: string;
  createdAt: string;
}

export interface QueueConfigData {
  version: string;
  lastUpdated: string;
  metadata: {
    totalServices: number;
    totalWorkerQueues: number;
    defaultConcurrency: number;
  };
  services: Record<string, ServiceConfig>;
  workerQueues: Record<string, WorkerQueueConfig>;
}

@Injectable()
export class QueueConfigService implements OnModuleInit {
  private readonly logger = new Logger(QueueConfigService.name);
  private readonly configPath = path.join(process.cwd(), 'src', 'queue', 'queue-config.json');
  private config: QueueConfigData;
  private isWriting = false;

  constructor() {}

  async onModuleInit() {
    this.logger.log('🚀 Iniciando QueueConfigService...');
    await this.loadConfigFromJson();
    this.setupFileWatcher();
    this.logger.log(`✅ ${Object.keys(this.config.services).length} servicios, ${Object.keys(this.config.workerQueues).length} worker queues`);
  }

  private async loadConfigFromJson(): Promise<void> {
    try {
      if (!fs.existsSync(this.configPath)) {
        await this.createDefaultJsonConfig();
      }
      this.config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      this.validateJsonConfig();
    } catch (error) {
      this.logger.error('❌ Error cargando config:', error.message);
      await this.createEmergencyConfig();
    }
  }

  private async createDefaultJsonConfig(): Promise<void> {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const defaultConfig: QueueConfigData = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      metadata: { totalServices: 18, totalWorkerQueues: 2, defaultConcurrency: 1 },
      services: {
        "carrera": { useQueue: true, isPaused: false },
        "plan-estudio": { useQueue: true, isPaused: false },
        "estudiante": { useQueue: true, isPaused: false },
        "inscripcion": { useQueue: true, isPaused: false },
        "detalle-inscripcion": { useQueue: true, isPaused: false },
        "aula": { useQueue: true, isPaused: false },
        "boleta-horario": { useQueue: true, isPaused: false },
        "docente": { useQueue: true, isPaused: false },
        "gestion": { useQueue: true, isPaused: false },
        "grupo": { useQueue: true, isPaused: false },
        "grupo-materia": { useQueue: true, isPaused: false },
        "horario": { useQueue: true, isPaused: false },
        "materia": { useQueue: true, isPaused: false },
        "modulo": { useQueue: true, isPaused: false },
        "nivel": { useQueue: true, isPaused: false },
        "nota": { useQueue: true, isPaused: false },
        "periodo": { useQueue: true, isPaused: false },
        "prerequisito": { useQueue: true, isPaused: false }
      },
      workerQueues: {
        "worker-queue-1": {
          enabled: true,
          concurrency: 1,
          assignedServices: ["carrera", "estudiante", "inscripcion", "detalle-inscripcion"],
          description: "Cola prioritaria",
          createdAt: new Date().toISOString()
        },
        "worker-queue-2": {
          enabled: true,
          concurrency: 1,
          assignedServices: ["*"],
          description: "Cola general",
          createdAt: new Date().toISOString()
        }
      }
    };

    await this.writeConfigToJson(defaultConfig);
    this.config = defaultConfig;
  }

  private async createEmergencyConfig(): Promise<void> {
    this.config = {
      version: "emergency",
      lastUpdated: new Date().toISOString(),
      metadata: { totalServices: 0, totalWorkerQueues: 0, defaultConcurrency: 1 },
      services: {},
      workerQueues: {}
    };
  }

  private validateJsonConfig(): void {
    if (!this.config.version || !this.config.services || !this.config.workerQueues) {
      throw new Error('Estructura inválida');
    }
  }

  private async writeConfigToJson(config: QueueConfigData): Promise<void> {
    if (this.isWriting) {
      await new Promise(resolve => setTimeout(resolve, 50));
      return this.writeConfigToJson(config);
    }

    this.isWriting = true;
    try {
      config.lastUpdated = new Date().toISOString();
      config.metadata.totalServices = Object.keys(config.services).length;
      config.metadata.totalWorkerQueues = Object.keys(config.workerQueues).length;

      const tempPath = this.configPath + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(config, null, 2));
      fs.renameSync(tempPath, this.configPath);
    } finally {
      this.isWriting = false;
    }
  }

  private setupFileWatcher(): void {
    try {
      watch(this.configPath, { persistent: false }, (eventType) => {
        if (eventType === 'change' && !this.isWriting) {
          setTimeout(() => this.loadConfigFromJson(), 100);
        }
      });
    } catch (error) {
      this.logger.warn('⚠️ File watcher no disponible');
    }
  }

  // ============ SERVICIOS ============
  
  async getServiceConfig(serviceName: string): Promise<{ useQueue: boolean; isPaused: boolean }> {
    return this.config.services[serviceName] || { useQueue: false, isPaused: false };
  }

  async setServiceQueueMode(serviceName: string, useQueue: boolean): Promise<void> {
    if (!this.config.services[serviceName]) {
      this.config.services[serviceName] = { useQueue, isPaused: false };
    } else {
      this.config.services[serviceName].useQueue = useQueue;
    }
    await this.writeConfigToJson(this.config);
  }

  async pauseQueue(serviceName: string): Promise<void> {
    if (this.config.services[serviceName]) {
      this.config.services[serviceName].isPaused = true;
      await this.writeConfigToJson(this.config);
    }
  }

  async resumeQueue(serviceName: string): Promise<void> {
    if (this.config.services[serviceName]) {
      this.config.services[serviceName].isPaused = false;
      await this.writeConfigToJson(this.config);
    }
  }

  async isQueuePaused(serviceName: string): Promise<boolean> {
    return this.config.services[serviceName]?.isPaused || false;
  }

  async getAllServicesConfig(): Promise<Array<{ serviceName: string; useQueue: boolean; isPaused: boolean }>> {
    return Object.entries(this.config.services).map(([serviceName, config]) => ({
      serviceName,
      useQueue: config.useQueue,
      isPaused: config.isPaused,
    }));
  }

  async shouldUseQueue(serviceName: string): Promise<boolean> {
    return this.config.services[serviceName]?.useQueue || false;
  }

  // ============ WORKER QUEUES ============

  async createWorkerQueue(workerQueueName: string, concurrency: number, services: string[]): Promise<void> {
    this.config.workerQueues[workerQueueName] = {
      enabled: concurrency > 0,
      concurrency,
      assignedServices: services,
      description: `Worker queue con ${concurrency} workers`,
      createdAt: new Date().toISOString()
    };
    await this.writeConfigToJson(this.config);
  }

  async removeWorkerQueue(workerQueueName: string): Promise<void> {
    delete this.config.workerQueues[workerQueueName];
    await this.writeConfigToJson(this.config);
  }

  async updateWorkerQueueServices(workerQueueName: string, services: string[]): Promise<void> {
    if (this.config.workerQueues[workerQueueName]) {
      this.config.workerQueues[workerQueueName].assignedServices = services;
      await this.writeConfigToJson(this.config);
    }
  }

  async updateWorkerQueueConcurrency(workerQueueName: string, concurrency: number): Promise<void> {
    if (this.config.workerQueues[workerQueueName]) {
      this.config.workerQueues[workerQueueName].concurrency = concurrency;
      //this.config.workerQueues[workerQueueName].enabled = concurrency > 0;
      await this.writeConfigToJson(this.config);
    }
  }

  async getAllWorkerQueues(): Promise<any[]> {
    return Object.entries(this.config.workerQueues).map(([workerQueueName, config]) => ({
      workerQueueName,
      workerQueueConcurrency: config.concurrency,
      assignedServices: config.assignedServices,
      enabled: config.enabled,
      description: config.description,
      createdAt: config.createdAt
    }));
  }

  async getWorkerQueueConfig(workerQueueName: string): Promise<any | null> {
    const config = this.config.workerQueues[workerQueueName];
    return config ? {
      workerQueueName,
      workerQueueConcurrency: config.concurrency,
      assignedServices: config.assignedServices,
      enabled: config.enabled,
      description: config.description,
      createdAt: config.createdAt
    } : null;
  }

  async getWorkerQueuesForService(serviceName: string): Promise<any[]> {
    return Object.entries(this.config.workerQueues)
      .filter(([_, config]) => 
        config.enabled && 
     
        (config.assignedServices.includes(serviceName) || config.assignedServices.includes('*'))
      )
      .map(([workerQueueName, config]) => ({
        workerQueueName,
        workerQueueConcurrency: config.concurrency,
        assignedServices: config.assignedServices
      }));
  }

  async hasWorkerQueues(): Promise<boolean> {
    return Object.keys(this.config.workerQueues).length > 0;
  }

  getFullConfig(): QueueConfigData {
    return { ...this.config };
  }
}