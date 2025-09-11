import { CarreraService } from './../carrera/carrera.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { randomUUID } from 'crypto';
import { QueueConfigService } from './queue-config.service';
import { GENERIC_QUEUE, GENERIC_JOB_TYPES } from './generic-queue.processor';

@Injectable()
export class GenericWrapperService {
  private readonly logger = new Logger(GenericWrapperService.name);
  private readonly serviceRegistry: Map<string, any> = new Map();
  constructor(
    @InjectQueue(GENERIC_QUEUE) private genericQueue: Queue,
    private readonly queueConfigService: QueueConfigService,
    @Inject(CarreraService) private readonly carreraService: CarreraService,
  ) {
    // Debug logs
    this.logger.log(`CarreraService inyectado: ${!!this.carreraService}`);
    
    // Registrar servicios disponibles
    this.serviceRegistry.set('carrera', this.carreraService);
    
    this.logger.log(`Registry después del registro: ${this.serviceRegistry.size}`);
    this.logger.log(`Carrera está registrado: ${this.serviceRegistry.has('carrera')}`);
  }

  // Factory method para crear wrapper de cualquier servicio
  createServiceWrapper(serviceName: string) {
    return {
      create: (createDto: any) => this.handleCreate(serviceName, createDto),
      findAll: () => this.handleFindAll(serviceName),
      findOne: (id: number) => this.handleFindOne(serviceName, id),
      update: (id: number, updateDto: any) =>
        this.handleUpdate(serviceName, id, updateDto),
      remove: (id: number) => this.handleRemove(serviceName, id),
    };
  }

  private async handleCreate(serviceName: string, createDto: any) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando creación de ${serviceName}`);

      const job = await this.genericQueue.add(GENERIC_JOB_TYPES.CREATE, {
        serviceName,
        operation: 'create',
        data: createDto,
      }, {
        jobId: randomUUID() // Asignar un UUID único como ID del trabajo
      });

      return {
        message: `${serviceName} encolado para creación`,
        jobId: job.id,
        status: 'queued',
        data: createDto,
      };
    } else {
      this.logger.log(`Ejecutando creación directa de ${serviceName}`);
      const service = await this.getService(serviceName);
      return await service.create(createDto);
    }
  }

  private async handleFindAll(serviceName: string) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando findAll de ${serviceName}`);

      const job = await this.genericQueue.add(GENERIC_JOB_TYPES.FIND_ALL, {
        serviceName,
        operation: 'find-all',
      }, {
        jobId: randomUUID() // Asignar un UUID único como ID del trabajo
      });

      return {
        message: `${serviceName} encolado para consulta`,
        jobId: job.id,
        status: 'queued',
      };
    } else {
      this.logger.log(`Ejecutando findAll directo de ${serviceName}`);
      const service = await this.getService(serviceName);
      return await service.findAll();
    }
  }

  private async handleFindOne(serviceName: string, id: number) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando findOne de ${serviceName} ID: ${id}`);

      const job = await this.genericQueue.add(GENERIC_JOB_TYPES.FIND_ONE, {
        serviceName,
        operation: 'find-one',
        id,
      }, {
        jobId: randomUUID() // Asignar un UUID único como ID del trabajo
      });

      return {
        message: `${serviceName} encolado para consulta por ID`,
        jobId: job.id,
        status: 'queued',
        id,
      };
    } else {
      this.logger.log(`Ejecutando findOne directo de ${serviceName} ID: ${id}`);
      const service = await this.getService(serviceName);
      return await service.findOne(id);
    }
  }

  private async handleUpdate(serviceName: string, id: number, updateDto: any) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando actualización de ${serviceName} ID: ${id}`);

      const job = await this.genericQueue.add(GENERIC_JOB_TYPES.UPDATE, {
        serviceName,
        operation: 'update',
        id,
        data: updateDto,
      }, {
        jobId: randomUUID() // Asignar un UUID único como ID del trabajo
      });

      return {
        message: `${serviceName} encolado para actualización`,
        jobId: job.id,
        status: 'queued',
        id,
        data: updateDto,
      };
    } else {
      this.logger.log(
        `Ejecutando actualización directa de ${serviceName} ID: ${id}`,
      );
      const service = await this.getService(serviceName);
      return await service.update(id, updateDto);
    }
  }

  private async handleRemove(serviceName: string, id: number) {
    const shouldUseQueue =
      await this.queueConfigService.shouldUseQueue(serviceName);

    if (shouldUseQueue) {
      this.logger.log(`Encolando eliminación de ${serviceName} ID: ${id}`);

      const job = await this.genericQueue.add(GENERIC_JOB_TYPES.DELETE, {
        serviceName,
        operation: 'delete',
        id,
      }, {
        jobId: randomUUID() // Asignar un UUID único como ID del trabajo
      });

      return {
        message: `${serviceName} encolado para eliminación`,
        jobId: job.id,
        status: 'queued',
        id,
      };
    } else {
      this.logger.log(
        `Ejecutando eliminación directa de ${serviceName} ID: ${id}`,
      );
      const service = await this.getService(serviceName);
      return await service.remove(id);
    }
  }

  private async getService(serviceName: string): Promise<any> {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not registered in wrapper`);
    }
    return service;
  }

  // Método para registrar nuevos servicios dinámicamente
  registerService(serviceName: string, service: any): void {
    this.serviceRegistry.set(serviceName, service);
    this.logger.log(`Servicio ${serviceName} registrado en el wrapper`);
  }
}
