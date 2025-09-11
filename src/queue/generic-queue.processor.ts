import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { CarreraService } from '../carrera/carrera.service';

export const GENERIC_QUEUE = 'generic-queue';

export const GENERIC_JOB_TYPES = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  FIND_ALL: 'find-all',
  FIND_ONE: 'find-one'
} as const;

interface GenericJobData {
  serviceName: string;
  operation: 'create' | 'update' | 'delete' | 'find-all' | 'find-one';
  data?: any;
  id?: number;
}

@Processor(GENERIC_QUEUE)
@Injectable()
export class GenericQueueProcessor {
  private readonly logger = new Logger(GenericQueueProcessor.name);
  private serviceRegistry: Map<string, any> = new Map();

  constructor(
    @Inject(CarreraService) private readonly carreraService: CarreraService,
  ) {
    // Registrar servicios disponibles
    this.serviceRegistry.set('carrera', this.carreraService);
  }

  @Process(GENERIC_JOB_TYPES.CREATE)
  async handleCreate(job: Job<GenericJobData>) {
    const { serviceName, data } = job.data;
    this.logger.log(`Procesando trabajo CREATE ${serviceName} - Job ID: ${job.id}`);
    
    try {
      const service = await this.getService(serviceName);
      const result = await service.create(data);
      
      this.logger.log(`${serviceName} creado exitosamente - Job ID: ${job.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creando ${serviceName} - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.UPDATE)
  async handleUpdate(job: Job<GenericJobData>) {
    const { serviceName, data, id } = job.data;
    this.logger.log(`Procesando trabajo UPDATE ${serviceName} - Job ID: ${job.id}`);
    
    try {
      const service = await this.getService(serviceName);
      const result = await service.update(id, data);
      
      this.logger.log(`${serviceName} actualizado exitosamente - Job ID: ${job.id}, ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error actualizando ${serviceName} - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.DELETE)
  async handleDelete(job: Job<GenericJobData>) {
    const { serviceName, id } = job.data;
    this.logger.log(`Procesando trabajo DELETE ${serviceName} - Job ID: ${job.id}`);
    
    try {
      const service = await this.getService(serviceName);
      const result = await service.remove(id);
      
      this.logger.log(`${serviceName} eliminado exitosamente - Job ID: ${job.id}, ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error eliminando ${serviceName} - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.FIND_ALL)
  async handleFindAll(job: Job<GenericJobData>) {
    const { serviceName } = job.data;
    this.logger.log(`Procesando trabajo FIND_ALL ${serviceName} - Job ID: ${job.id}`);
    
    try {
      const service = await this.getService(serviceName);
      const result = await service.findAll();
      
      this.logger.log(`${serviceName} findAll ejecutado exitosamente - Job ID: ${job.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error en findAll ${serviceName} - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }

  @Process(GENERIC_JOB_TYPES.FIND_ONE)
  async handleFindOne(job: Job<GenericJobData>) {
    const { serviceName, id } = job.data;
    this.logger.log(`Procesando trabajo FIND_ONE ${serviceName} - Job ID: ${job.id}`);
    
    try {
      const service = await this.getService(serviceName);
      const result = await service.findOne(id);
      
      this.logger.log(`${serviceName} findOne ejecutado exitosamente - Job ID: ${job.id}, ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error en findOne ${serviceName} - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }

  private async getService(serviceName: string): Promise<any> {
    const service = this.serviceRegistry.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not registered in processor`);
    }
    return service;
  }

  // Método para registrar nuevos servicios dinámicamente
  registerService(serviceName: string, service: any): void {
    this.serviceRegistry.set(serviceName, service);
    this.logger.log(`Servicio ${serviceName} registrado en el procesador`);
  }
}