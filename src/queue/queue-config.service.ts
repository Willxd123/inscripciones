import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueueConfig } from './entities/queue-config.entity';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { GENERIC_QUEUE } from './generic-queue.processor';
import Redis from 'ioredis';

@Injectable()
export class QueueConfigService implements OnModuleInit {
  private redis: Redis;
  private queueRegistry: Map<string, Queue> = new Map();
  private readonly logger = new Logger(QueueConfigService.name);

  constructor(
    @InjectRepository(QueueConfig)
    private readonly queueConfigRepository: Repository<QueueConfig>,
    @InjectQueue(GENERIC_QUEUE) private readonly genericQueue: Queue,
  ) {
    // Conexión a Redis usando las variables de entorno
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    });
  }

  onModuleInit() {
    // Registrar la cola genérica para todos los servicios
    this.registerGenericQueue();
  }

  // Registrar la cola genérica para cualquier servicio
  private registerGenericQueue(): void {
    // Todos los servicios usarán la misma cola genérica
    // No necesitamos registrar colas específicas por servicio
    this.logger.log('Cola genérica registrada para todos los servicios');
  }

  // Registrar una cola para un servicio (mantenemos compatibilidad)
  registerQueue(serviceName: string, queue: Queue): void {
    this.queueRegistry.set(serviceName, queue);
  }

  // Obtener cola de un servicio - ahora siempre devuelve la cola genérica
  private getQueueForService(serviceName: string): Queue | null {
    return this.genericQueue;
  }

  // Obtener configuración de un servicio
  async getServiceConfig(serviceName: string): Promise<{ useQueue: boolean; isPaused: boolean }> {
    // Buscar en BD si usa colas
    let config = await this.queueConfigRepository.findOne({
      where: { serviceName },
    });

    // Si no existe, crear con valores por defecto
    if (!config) {
      config = this.queueConfigRepository.create({
        serviceName,
        useQueue: false,
      });
      await this.queueConfigRepository.save(config);
    }

    // Verificar si la cola está pausada en Redis
    const isPaused = await this.isQueuePaused(serviceName);

    return {
      useQueue: config.useQueue,
      isPaused,
    };
  }

  // Cambiar modo de un servicio (síncrono ↔ asíncrono)
  async setServiceQueueMode(serviceName: string, useQueue: boolean): Promise<void> {
    await this.queueConfigRepository.upsert({ serviceName, useQueue }, ['serviceName']);
  }

  // Pausar cola de un servicio (GENÉRICO)
  async pauseQueue(serviceName: string): Promise<void> {
    const key = `queue:${serviceName}:paused`;
    await this.redis.set(key, 'true');

    // Pausar la cola real de Bull (genérico)
    const queue = this.getQueueForService(serviceName);
    if (queue) {
      await queue.pause();
    }
  }

  // Reanudar cola de un servicio (GENÉRICO)
  async resumeQueue(serviceName: string): Promise<void> {
    const key = `queue:${serviceName}:paused`;
    await this.redis.del(key);

    // Reanudar la cola real de Bull (genérico)
    const queue = this.getQueueForService(serviceName);
    if (queue) {
      await queue.resume();
    }
  }

  // Verificar si una cola está pausada
  async isQueuePaused(serviceName: string): Promise<boolean> {
    const key = `queue:${serviceName}:paused`;
    const paused = await this.redis.get(key);
    return paused === 'true';
  }

  // Listar todos los servicios y su configuración
  async getAllServicesConfig(): Promise<Array<{ serviceName: string; useQueue: boolean; isPaused: boolean }>> {
    const configs = await this.queueConfigRepository.find();

    const result: Array<{ serviceName: string; useQueue: boolean; isPaused: boolean }> = [];
    for (const config of configs) {
      const isPaused = await this.isQueuePaused(config.serviceName);
      result.push({
        serviceName: config.serviceName,
        useQueue: config.useQueue,
        isPaused,
      });
    }

    return result;
  }

  // Método para verificar si un servicio debe usar cola (independiente de si está pausada)
  async shouldUseQueue(serviceName: string): Promise<boolean> {
    const config = await this.getServiceConfig(serviceName);
    // Si está configurado para usar colas, SIEMPRE encolar (pausada o no)
    return config.useQueue;
  }

  // Método separado para verificar si debe PROCESAR la cola
  async shouldProcessQueue(serviceName: string): Promise<boolean> {
    const config = await this.getServiceConfig(serviceName);
    return config.useQueue && !config.isPaused;
  }

  // Obtener lista de servicios registrados
  getRegisteredServices(): string[] {
    return Array.from(this.queueRegistry.keys());
  }
}