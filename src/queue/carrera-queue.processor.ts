import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { CarreraService } from '../carrera/carrera.service';

export const CARRERA_QUEUE = 'carrera-queue';

export const CARRERA_JOB_TYPES = {
  CREATE: 'create-carrera',
  UPDATE: 'update-carrera',
  DELETE: 'delete-carrera'
} as const;

@Processor(CARRERA_QUEUE)
@Injectable()
export class CarreraQueueProcessor {
  private readonly logger = new Logger(CarreraQueueProcessor.name);

  constructor(private readonly carreraService: CarreraService) {}

  @Process(CARRERA_JOB_TYPES.CREATE)
  async handleCreate(job: Job) {
    this.logger.log(`Procesando trabajo CREATE carrera - Job ID: ${job.id}`);
    
    try {
      const { createCarreraDto } = job.data;
      const result = await this.carreraService.create(createCarreraDto);
      
      this.logger.log(`Carrera creada exitosamente - Job ID: ${job.id}, Carrera ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creando carrera - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }

  @Process(CARRERA_JOB_TYPES.UPDATE)
  async handleUpdate(job: Job) {
    this.logger.log(`Procesando trabajo UPDATE carrera - Job ID: ${job.id}`);
    
    try {
      const { id, updateCarreraDto } = job.data;
      const result = await this.carreraService.update(id, updateCarreraDto);
      
      this.logger.log(`Carrera actualizada exitosamente - Job ID: ${job.id}, Carrera ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error actualizando carrera - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }

  @Process(CARRERA_JOB_TYPES.DELETE)
  async handleDelete(job: Job) {
    this.logger.log(`Procesando trabajo DELETE carrera - Job ID: ${job.id}`);
    
    try {
      const { id } = job.data;
      const result = await this.carreraService.remove(id);
      
      this.logger.log(`Carrera eliminada exitosamente - Job ID: ${job.id}, Carrera ID: ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error eliminando carrera - Job ID: ${job.id}`, error.stack);
      throw error;
    }
  }
}